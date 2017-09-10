import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit{
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
    private router: Router
  ) {

  }
  ngOnInit() {
  }

}
