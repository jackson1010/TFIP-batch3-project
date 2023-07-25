import { Injectable } from '@angular/core';
import { Stock } from './model';

@Injectable()
export class TradingLogic {

advancedTradingLogic(stock: Stock): string {
    let action: string;

    // Buy condition
    if (stock.price < stock.open && stock.priceToBook < 1 && stock.epsForward > 0 && stock.price < stock.fiftyTwoWeekLow) {
        action = 'BUY';
    }
    // Sell condition
    else if (stock.price > stock.open && stock.priceToBook > 2 && stock.epsForward < 0 && stock.price > stock.fiftyTwoWeekHigh) {
        action = 'SELL';
    }
    // Hold condition
    else {
        action = 'HOLD';
    }

    return action;
}

}
