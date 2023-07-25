import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { Service } from 'src/app/services';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
})
export class ProfileDetailsComponent implements OnInit {
  DetailsForm!: FormGroup;
  fb = inject(FormBuilder);
  services = inject(Service);
  router = inject(Router);

  //angular materials
  dialog = inject(MatDialog);
  isLoading = false;

  ngOnInit(): void {
    this.DetailsForm = this.createForm();
  }

  createForm() {
    const form = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        password: ['', Validators.required],
        confirmpassword: ['', Validators.required],
      },
      {
        validator: [
          this.passwordMatch('password', 'confirmpassword'),
          this.passwordNotMatch('oldPassword', 'password'),
        ],
      }
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

  passwordNotMatch(oldPassword: string, password: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[oldPassword];
      const confirmPasswordControl = formGroup.controls[password];

      if (!passwordControl || !confirmPasswordControl) {
        return;
      }

      if (passwordControl.value == confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordNotMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  processForm() {

    const oldPassword = this.DetailsForm.value['oldPassword'];
    const password = this.DetailsForm.value['password'];
 
    const userEmail = this.services.userEmail;

    firstValueFrom(
      this.services.changePassword(oldPassword, password, userEmail)
    )
      .then((result) => {
   
        this.dialog.open(DialogComponent, {
          data: { Message: 'success', success: true },
        });
        this.router.navigate(['/profile']);
      })
      .catch((error) => {
   
        this.dialog.open(DialogComponent, {
          data: { Message: error.error.error, success: false },
        });
      });
  }
}
