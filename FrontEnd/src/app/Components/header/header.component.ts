import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from 'src/app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  name!: string;
  service=inject(Service);
  router=inject(Router);

  
  isLinkActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
  

  ngOnInit(): void {
    this.name=this.service.name;
  }




}
