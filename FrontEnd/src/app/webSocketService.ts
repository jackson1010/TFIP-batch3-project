import { Injectable, inject } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Stomp, Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { StorageServices } from './storageServices';

@Injectable()
export class WebSocketAPI {
  webSocketEndPoint: string = '/api/ws';
  stocksTopic: string = '/topic/stocks/';
  pendingOrdersTopic: string = '/topic/pendingOrders/';
  stompClient!: Client;

  private pendingOrderSubject = new Subject<any>();
  public pendingOrder$ = this.pendingOrderSubject.asObservable();
  private stockSubject = new Subject<any>();
  public stock$ = this.stockSubject.asObservable();
  storageServices = inject(StorageServices);
  websocketConnected: boolean = false;
  public isConnected = new BehaviorSubject<boolean>(false);

  connect() {
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);

    const _this = this;
    let fullStocksTopic = this.stocksTopic + this.storageServices.user_id;
    let fullPendingOrdersTopic =
      this.pendingOrdersTopic + this.storageServices.user_id;

    return new Promise<void>((resolve, reject) => {
      this.stompClient.onConnect = function (frame) {
        // _this.stompClient.subscribe(fullTopic, function (sdkEvent) {
        //   _this.onMessageReceived(sdkEvent);
        // });
        _this.isConnected.next(true);
        resolve();
      };

      this.stompClient.onWebSocketClose = function () {
        _this.isConnected.next(false);
      };

      this.stompClient.onStompError = function (frame) {
        _this.isConnected.next(false);
      };

      this.stompClient.activate();
    });
  }

  subscribeToStocks() {
    let fullStocksTopic = this.stocksTopic + this.storageServices.user_id;
    this.stompClient.subscribe(fullStocksTopic, (sdkEvent) => {
      this.onStockMessageReceived(sdkEvent);
    });
  }

  subscribeToPendingOrders() {
    let fullPendingOrdersTopic =
      this.pendingOrdersTopic + this.storageServices.user_id;
    this.stompClient.subscribe(fullPendingOrdersTopic, (sdkEvent) => {
      this.onPendingOrderMessageReceived(sdkEvent);
    });
  }

  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.deactivate();
    }
  }

  send(user_id: string, symbol: string, timing: string) {
    this.stompClient.publish({
      destination:
        '/api/app/yahooStock/' + user_id + '/' + symbol + '/' + timing,
    });
  }

  sendPendingOrders(user_id: string, pendingString: string) {
    this.stompClient.publish({
      destination:
        '/api/app/yahooStockPending/' +
        user_id +
        '/' +
        pendingString +
        '/' +
        '3m',
    });
  }

  onPendingOrderMessageReceived(sdkEvent: any) {
    let jsonData = this.decodeMessage(sdkEvent);
    this.pendingOrderSubject.next(jsonData);
  }

  onStockMessageReceived(sdkEvent: any) {
    let jsonData = this.decodeMessage(sdkEvent);
    this.stockSubject.next(jsonData);
  }

  // A helper method to decode the message
  decodeMessage(message: IMessage) {
    if (message.isBinaryBody) {
      let enc = new TextDecoder('utf-8');
      let str = enc.decode(message.binaryBody);
      return JSON.parse(str);
    } else {
      return JSON.parse(message.body);
    }
  }

  stop(user_id: string) {
    this.stompClient.publish({
      destination: '/api/app/stopUpdates/' + user_id,
    });
  }

  unsubscribeFromStocks() {
    let fullStocksTopic = this.stocksTopic + this.storageServices.user_id;
    this.stompClient.unsubscribe(fullStocksTopic);
  }

  stopPendingOrders(user_id: string) {
    this.stompClient.publish({
      destination: '/api/app/stopPendingOrders/' + user_id,
    });
  }

  unsubscribeFromPendingOrders() {
    let fullPendingOrdersTopic =
      this.pendingOrdersTopic + this.storageServices.user_id;
    this.stompClient.unsubscribe(fullPendingOrdersTopic);
  }
}
