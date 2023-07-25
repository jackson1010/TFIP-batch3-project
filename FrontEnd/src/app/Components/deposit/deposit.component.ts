import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';
import { Service } from 'src/app/services';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
const stripePromise = loadStripe(
  'pk_test_51NNSXrF3ngnepwimI2Frop29hgCmyemF8ZABLAJb4DbiFgcWUD8sKu1pOqFQlzdQOgfA07GErsiu2kZ9aewCqEdR00RR57RvYO'
);

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css'],
})
export class DepositComponent implements OnInit, OnDestroy {
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = false;
  }

  service = inject(Service);
  paymentForm!: FormGroup;
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  result$!: Subscription;
  topUp$!: Subscription;
  router = inject(Router);
  ngZone = inject(NgZone);
  isLoading = false;

  @ViewChild('cardElement') cardElement!: ElementRef;
  stripe!: any;
  card!: any;

  ngOnInit(): void {
    this.paymentForm = this.createForm();
    this.loadStripe();
  }

  createForm() {
    const form = this.fb.group({
      name: this.fb.control<string>('', [Validators.required]),
      amount: this.fb.control<number>(0, [
        Validators.required,
        Validators.min(10),
      ]),
      address: this.fb.control<string>('', [Validators.required]),
      country: this.fb.control<string>('', [Validators.required]),
      code: this.fb.control<string>('', [Validators.required]),
    });
    return form;
  }

  async loadStripe() {
    if (!this.stripe) {
      this.stripe = await stripePromise;
      const elements = this.stripe.elements();
      this.card = elements.create('card', { hidePostalCode: true });
      this.card.mount(this.cardElement.nativeElement);
    }
  }

  async processForm() {
    this.isLoading = true;
    const formValue = this.paymentForm.value;
    const { error, paymentMethod } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
      billing_details: {
        name: formValue.name,
        address: {
          line1: formValue.address,
          city: formValue.country,
          postal_code: formValue.code,
        },
      },
    });
    if (error) {
      this.isLoading = false;

      this.dialog.open(DialogComponent, {
        data: { Message: error.message, success: false },
      });
    } else {
      this.topUp$ = this.service
        .pay(
          paymentMethod.id,
          formValue.amount,
          this.service.userEmail,
          this.service.user_id
        )
        .subscribe(
          (response) => {
            this.paymentForm.reset();
            // server sent event
            this.result$ = this.service
              .getServerSentEvent('/api/sse')
              .subscribe((event) => {
                if (event.data === 'Payment successful!') {
                  this.isLoading = false;
                  this.dialog.open(DialogComponent, {
                    data: { Message: event.data, success: true },
                  });
                  firstValueFrom(
                    this.service.getAccountFunds(this.service.user_id)
                  ).then((result) => {
                    this.service.assets = result.assets;
                    //unsubscribe
                    this.result$.unsubscribe();
                    this.ngZone.run(() => this.router.navigate(['/profile']));
                  });
                } else if (event.data === 'Payment unsuccessful!') {
                  //unsubscribe
                  this.result$.unsubscribe();
                  this.isLoading = false;
                }
              });
          },
          (error) => {
            this.isLoading = false;
      
            this.dialog.open(DialogComponent, {
              data: { Message: error.error.error, success: false },
            });
          }
        );
    }
  }

  ngOnDestroy(): void {
    if (this.topUp$) {
      this.topUp$.unsubscribe();
    }
  }
}
