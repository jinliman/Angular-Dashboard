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
  selector: 'app-admin-edit',
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.scss']
})
export class AdminEditComponent implements OnInit {

  adminInfo : object = {};
  userID: string = '';
  editAdminInfo: object = {};
  passwordInfo: object = {};
  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.route
      .params
      .subscribe(params => {
        this.userID = params['id'] || '';
        this.getAdminInfo();
      });
  }

  openModal(modal){
    modal.open();
  }

  editAdminUser(){
    let data = {
      id: this.userID,
      data: this.editAdminInfo
    }
    this.dataService.editAdminUser(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this._notificationService.success(
              'User Detail',
              'Profile updated'
          )
          this.getAdminInfo();
        }else{
          this._notificationService.warn(
              'User Detail',
              response.Message
          )
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
  updatePassword(modal){
    let data = {
      id: this.userID,
      data: this.passwordInfo
    }
    this.dataService.editAdminUserPassword(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this._notificationService.success(
              'User Detail',
              'Password updated'
          )
          modal.close();
        }else{
          this._notificationService.warn(
              'User Detail',
              response.Message
          )
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

  getAdminInfo(){
    this.loading = true;
    let data = {UserID: this.userID}
    this.dataService.getAdminUser(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this.adminInfo = response.result;
          this.editAdminInfo = this.adminInfo
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
