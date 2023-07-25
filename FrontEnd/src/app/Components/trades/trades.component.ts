import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { Stock, pendingTrades } from 'src/app/model';
import { Service } from 'src/app/services';
import { StocksServices } from 'src/app/stocksServices';
import { WebSocketAPI } from 'src/app/webSocketService';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogComponent } from '../dialog/dialog.component';
import { TradingLogic } from 'src/app/tradingLogic';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.css'],
})
export class TradesComponent implements OnInit, OnDestroy {
  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  Form!: FormGroup;
  fb = inject(FormBuilder);
  service = inject(Service);
  stockService = inject(StocksServices);
  webSocket = inject(WebSocketAPI);
  route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  tradingLogic = inject(TradingLogic);
  sub$!: Subscription;
  route$!: Subscription;
  Math = Math;
  stock!: Stock;
  index!: number;
  isLoading = false;
  selectedDuration: string = '5m';
  icon!: string;
  currentStockName: string[] = [];
  quantityOwn!: number;
  whatToDo!: string;

  ngOnInit(): void {
    this.Form = this.createForm();
    this.route$ = this.route.params.subscribe((params) => {
      this.index = params['index'];
    });

    if (!this.stockService.fromPortfolio) {
      this.stock = this.stockService.stockList[this.index];
      this.currentStockName = this.stock.longName.split(/,| /);
      this.getQuantityOwn();
    } else {
      let myStock = this.stockService.myStockList[this.index];
      this.stock = {
        symbol: myStock.symbol,
        longName: myStock.name,
        price: myStock.currentPrice,
        percentageChange: 0,
        date: [],
        close: [],
        open: 0,
        high: 0,
        low: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        isLoading: false,
        ask: 0,
        askSize: 0,
        bid: 0,
        bidSize: 0,
        priceToBook: 0,
        dividendDate: '',
        epsForward: 0,
        epsTrailingTwelveMonths: 0,
        forwardPE: 0,
        trailingPE: 0,
        averageDailyVolume10Day: 0,
      };
      this.currentStockName = this.stock.longName.split(/,| /);
      this.getQuantityOwn();
    }
    this.whatToDo=this.tradingLogic.advancedTradingLogic(this.stock);
    firstValueFrom(this.stockService.getIcon(this.currentStockName[0])).then(
      (result) => {
        this.icon = result.icon;
      }
    );
    this.webSocket.subscribeToStocks();
    this.webSocket.send(
      this.service.user_id,
      this.stock.symbol,
      this.selectedDuration
    );
    //subscribing to msg
    this.getUpdates(this.selectedDuration);
  }

  createForm() {
    this.Form = this.fb.group({
      orderType: ['', Validators.required],
      price: [
        { value: '', disabled: true },
        [Validators.required, Validators.min(1)],
      ],
      quantity: ['', [Validators.required, Validators.min(1)]],
      amount: ['', Validators.required],
    });

    this.Form.get('orderType')?.valueChanges.subscribe((val) => {
      if (val === 'limit') {
        this.Form.get('price')?.enable();
      } else {
        this.Form.get('price')?.disable();
        this.Form.get('price')?.setValue(this.stock.price);
      }
      this.calculateAmount();
    });

    this.Form.get('price')
      ?.valueChanges.pipe(
        debounceTime(500),
        map(() => this.calculateAmount())
      )
      .subscribe();

    this.Form.get('quantity')
      ?.valueChanges.pipe(
        debounceTime(500),
        map(() => this.calculateAmount())
      )
      .subscribe();
    return this.Form;
  }

  calculateAmount() {
    let price = this.Form.get('price')?.value;
    let quantity = this.Form.get('quantity')?.value;

    if (this.Form.get('orderType')?.value === 'market') {
      price = this.stock.price;
    }

    if (price && quantity) {
      this.Form.get('amount')?.setValue(price * quantity, { emitEvent: false });
    }
  }

  submit(orderType: string) {
    const formValue = this.Form.value;

    if (orderType === 'buy' && this.service.getBalance() < formValue.amount) {
      this.showInsufficientFundsDialog();
      return;
    }

    if (formValue.orderType === 'market') {
      this.order(formValue, orderType);
    } else if (formValue.orderType === 'limit') {
      this.handleLimitOrder(formValue, orderType);
    }
  }

  showInsufficientFundsDialog() {
    this.dialog.open(DialogComponent, {
      data: { Message: 'Insufficient Funds', success: false },
    });
  }

  handleLimitOrder(formValue: any, orderType: string) {
    //process buy if current price <= bid  //process sell if current price >=sell order
    const priceCondition =
      orderType === 'buy'
        ? this.stock.price <= formValue.price
        : this.stock.price >= formValue.price;
    if (priceCondition) {
      formValue.price = this.stock.price;
      this.order(formValue, orderType);
    } else {
      this.pushPendingTrade(formValue, orderType);
      this.stockService.change = true;
    }
  }

  order(formValue: any, orderType: string) {
    firstValueFrom(
      this.stockService.orderStock(
        formValue.price,
        formValue.amount,
        formValue.quantity,
        formValue.orderType,
        orderType,
        this.service.user_id,
        this.stock.symbol,
        this.stock.longName
      )
    ).then((result) => {
      this.stockService.change = true;
      this.dialog.open(DialogComponent, {
        data: { Message: 'success', success: true },
      });
    });
  }

