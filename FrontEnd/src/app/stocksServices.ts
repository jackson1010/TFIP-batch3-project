import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { myStock, pendingTrades, Stock } from './model';
import { WebSocketAPI } from './webSocketService';

@Injectable()
export class StocksServices {
  http = inject(HttpClient);
  webSocket = inject(WebSocketAPI);
  myStockList: myStock[] = [];
  empty: boolean = true;
  stockList: Stock[] = [];
  change: boolean = false;
  fromPortfolio: boolean = false;
  pendingTrades: pendingTrades[] = [
    {
      buyOrSell: 'buy',
      symbol: 'TSLA',
      name: 'Tesla Inc',
      orderType: 'limit',
      price: 2.23,
      currentPrice: 189.2,
      quantity: 20,
      amount: 20.22,
      status: 'pending',
    },
  ];

  liveStock(symbol: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/stock/' + symbol, { headers });
  }

  getStocksList(user_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/myStock/' + user_id, { headers });
  }

  yahooOneStock(symbol: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/yahooStock/' + symbol, { headers });
  }

  yahooTrendyStock(): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/yahooActiveStock', { headers });
  }

  getIcon(name: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/icon/' + name, { headers });
  }

  yahooGraph(symbol: string, timing: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/yahooGraph/' + symbol + '/' + timing, {
      headers,
    });
  }

  getNewStock(user_id: string, symbol: string, timing: string) {
    this.webSocket.send(user_id, symbol, timing);
  }

  PercentChange(myPrice: number, dayPrice: number): number {
    return ((dayPrice - myPrice) / myPrice) * 100;
  }

  totalPL() {
    let totalCostPrice = 0;
    let totalCurrPrice = 0;

    // Check if myStockList is not empty
    if (this.myStockList && this.myStockList.length > 0) {
      for (let c of this.myStockList) {
        totalCostPrice += c.price * c.quantity;
        totalCurrPrice += c.currentPrice * c.quantity;
      }
      return ((totalCurrPrice - totalCostPrice) * 100) / totalCostPrice;
    } else {
      return 0;
    }
  }

  orderStock(
    purchasePrice: number,
    amount: number,
    quantity: number,
    marketOrLimit: string,
    orderType: string,
    user_id: string,
    symbol: string,
    longName: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    let price = 0;
    if (purchasePrice == null) {
      price = parseFloat((amount / quantity).toFixed(2));
    } else {
      price = purchasePrice;
    }

    const body = {
      buyOrSell: orderType,
      orderType: marketOrLimit,
      price: price,
      quantity: quantity,
      amount: amount,
      user_id: user_id,
      symbol: symbol,
      longName: longName,
    };
    return this.http.post<any>('/api/orderStock', body, { headers });
  }

  insertPendingOrder(
    pendingTrade: pendingTrades,
    user_id: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      buyOrSell: pendingTrade.buyOrSell,
      orderType: pendingTrade.orderType,
      price: pendingTrade.price,
      quantity: pendingTrade.quantity,
      amount: pendingTrade.amount,
      user_id: user_id,
      symbol: pendingTrade.symbol,
      longName: pendingTrade.name,
      status: 'pending',
    };

    return this.http.post<any>('/api/insertPendingOrder', body, { headers });
  }

  getPendingOrders(user_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/getPendingOrders/' + user_id, { headers });
  }

  deletePendingOrders(
    pendingTrade: pendingTrades,
    user_id: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      buyOrSell: pendingTrade.buyOrSell,
      orderType: pendingTrade.orderType,
      price: pendingTrade.price,
      quantity: pendingTrade.quantity,
      amount: pendingTrade.amount,
      user_id: user_id,
      symbol: pendingTrade.symbol,
      longName: pendingTrade.name,
      status: 'pending',
    };

    return this.http.post<any>('/api/deletePendingOrders', body, { headers });
  }

  formatDate(unixTimestamp: string): string {
    console.log(unixTimestamp);
    let date = new Date(Number(unixTimestamp) * 1000);
    let day = ('0' + date.getUTCDate()).slice(-2);
    let month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    let year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  marketOpen(): boolean {
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();

    // Check if it's Tuesday to Friday// Check if it's after 9:30 PM // Check if it's before 4 AM
    if (
      currentDay > 1 &&
      currentDay < 6 &&
      (currentHours > 21 ||
        (currentHours == 21 && currentMinutes >= 30) ||
        currentHours < 4)
    ) {
      console.log('market open');
      return true;
    } else {
      console.log('market close');
      return false;
    }
  }
}
