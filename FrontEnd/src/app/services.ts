import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountFund, User, pendingTrades } from './model';
import { StocksServices } from './stocksServices';

@Injectable()
export class Service {
  http = inject(HttpClient);
  stockService = inject(StocksServices);
  name!: string;
  user_id!: string;
  accountType!: String;
  assets!: AccountFund[];
  userEmail!: string;
  user: User = {
    user_id: '1',
    name: 'John Doe',
    accountType: 'Standard',
    assets: [], // The assets array is empty.
    userEmail: 'john.doe@example.com',
  };
  isGoogleLoggedIn!: boolean;

  signupViaGoogle(idToken: string, email: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      idToken: idToken,
      email: email,
    };
    return this.http.post<any>('/api/auth/signupViaGoogle', body, {
      headers,
      observe: 'response',
    });
  }

  signup(
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');

    const body = {
      firstName: firstname,
      lastName: lastname,
      email: email,
      password: password,
    };

    return this.http.post<any>('/api/auth/signup', body, {
      headers,
      observe: 'response',
    });
  }

  signinViaGoogle(idToken: string, email: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      idToken: idToken,
      email: email,
    };
    return this.http.post<any>('/api/auth/signinViaGoogle', body, {
      headers,
      observe: 'response',
    });
  }

  authenticate(email: string, password: any): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');

    const body = {
      email: email,
      password: password,
    };

    return this.http.post<any>('/api/auth/signin', body, {
      headers,
      observe: 'response',
    });
  }

  getHoldingAmount() {
    let amount = 0;
    amount += this.stockService.pendingTrades.reduce((sum, PT) => {
      return sum + PT.price * PT.quantity;
    }, 0); // Initialized with 0
    return amount;
  }

  getTotalAmount() {
    let totalAmount = 0;
    if (this.assets !== undefined) {
      totalAmount += this.assets.reduce((sum, asset) => {
        if (asset.status === 'signedUp' || asset.status === 'succeeded') {
          return sum + asset.amount;
        } else {
          return sum;
        }
      }, 0);
    }
    return totalAmount;
  }

  getBalance() {
    let balance = 0;

    if (this.assets !== undefined) {
      balance += this.assets.reduce((sum, asset) => {
        if (asset.status === 'signedUp' || asset.status === 'succeeded') {
          return sum + asset.amount;
        } else {
          return sum;
        }
      }, 0);
    }

    if (this.stockService.myStockList !== undefined) {
      balance += this.stockService.myStockList.reduce((sum, stock) => {
        // If the stock is bought, subtract from the balance
        if (stock.buyOrSell === 'buy') {
          return sum - stock.price * stock.quantity;
        }
        // If the stock is sold, add to the balance
        else if (stock.buyOrSell === 'sell') {
          return sum + stock.price * stock.quantity;
        } else {
          return sum;
        }
      }, 0);
    }

    balance -= this.getHoldingAmount();

    return balance;
  }

  getTotalAssets() {
    let totalAssets = 0;
    if (this.stockService.myStockList !== undefined) {
      totalAssets += this.stockService.myStockList.reduce((sum, stock) => {
        return sum + stock.currentPrice * stock.quantity;
      }, 0);
      totalAssets += this.getBalance();
    }
    return totalAssets;
  }

  email(
    firstname: string,
    lastname: string,
    email: string,
    password: any
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    let body;

    if (lastname === 'undefined') {
      body = {
        name: firstname,
        toemail: email,
        password: password,
      };
    } else {
      body = {
        name: lastname,
        toemail: email,
        password: password,
      };
    }

    return this.http.post<any>('/api/email', body, {
      headers,
      withCredentials: true,
    });
  }

  changePassword(
    oldPassword: string,
    password: string,
    email: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      oldPassword: oldPassword,
      password: password,
      email: email,
    };
    return this.http.post<any>('/api/changePassword', body, {
      headers,
      withCredentials: true,
    });
  }

  pay(
    id: string,
    amount: number,
    email: string,
    accountId: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      id: id,
      amount: amount,
      email: email,
      accountId: accountId,
    };
    return this.http.post<any>('/api/pay', body, {
      headers,
      withCredentials: true,
    });
  }

  withdraw(formValue: any): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    const body = {
      account: formValue.account,
      address: formValue.address,
      amount: formValue.amount,
      bankName: formValue.bankName,
      code: formValue.code,
      country: formValue.country,
      name: formValue.name,
      user_id: this.user_id,
      email: this.userEmail,
    };
    return this.http.post<any>('/api/withdraw', body, {
      headers,
      withCredentials: true,
    });
  }

  getServerSentEvent(url: string): Observable<any> {
    return new Observable((observer) => {
      const eventSource = this.getEventSource(url);
      eventSource.onmessage = (event) => {
        observer.next(event);
      };
      eventSource.onerror = (error) => {
        observer.error(error);
      };
    });
  }

  private getEventSource(url: string): EventSource {
    return new EventSource(url);
  }

  getAccountFunds(user_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<any>('/api/getAccountFunds/' + user_id, {
      headers,
      withCredentials: true,
    });
  }
}