  pushPendingTrade(formValue: any, orderType: string) {
    let pendingTrade: pendingTrades = {
      buyOrSell: orderType,
      symbol: this.stock.symbol,
      name: this.stock.longName,
      orderType: formValue.orderType,
      price: formValue.price,
      currentPrice: this.stock.price,
      quantity: formValue.quantity,
      amount: formValue.amount,
      status: 'pending',
    };
    this.stockService.pendingTrades.push(pendingTrade);
    firstValueFrom(
      this.stockService.insertPendingOrder(pendingTrade, this.service.user_id)
    ).then(
      (result) => {
        this.dialog.open(DialogComponent, {
          data: { Message: result.status, success: true },
        });
      },
      (error) => {
        this.dialog.open(DialogComponent, {
          data: { Message: 'Error occurred, please try again', success: false },
        });
      }
    );
  }

  getGraph(period: string) {
    this.selectedDuration = period;
    this.stockService.getNewStock(
      this.service.user_id,
      this.stock.symbol,
      period
    );
    this.getUpdates(period);
  }

  getUpdates(period: string) {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
    this.sub$ = this.webSocket.stock$.subscribe((update) => {
      let oldStock: Stock = { ...this.stock };
      oldStock.price = update.regularMarketPrice || oldStock.price;
      oldStock.open = update.regularMarketOpen || oldStock.open;
      oldStock.high = update.regularMarketDayHigh || oldStock.high;
      oldStock.low = update.regularMarketDayLow || oldStock.low;
      //extra info
      oldStock.ask = update.ask || oldStock.ask;
      oldStock.askSize = update.askSize || oldStock.askSize;
      oldStock.bid = update.bid || oldStock.bid;
      oldStock.bidSize = update.bidSize || oldStock.bidSize;
      oldStock.priceToBook = update.priceToBook || oldStock.priceToBook;
      oldStock.dividendDate = update.dividendDate
        ? this.stockService.formatDate(update.dividendDate.timestamp)
        : 'no est.';
      oldStock.epsForward = update.epsForward || oldStock.epsForward;
      oldStock.epsTrailingTwelveMonths =
        update.epsTrailingTwelveMonths || oldStock.epsTrailingTwelveMonths;
      oldStock.forwardPE = update.forwardPE || oldStock.forwardPE;
      oldStock.trailingPE = update.trailingPE || oldStock.trailingPE;
      oldStock.fiftyTwoWeekHigh =
        update.fiftyTwoWeekHigh || oldStock.fiftyTwoWeekHigh;
      oldStock.fiftyTwoWeekLow =
        update.fiftyTwoWeekLow || oldStock.fiftyTwoWeekLow;
      oldStock.averageDailyVolume10Day =
        update.averageDailyVolume10Day || oldStock.averageDailyVolume10Day;

      if (this.stockService.marketOpen()) {
        oldStock.percentageChange = this.getPercentageChange(
          update.regularMarketOpen,
          update.regularMarketPrice
        );
      } else {
        oldStock.percentageChange = update.regularMarketChangePercent;
      }

      if (update.graphDetails && update.graphDetails.items) {
        let data = update.graphDetails.items;
        let tempDates = [];
        let tempCloses = [];
        for (let key in data) {
          if (data.hasOwnProperty(key) && !isNaN(Number(key))) {
            let close = data[key].close;
            let date = this.dateConvert(data[key].date_utc, period);
            if (close != 0) {
              tempDates.push(date);
              tempCloses.push(close);
            }
          }
        }
        oldStock.date = tempDates;
        oldStock.close = tempCloses;
      }
      this.stock = { ...this.stock, ...oldStock };
      this.whatToDo=this.tradingLogic.advancedTradingLogic(this.stock);
    });
  }

  getPercentageChange(openPrice: number, currentPrice: number) {
    return ((currentPrice - openPrice) * 100) / openPrice;
  }

  dateConvert(dateUTC: string, period: string) {
    const timestamp = parseInt(dateUTC, 10) * 1000;
    const date = new Date(timestamp);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    switch (period) {
      case '5m':
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      case '30m':
        const mhours = date.getHours().toString().padStart(2, '0');
        const mminutes = date.getMinutes().toString().padStart(2, '0');
        const mdays = date.getDate().toString().padStart(2, '0');
        return `${mdays}/${mhours}:${mminutes}`;
      case '1h':
        const hhours = date.getHours().toString().padStart(2, '0');
        const hminutes = date.getMinutes().toString().padStart(2, '0');
        const hdays = date.getDate().toString().padStart(2, '0');
        return `${hdays}/${hhours}:${hminutes} `;
      case '1d':
        const day = date.getDate().toString().padStart(2, '0');
        const month = monthNames[date.getMonth()];
        return `${day}/${month}`;
      case '1mo':
        const months = monthNames[date.getMonth()];
        const years = date.getFullYear().toString().slice(-2);
        return `${months}/${years}`;
      default:
        return 'hi';
    }
  }

  getQuantityOwn() {
    this.quantityOwn = this.stockService.myStockList.reduce((total, item) => {
      if (item.symbol === this.stock.symbol) {
        total += item.quantity;
      }
      return total;
    }, 0);
  }

  ngOnDestroy() {
    if (this.sub$) {
      this.stockService.fromPortfolio = false;
      this.webSocket.stop(this.service.user_id);
      this.webSocket.unsubscribeFromStocks();
      this.sub$.unsubscribe();
    }
  }
}
