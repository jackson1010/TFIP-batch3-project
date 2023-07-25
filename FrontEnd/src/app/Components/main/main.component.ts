import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { AccountFund } from 'src/app/model';
import { Service } from 'src/app/services';
import { StocksServices } from 'src/app/stocksServices';
import { WebSocketAPI } from 'src/app/webSocketService';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  constructor(
    private appComponent: AppComponent,
    private webSocket: WebSocketAPI
  ) {
    this.appComponent.hideNavbar = false;
  }
  route = inject(ActivatedRoute);
  name!: string;
  accountType!: String;
  service = inject(Service);
  stockService = inject(StocksServices);

  ngOnInit() {
    if (!this.webSocket.websocketConnected) {
      this.webSocket
        .connect()
        .then(() => {
          this.webSocket.websocketConnected = true;
        })
        .catch((error) => {
          this.webSocket.websocketConnected = false;
        });
    }
  }
}
