import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subscription,
  filter,
  first,
  firstValueFrom,
  take,
} from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Stock, myStock, pendingTrades } from 'src/app/model';
import { Service } from 'src/app/services';
import { StocksServices } from 'src/app/stocksServices';
import { WebSocketAPI } from 'src/app/webSocketService';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = false;
  }

  service = inject(Service);
  stockService = inject(StocksServices);
  webSocket = inject(WebSocketAPI);
  dialog = inject(MatDialog);
  router = inject(Router);
  sub$!: Subscription;
  Math = Math;
  stockString: string = '';
  connectedPort: boolean = false;

  ngOnInit(): void {
    if (
      this.stockService.myStockList.length == 0 ||
      this.stockService.change === true
    ) {
      if (this.service.user_id !== undefined) {
        let seenSymbols = new Set();
        firstValueFrom(this.stockService.getStocksList(this.service.user_id))
          .then((result) => {
            this.stockService.myStockList = result.stock;
            this.aggregateStocks();
            for (let c of this.stockService.myStockList) {
              if (!seenSymbols.has(c.symbol)) {
                this.stockString += c.symbol + ',';
                seenSymbols.add(c.symbol);
              }
            }
            return firstValueFrom(
              this.stockService.getPendingOrders(this.service.user_id)
            );
          })
          .then((result) => {
            this.stockService.pendingTrades = result.stock;
            for (let p of this.stockService.pendingTrades) {
              if (!seenSymbols.has(p.symbol)) {
                this.stockString += p.symbol + ',';
                seenSymbols.add(p.symbol);
              }
            }
            return firstValueFrom(
              this.stockService.yahooOneStock(this.stockString)
            );
          })
          .then((stockResult) => {
            for (let c of this.stockService.myStockList) {
              const correspondingStock = stockResult.stock.find(
                (stock: { symbol: string }) => stock.symbol === c.symbol
              );
              if (correspondingStock) {
                c.percentageChange = this.stockService.PercentChange(
                  c.price,
                  correspondingStock.regularMarketPrice
                );
                c.currentPrice = correspondingStock.regularMarketPrice;
                c.profit =
                  (correspondingStock.regularMarketPrice - c.price) *
                  c.quantity;
              }
            }
            for (let p of this.stockService.pendingTrades) {
              const correspondingStock = stockResult.stock.find(
                (stock: { symbol: string }) => stock.symbol === p.symbol
              );
              if (correspondingStock) {
                p.currentPrice = correspondingStock.regularMarketPrice;
              }
            }
            this.updatePendingStock();
          });
      }
      this.stockService.change = false;
    }
  }

  updatePendingString() {
    let pendingString = '';
    let seenOrders = new Set();
    for (let p of this.stockService.pendingTrades) {
      if (!seenOrders.has(p.symbol)) {
        pendingString += p.symbol + ',';
        seenOrders.add(p.symbol);
      }
    }
    this.webSocket.sendPendingOrders(this.service.user_id, pendingString);
  }

  updatePendingStock() {
    this.webSocket.isConnected
      .pipe(
        filter((connected) => connected),
        take(1)
      )
      .subscribe(() => {
        this.webSocket.subscribeToPendingOrders();
        this.connectedPort = true;
        this.updatePendingString();
        this.getUpdates();
      });
  }

  getUpdates() {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
    this.sub$ = this.webSocket.pendingOrder$.subscribe((update) => {
      this.stockService.pendingTrades.forEach((trade) => {
        const matchingUpdate = update.find(
          (x: any) => trade.symbol.toLowerCase() === x.symbol.toLowerCase()
        );
        if (matchingUpdate) {
          trade.currentPrice = matchingUpdate.regularMarketPrice;
        }
      });
      this.checkPrice();
    });
  }

  checkPrice() {
    this.stockService.pendingTrades.forEach((trade, index) => {
      if (trade.buyOrSell === 'buy') {
        this.buy(trade, index);
      }
      if (trade.buyOrSell === 'sell') {
        this.sell(trade, index);
      }
    });
  }

  buy(trade: pendingTrades, index: number) {
    if (trade.price >= trade.currentPrice) {
      firstValueFrom(
        this.stockService.orderStock(
          trade.currentPrice,
          trade.currentPrice * trade.quantity,
          trade.quantity,
          trade.orderType,
          trade.buyOrSell,
          this.service.user_id,
          trade.symbol,
          trade.name
        )
      ).then(
        (result) => {
          this.dialog.open(DialogComponent, {
            data: {
              Message:
                'Bought ' +
                this.stockService.pendingTrades[index].quantity +
                ' ' +
                this.stockService.pendingTrades[index].name +
                ' at ' +
                '$' +
                this.stockService.pendingTrades[index].currentPrice,
              success: true,
            },
          });
          return firstValueFrom(
            this.stockService.deletePendingOrders(
              this.stockService.pendingTrades[index],
              this.service.user_id
            )
          ).then((result) => {
            this.stockService.change = true;
            let stock: myStock = {
              buyOrSell: this.stockService.pendingTrades[index].buyOrSell,
              symbol: this.stockService.pendingTrades[index].symbol,
              name: this.stockService.pendingTrades[index].name,
              orderType: this.stockService.pendingTrades[index].orderType,
              price: this.stockService.pendingTrades[index].currentPrice,
              quantity: this.stockService.pendingTrades[index].quantity,
              amount:
                this.stockService.pendingTrades[index].currentPrice *
                this.stockService.pendingTrades[index].quantity,
              currentPrice: this.stockService.pendingTrades[index].currentPrice,
              profit: 0,
              percentageChange: 0,
            };
            this.stockService.myStockList = [
              ...this.stockService.myStockList,
              stock,
            ];
            this.stockService.pendingTrades =
              this.stockService.pendingTrades.filter((_, i) => i !== index);
            this.updatePendingString();
          });
        },
        (error) => {
          this.dialog.open(DialogComponent, {
            data: { Message: error.error, success: false },
          });
        }
      );
    }
  }

  sell(trade: pendingTrades, index: number) {
    if (trade.price <= trade.currentPrice) {
      // need to check whether myStock has the stock

      firstValueFrom(
        this.stockService.orderStock(
          trade.currentPrice,
          trade.currentPrice * trade.quantity,
          trade.quantity,
          trade.orderType,
          trade.buyOrSell,
          this.service.user_id,
          trade.symbol,
          trade.name
        )
      ).then(
        (result) => {
          this.dialog.open(DialogComponent, {
            data: {
              Message:
                'Sold ' +
                this.stockService.pendingTrades[index].quantity +
                ' ' +
                this.stockService.pendingTrades[index].name +
                ' at ' +
                '$' +
                this.stockService.pendingTrades[index].currentPrice,
              success: true,
            },
          });
          return firstValueFrom(
            this.stockService.deletePendingOrders(
              this.stockService.pendingTrades[index],
              this.service.user_id
            )
          ).then((result) => {
            this.stockService.change = true;
            let stock: myStock = {
              buyOrSell: this.stockService.pendingTrades[index].buyOrSell,
              symbol: this.stockService.pendingTrades[index].symbol,
              name: this.stockService.pendingTrades[index].name,
              orderType: this.stockService.pendingTrades[index].orderType,
              price: this.stockService.pendingTrades[index].currentPrice,
              quantity: this.stockService.pendingTrades[index].quantity,
              amount:
                this.stockService.pendingTrades[index].currentPrice *
                this.stockService.pendingTrades[index].quantity,
              currentPrice: this.stockService.pendingTrades[index].currentPrice,
              profit: 0,
              percentageChange: 0,
            };
            this.stockService.myStockList = [
              ...this.stockService.myStockList,
              stock,
            ];
            this.stockService.pendingTrades =
              this.stockService.pendingTrades.filter((_, i) => i !== index);
            this.updatePendingString();
          });
        },
        (error) => {
          this.dialog.open(DialogComponent, {
            data: { Message: error.error, success: false },
          });
        }
      );
    }
  }

  cancelOrder(index: number) {
    firstValueFrom(
      this.stockService.deletePendingOrders(
        this.stockService.pendingTrades[index],
        this.service.user_id
      )
    ).then((result) => {
      this.stockService.change = true;
      this.stockService.pendingTrades.splice(index, 1);
      this.updatePendingString();
    });
  }

  goToTradeComp(index: number) {
    this.stockService.fromPortfolio = true;
    this.router.navigate(['/trades', index]);
  }

  aggregateStocks(): void {
    let tempStocks: { [key: string]: myStock } = {};

    this.stockService.myStockList.forEach((curr) => {
      // Check if this stock is already in the tempStocks
      if (tempStocks[curr.symbol]) {
        // Stock is already in tempStocks, update the existing entry
        let originalQuantity = tempStocks[curr.symbol].quantity;
        let newQuantity =
          curr.buyOrSell === 'buy' ? curr.quantity : -curr.quantity;

        // Adjust the price based on whether it's a buy or sell
        if (curr.buyOrSell === 'buy' || originalQuantity + newQuantity > 0) {
          tempStocks[curr.symbol].price =
            (tempStocks[curr.symbol].price * originalQuantity +
              curr.price * newQuantity) /
            (originalQuantity + newQuantity);
        }

        tempStocks[curr.symbol].quantity += newQuantity;
      } else {
        // Stock is not in tempStocks, add it
        tempStocks[curr.symbol] = { ...curr }; // create a copy of the current stock
        if (curr.buyOrSell === 'sell') {
          tempStocks[curr.symbol].quantity = -curr.quantity;
        }
      }
    });

    // Convert the tempStocks object to an array
    this.stockService.myStockList = Object.values(tempStocks);

    // Filter out stocks with zero or negative quantity (bought and sold the same amount or sold more than bought)
    this.stockService.myStockList = this.stockService.myStockList.filter(
      (stock) => stock.quantity > 0
    );
  }

  ngOnDestroy() {
    if (
      this.connectedPort &&
      this.stockService.pendingTrades.length === 0 &&
      this.sub$
    ) {
      this.connectedPort = false;
      this.webSocket.stopPendingOrders(this.service.user_id);
      this.webSocket.unsubscribeFromPendingOrders();
      this.sub$.unsubscribe();
    } else {
    }
  }
}
