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
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

  userInfo : object = {};
  userProjects : Array<object> = [];
  jobTilteArr: Array<object> = [];
  jobTitle: string = '';
  userID: string = '';
  editUserInfo: object = {};
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
    this.jobTilteArr = this.dataService.getJobList();
    this.route
      .params
      .subscribe(params => {
        this.userID = params['id'] || '';
        this.getUserInfo();
      });
  }

  openModal(modal){
    modal.open();
  }

  editUser(){
    let data = {
      id: this.userID,
      data: this.editUserInfo
    }
    this.dataService.editUser(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this._notificationService.success(
              'User Detail',
              'Profile updated'
          )
          this.getUserInfo();
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
    this.dataService.editUserPassword(data).subscribe(
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
  getJobTitle(){
    this.jobTitle = this.jobTilteArr.find((item)=>{ return item['value'] == this.userInfo['Name']['JobTitle']})['label'];
  }

  getUserInfo(){
    this.loading = true;
    let data = {UserID: this.userID}
    this.dataService.getUser(data).subscribe(
      response => {
        this.userInfo = response.UserInfo;
        this.editUserInfo = this.userInfo
        this.userProjects = response.UserProjects;
        this.getJobTitle();
        this.initData();
      },
      (error) => {

      }
    );
  }

  initData(){

    this.loading = false;
  }

}
