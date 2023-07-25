import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StocksServices } from 'src/app/stocksServices';
import { Subscription, firstValueFrom } from 'rxjs';
import { Stock } from 'src/app/model';

@Component({
  selector: 'app-live-trades',
  templateUrl: './live-trades.component.html',
  styleUrls: ['./live-trades.component.css'],
})
export class LiveTradesComponent implements OnInit {
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = false;
  }
  searchForm!: FormGroup;
  fb = inject(FormBuilder);
  stockService = inject(StocksServices);
  symbol!: string;
  stock!: Stock;
  stock$!: Subscription;
  graph$!: Subscription;

  //angular materials
  dialog = inject(MatDialog);
  Math = Math;

  ngOnInit(): void {
    this.searchForm = this.createForm();
    if (this.stockService.stockList.length === 0) {
      firstValueFrom(this.stockService.yahooTrendyStock()).then((result) => {
        for (let resultStock of result.stock) {
          const stock: Stock = {
            symbol: resultStock.symbol,
            longName: resultStock.longName,
            price: resultStock.regularMarketPrice,
            percentageChange: resultStock.regularMarketChangePercent,
            open: resultStock.regularMarketOpen,
            high: resultStock.regularMarketDayHigh,
            low: resultStock.regularMarketDayLow,
            date: [],
            close: [],
            isLoading: true,
            fiftyTwoWeekHigh: 0,
            fiftyTwoWeekLow: 0,
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
            averageDailyVolume10Day: 0
          };
          this.stockService.stockList.push(stock);
          firstValueFrom(this.stockService.yahooGraph(stock.symbol, '5m')).then(
            (graphResult) => {
              let data = graphResult.stock.items;
              for (let key in data) {
                if (data.hasOwnProperty(key) && !isNaN(Number(key))) {
                  stock.date.push(this.dateConvert(data[key].date_utc));
                  stock.close.push(data[key].close);
                }
              }
              stock.isLoading = false;  
            }
          );
        }
      });
    }
  }

  dateConvert(dateUTC: string) {
    const timestamp = parseInt(dateUTC, 10) * 1000;
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  createForm() {
    const form = this.fb.group({
      symbol: this.fb.control<string>('', [Validators.required]),
    });
    return form;
  }

  processForm() {
    this.symbol = this.searchForm.value['symbol'];
    this.searchForm = this.createForm();
    if (
      this.stockService.stockList.every(
        (stock) => stock.symbol.toLowerCase() !== this.symbol.toLowerCase()
      )
    ) {
      this.stock$ = this.stockService.yahooOneStock(this.symbol).subscribe(
        (result) => {
          this.stock = {
            symbol: '',
            longName: '',
            price: 0,
            percentageChange: 0,
            open: 0,
            high: 0,
            low: 0,
            fiftyTwoWeekHigh: 0,
            fiftyTwoWeekLow: 0,
            date: [],
            close: [],
            isLoading: true,
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
          if (result.stock[0].longName != null) {

            this.stock.symbol = result.stock[0].symbol || 'null';
            this.stock.longName = result.stock[0].longName || 'null';
            this.stock.price = result.stock[0].regularMarketPrice || 0;
            this.stock.percentageChange = result.stock[0].regularMarketChangePercent || 0;
            this.stock.open = result.stock[0].regularMarketOpen || 0;
            this.stock.high = result.stock[0].regularMarketDayHigh || 0;
            this.stock.low = result.stock[0].regularMarketDayLow || 0;
            this.stock.ask = result.stock[0].ask || 0;
            this.stock.askSize = result.stock[0].askSize || 0;
            this.stock.bid = result.stock[0].bid || 0;
            this.stock.bidSize = result.stock[0].bidSize || 0;
            this.stock.priceToBook = result.stock[0].priceToBook || 0;
            this.stock.dividendDate = result.stock[0].dividendDate ? this.stockService.formatDate(result.stock[0].dividendDate.timestamp) : "no est.";
            this.stock.epsForward = result.stock[0].epsForward || 0;
            this.stock.epsTrailingTwelveMonths = result.stock[0].epsTrailingTwelveMonths || 0;
            this.stock.forwardPE = result.stock[0].forwardPE || 0;
            this.stock.trailingPE = result.stock[0].trailingPE || 0;
            this.stock.fiftyTwoWeekHigh = result.stock[0].fiftyTwoWeekHigh || 0;
            this.stock.fiftyTwoWeekLow = result.stock[0].fiftyTwoWeekLow || 0;
            this.stock.averageDailyVolume10Day = result.stock[0].averageDailyVolume10Day || 0;

            this.stockService.stockList.unshift(this.stock);

            // Only call yahooGraph API when yahooOneStock API succeeds
            this.graph$ = this.stockService
              .yahooGraph(this.symbol, '5m')
              .subscribe(
                (result) => {
                  let data = result.stock.items;
                  let tempDates = [];
                  let tempCloses = [];
                  for (let key in data) {
                    if (data.hasOwnProperty(key) && !isNaN(Number(key))) {
                      let close = data[key].close;
                      let date = this.dateConvert(data[key].date_utc);
                      if (close != 0) {
                        tempDates.push(date);
                        tempCloses.push(close);
                      }
                    }
                  }
                  this.stock.date = tempDates;
                  this.stock.close = tempCloses;
                  this.stock.isLoading = false;
                },
                (error) => {
                  // Error callback for yahooGraph
                  this.stock.isLoading = false;

                }
              );
          } else {
            this.dialog.open(DialogComponent, {
              data: { errorMessage: 'stock does not exist' },
            });
          }
        },
        (error) => {
          // Error callback for yahooOneStock
          this.stock.isLoading = false;

        }
      );
    }
  }
}
