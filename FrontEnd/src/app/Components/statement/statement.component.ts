import { Component, OnInit, inject } from '@angular/core';
import { AccountFund } from 'src/app/model';
import { Service } from 'src/app/services';
import { StocksServices } from 'src/app/stocksServices';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.css'],
})
export class StatementComponent implements OnInit {
  service = inject(Service);
  stockService=inject(StocksServices)
  funds!: AccountFund[];

  ngOnInit(): void {
    this.funds = this.service.assets.filter(
      (c) => c.status === 'signedUp' || c.status === 'succeeded'
    );
  }
}
