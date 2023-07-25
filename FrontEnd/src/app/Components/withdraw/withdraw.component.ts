import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { NgZone } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';
import { Service } from 'src/app/services';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
const stripePromise = loadStripe(
  'pk_test_51NNSXrF3ngnepwimI2Frop29hgCmyemF8ZABLAJb4DbiFgcWUD8sKu1pOqFQlzdQOgfA07GErsiu2kZ9aewCqEdR00RR57RvYO'
);

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css'],
})
export class WithdrawComponent implements OnInit {
  service = inject(Service);
  paymentForm!: FormGroup;
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  router = inject(Router);
  isLoading = false;

  @ViewChild('cardElement') cardElement!: ElementRef;
  stripe!: any;
  card!: any;

  ngOnInit(): void {
    this.paymentForm = this.createForm();
  }

  createForm() {
    const form = this.fb.group({
      name: this.fb.control<string>('', [Validators.required]),
      amount: this.fb.control<number>(0, [
        Validators.required,
        Validators.min(10),
      ]),
      account: this.fb.control<number>(0, [
        Validators.required,
        this.numberLength(9),
      ]),
      bankName: this.fb.control<string>('', [Validators.required]),
      address: this.fb.control<string>('', [Validators.required]),
      country: this.fb.control<string>('', [Validators.required]),
      code: this.fb.control<string>('', [Validators.required]),
    });
    return form;
  }

  numberLength(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const val: number = control.value;
      if (!val || val.toString().length < min) {
        return { numberLength: { value: control.value } };
      }
      return null;
    };
  }

  processForm() {
    this.isLoading = true;
    const formValue = this.paymentForm.value;
    this.paymentForm.reset();
    firstValueFrom(this.service.withdraw(formValue))
      .then((result) => {
        let id = result.transaction_id;
        firstValueFrom(this.service.getAccountFunds(this.service.user_id)).then(
          (result) => {
            this.service.assets = result.assets;
            this.dialog.open(DialogComponent, {
              data: { Message: 'Transaction_id: ' + id, success: true },
            });
          }
        );
        this.isLoading = false;
        this.router.navigate(['/profile']);
      })
      .catch((error) => {
        this.isLoading = false;
        this.dialog.open(DialogComponent, {
          data: { Message: error.error.error, success: false },
        });
      });
  }
}
