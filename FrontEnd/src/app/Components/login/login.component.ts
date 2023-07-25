import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Service } from 'src/app/services';

import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { AppComponent } from 'src/app/app.component';
import { StorageServices } from 'src/app/storageServices';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  fb = inject(FormBuilder);
  router = inject(Router);
  services = inject(Service);
  storageServices = inject(StorageServices);
  hideNavbar = true;
  hideHeader = true;

  //angular material
  dialog = inject(MatDialog);
  isLoading = false;
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = true;
  }

  //routeguard
  autheSvc = inject(AuthService);
  authenticated$!: Observable<any>;

  //google
  authService = inject(SocialAuthService);
  authStateSubscription!: Subscription;
  user!: SocialUser;

  ngOnInit(): void {
    this.loginForm = this.createForm();
    this.authStateSubscription = this.authService.authState.subscribe(
      (user) => {
        this.user = user;
        const email = user.email;
        const id = user.id;
        const idToken = user.idToken;
        firstValueFrom(this.services.signinViaGoogle(idToken, email))
          .then((result) => {
            const jwtToken = result.headers.get('Authorization');
            this.storageServices.saveToken(jwtToken);
            this.set(result.body);
            this.services.userEmail = email;
            this.autheSvc.loggedIn = true;
            this.services.isGoogleLoggedIn = true;
            this.router.navigate(['/main']);
          })
          .catch((error) => {
            this.dialog.open(DialogComponent, {
              data: { Message: error.error.error, success: false },
            });
          });
      }
    );
  }
  createForm() {
    const form = this.fb.group({
      email: this.fb.control<string>('', [Validators.required]),
      password: this.fb.control<string>('', [Validators.required]),
    });
    return form;
  }

  processForm() {
    const email = this.loginForm.value['email'];
    const password = this.loginForm.value['password'];
    firstValueFrom(this.services.authenticate(email, password))
      .then((result) => {
        const jwtToken = result.headers.get('Authorization');
        this.storageServices.saveToken(jwtToken);
        this.set(result.body);
        this.services.userEmail = email;
        this.services.user.userEmail = email;
        this.storageServices.saveUser(this.services.user);
        this.autheSvc.loggedIn = true;
        this.router.navigate(['/main']);
      })
      .catch((error) => {
        if (error.error === null) {
          let msg = 'Bad Credentials';
          this.dialog.open(DialogComponent, {
            data: { Message: msg, success: false },
          });
        } else {
          this.dialog.open(DialogComponent, {
            data: { Message: error.error.message, success: false },
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  set(result: any) {
    this.services.name = result.Lastname;
    if (result.Lastname == 'undefined') {
      this.services.name = result.Firstname;
    }
    this.services.user.user_id = result.Id;
    this.services.user_id = result.Id;
    this.storageServices.user_id = result.Id;

    this.services.accountType = result.AccountType;
    this.services.user.accountType = result.AccountType;

    this.services.assets = result.Assets;
    this.services.user.assets = result.Assets;
  }
}
