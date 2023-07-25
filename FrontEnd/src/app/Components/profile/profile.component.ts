import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from 'src/app/app.component';
import { AuthService } from 'src/app/auth.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { StorageServices } from 'src/app/storageServices';
import { Service } from 'src/app/services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = false;
  }

  router = inject(Router);
  authService = inject(AuthService);
  gService = inject(SocialAuthService);
  storageServices = inject(StorageServices);
  services = inject(Service);

  ngOnInit(): void {}

  logOut() {
    this.authService.loggedIn = false;
    this.gService.signOut();
    this.router.navigate(['/index']);
    this.storageServices.clearStorage();
  }
}
