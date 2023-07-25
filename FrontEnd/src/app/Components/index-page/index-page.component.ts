import { Component, HostListener, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.css'],
  animations: [
    trigger('cascadeIn', [
      state('start', style({ opacity: 0, transform: 'translateY(-20px)' })),
      state('run', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('start => run', [animate('0.5s ease-in')]),
    ]),
  ],
})
export class IndexPageComponent {
  constructor(private appComponent: AppComponent) {
    this.appComponent.hideNavbar = true;
  }

  value: number = 0;
  words: string[] = ['The', 'wait', 'is', 'over:', 'meet'];
  ziinc: string = 'ZIINC';
  animationState = 'start';

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.value = window.scrollY;
    if (this.isScrolledEnough()) {
      this.animationState = 'run';
    } else {
      this.animationState = 'start';
    }
  }

  isScrolledEnough() {
    return this.value >= 500;
  }
}
