export interface Stock {
  symbol: string;
  longName: string;
  price: number;
  percentageChange: number;
  date: string[];
  close: number[];
  open: number;
  high: number;
  low: number;
  fiftyTwoWeekHigh:number;
  fiftyTwoWeekLow:number;
  isLoading: boolean;
  ask:number;
  askSize:number;
  bid:number;
  bidSize:number;
  priceToBook:number;
  dividendDate:string;
  epsForward:number;
  epsTrailingTwelveMonths:number;
  forwardPE:number;
  trailingPE:number;
  averageDailyVolume10Day:number;
}

export interface myStock {
  buyOrSell: string;
  symbol: string;
  name: string;
  orderType: string;
  price: number;
  quantity: number;
  amount: number;
  currentPrice: number;
  profit: number;
  percentageChange: number;
}

export interface pendingTrades {
  buyOrSell: string;
  symbol: string;
  name: string;
  orderType: string;
  price: number;
  currentPrice: number;
  quantity: number;
  amount: number;
  status: string;
}

export interface AccountFund {
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: string;
  datetime: string;
}

export interface User {
  user_id: string;
  name: string;
  accountType: string;
  assets: AccountFund[];
  userEmail: string;
}
