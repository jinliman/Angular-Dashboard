import { Component, OnInit } from '@angular/core';

import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})

export class LayoutComponent implements OnInit {

  hasHeader = false;
  pageName = null;
  public options = {
    position: ["top", "right"],
    timeOut: 2000,
    showProgressBar: false,
    pauseOnHover: false,
    clickToClose: true,
    maxLength: 30,
  };
  constructor(private authService: AuthService,private _router:Router) {

  }

  ngOnInit() {
    // let pageName = this._router.url
    // this.pageName = pageName
    // let pageArr = ['/']
    // this.hasHeader = pageArr.indexOf(pageName) >= 0 ? true : false
  }

}
