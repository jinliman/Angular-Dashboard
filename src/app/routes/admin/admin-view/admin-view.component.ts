import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from "moment";

import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.scss']
})
export class AdminViewComponent implements OnInit {

  adminInfo : object = {};
  userID: string = '';
  loading: boolean;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.userID = params['id'] || '';
        this.getAdminInfo();
      });
  }

  getAdminInfo(){
    let data = {UserID: this.userID}
    this.adminInfo = null;
    this.dataService.getAdminUser(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this.adminInfo = response.result;
          this.initData();
        }else{
          this._notificationService.warn(
              'User Detail',
              response.Message
          )
          this.loading = false;
        }
      },
      (error) => {
        this._notificationService.error(
            'User Detail',
            'Sth went wrong'
        )
      }
    );
  }

  initData(){
    this.loading = false;
  }

}
