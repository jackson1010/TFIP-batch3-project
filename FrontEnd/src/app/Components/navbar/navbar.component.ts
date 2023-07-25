import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  router=inject(Router);

  isLinkActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

}
