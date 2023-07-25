import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Service } from 'src/app/services';
import { DialogComponent } from '../dialog/dialog.component';
import { AppComponent } from 'src/app/app.component';
import { StorageServices } from 'src/app/storageServices';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  signUpForm!: FormGroup;
  fb = inject(FormBuilder);
  services = inject(Service);
  router = inject(Router);
  storageService = inject(StorageServices);

  //angular materials
  dialog = inject(MatDialog);
  isLoading = false;
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = true;
  }

  //facebook
  declare FB: any;

  //authentication
  AuthSvc = inject(AuthService);

  //google login
  authService = inject(SocialAuthService);
  user!: SocialUser;
  authStateSubscription!: Subscription;

  ngOnInit(): void {
    this.signUpForm = this.createForm();
    this.authStateSubscription = this.authService.authState.subscribe(
      (user) => {
        this.user = user;
        const username = user.email;
        const email = user.email;
        const fname = user.firstName;
        let lname = user.lastName;
        const idToken = user.idToken;

        this.isLoading = true;
        firstValueFrom(this.services.signupViaGoogle(idToken, email))
          .then((result) => {
            this.signUpForm.reset();
            this.dialog.open(DialogComponent, {
              data: { Message: 'Account created', success: true },
            });
            this.router.navigate(['/main']);
          })
          .catch((error) => {
            this.dialog.open(DialogComponent, {
              data: { Message: error.error.message, success: false },
            });
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    );
  }

  createForm() {
    const form = this.fb.group(
      {
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmpassword: ['', Validators.required],
      },
      { validator: this.passwordMatch('password', 'confirmpassword') }
    );

    return form;
  }

  passwordMatch(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (!passwordControl || !confirmPasswordControl) {
        return;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  processForm() {
    const firstname = this.signUpForm.value['firstname'];
    const lastname = this.signUpForm.value['lastname'];
    const email = this.signUpForm.value['email'];
    const password = this.signUpForm.value['password'];

    this.isLoading = true;

    firstValueFrom(this.services.signup(firstname, lastname, email, password))
      .then((result) => {
        this.signUpForm.reset();

        this.dialog.open(DialogComponent, {
          data: { Message: 'Account created, please login', success: true },
        });
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        this.signUpForm.reset();
        this.dialog.open(DialogComponent, {
          data: { Message: error.error.message, success: false },
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }
}
