import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy {
  private sub: any;

	constructor(
    private router: Router
  ) {

  }

  ngOnDestroy(): any {
  }
  ngOnInit() {
      $(document).on('click', '[href="#"]', e => e.preventDefault());
  }
}
