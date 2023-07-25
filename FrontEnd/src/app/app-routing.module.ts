import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { MainComponent } from './Components/main/main.component';
import { SignupComponent } from './Components/signup/signup.component';
import { loginGuard } from './guard.service';
import { ProfileComponent } from './Components/profile/profile.component';
import { PortfolioComponent } from './Components/portfolio/portfolio.component';
import { LiveTradesComponent } from './Components/live-trades/live-trades.component';
import { ProfileDetailsComponent } from './Components/profile-details/profile-details.component';
import { PaymentComponent } from './Components/payment/payment.component';
import { DepositComponent } from './Components/deposit/deposit.component';
import { WithdrawComponent } from './Components/withdraw/withdraw.component';
import { StatementComponent } from './Components/statement/statement.component';
import { TradesComponent } from './Components/trades/trades.component';
import { IndexPageComponent } from './Components/index-page/index-page.component';

const routes: Routes = [
  { path: 'main', component: MainComponent, canActivate:[loginGuard], title: 'welcome' },
  { path: 'index', component: IndexPageComponent, title: 'Zin Investment Inc' },
  { path: 'signup', component: SignupComponent, title: 'signup' },
  { path: 'login', component: LoginComponent, title: 'login' },
  { path: 'profile', component: ProfileComponent,canActivate:[loginGuard], title: 'profile' },
  { path: 'password', component: ProfileDetailsComponent,canActivate:[loginGuard], title: 'details' },
  { path: 'portfolio', component: PortfolioComponent,canActivate:[loginGuard], title: 'portfolio' },
  { path: 'liveTrades', component: LiveTradesComponent,canActivate:[loginGuard], title: 'trading' },
  { path: 'payment',component: PaymentComponent,canActivate: [loginGuard],title: 'payment'},
  { path: 'deposit', component: DepositComponent,canActivate:[loginGuard], title: 'deposit' },
  { path: 'withdraw', component: WithdrawComponent,canActivate:[loginGuard], title: 'withdraw' },
  { path: 'statement', component: StatementComponent,canActivate:[loginGuard], title: 'statement' },
  { path: 'trades/:index', component: TradesComponent,canActivate:[loginGuard], title: 'trades' },
  { path: '**', redirectTo: 'index', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
