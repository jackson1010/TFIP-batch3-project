import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/login/login.component';
import { SignupComponent } from './Components/signup/signup.component';
import { MainComponent } from './Components/main/main.component';
import { Service } from './services';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  GoogleSigninButtonModule,
  SocialLoginModule,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DialogComponent } from './Components/dialog/dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingScreenComponent } from './Components/loading-screen/loading-screen.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { PortfolioComponent } from './Components/portfolio/portfolio.component';
import { LiveTradesComponent } from './Components/live-trades/live-trades.component';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { StocksServices } from './stocksServices';
import { HeaderComponent } from './Components/header/header.component';
import { NgChartsModule } from 'ng2-charts';
import { LineChartComponent } from './Components/line-chart/line-chart.component';
import { MatIconModule } from '@angular/material/icon';
import { ProfileDetailsComponent } from './Components/profile-details/profile-details.component';
import { PaymentComponent } from './Components/payment/payment.component';
import { FormsModule } from '@angular/forms';
import { DepositComponent } from './Components/deposit/deposit.component';
import { WithdrawComponent } from './Components/withdraw/withdraw.component';
import { StatementComponent } from './Components/statement/statement.component';
import { TradesComponent } from './Components/trades/trades.component';
import { IndexPageComponent } from './Components/index-page/index-page.component';
import { WebSocketAPI } from './webSocketService';
import { httpInterceptorProviders } from './HttpInterceptor';
import { StorageServices } from './storageServices';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TradingLogic } from './tradingLogic';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    MainComponent,
    DialogComponent,
    LoadingScreenComponent,
    ProfileComponent,
    PortfolioComponent,
    LiveTradesComponent,
    NavbarComponent,
    HeaderComponent,
    LineChartComponent,
    ProfileDetailsComponent,
    PaymentComponent,
    DepositComponent,
    WithdrawComponent,
    StatementComponent,
    TradesComponent,
    IndexPageComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    GoogleSigninButtonModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgChartsModule,
    MatIconModule,
  ],
  providers: [
    Service,
    AuthService,
    StocksServices,
    WebSocketAPI,
    StorageServices,
    httpInterceptorProviders,
    TradingLogic,

    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '745100295598-ob5arujlv1s1nh025ailag2lutij5us8.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
