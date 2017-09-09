import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit,OnDestroy{
  private sub: any;
  public options = {
    position: ["top", "right"],
    timeOut: 2000,
    showProgressBar: false,
    pauseOnHover: false,
    clickToClose: true,
    maxLength: 10,
  }

  constructor(
    private slimLoader: SlimLoadingBarService,
    private router: Router
  ) {
    this.sub = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
              this.slimLoader.reset();
              this.slimLoader.color = '#60a628';
              this.slimLoader.height = '3px';
              this.slimLoader.progress = 5;
              this.slimLoader.start();
            } else if ( event instanceof NavigationEnd ||
                        event instanceof NavigationCancel ||
                        event instanceof NavigationError) {
                this.slimLoader.complete();
            }
        }, (error: any) => {
          this.slimLoader.complete();
        });
  }
  ngOnDestroy(): any {
      this.sub.unsubscribe();
  }
  ngOnInit() {
  }

}
