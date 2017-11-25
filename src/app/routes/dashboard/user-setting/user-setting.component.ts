import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';
@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.scss']
})
export class UserSettingComponent implements OnInit {

  userInfo : object = {};
  userProjects : Array<object> = [];
  userInfoUpdate : object = {};
  passwordInfo: object = {};
  jobTilteArr: Array<object> = [];
  jobTitle: string = '';
  isValidPassword: boolean = true;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.jobTilteArr = this.dataService.getJobList();
    this.getUserInfo();
    this.getJobTitle();
    this.passwordInfo = {
      passwordOld: '',
      Password: '',
      PasswordConfirm: '',
    }

  }
  getUserInfo(){
    this.userInfo = this.authService.getUser();
    let data = {UserID: this.userInfo['_id']}
    this.dataService.getUser(data).subscribe(
      response => {
        this.userInfo = response.UserInfo;
        this.userProjects = response.UserProjects;
        console.log(this.userInfo)
        this.getJobTitle();
        this.initUpdateUserInfo()
      },
      (error) => {

      }
    );
  }

  updateProfile(modal){
    let data = {
      Data: {
        Name: {
          First: this.userInfoUpdate['First'],
          Last: this.userInfoUpdate['Last'],
          Fullname: this.userInfoUpdate['First'] + " " + this.userInfoUpdate['Last'],
          JobTitle: this.userInfoUpdate['JobTitle']
        },
        Contact: this.userInfoUpdate['Contact']
      }
    }
    this.dataService.updateUserData(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE"){
          this.userInfo = response.result;
          this.getJobTitle();
          this.initUpdateUserInfo()
          modal.close();
          this._notificationService.success(
              'User Profile',
              'Profile updated'
          )
        }
      },
      (error) => {
      }
    );
  }

  updatePassword(modal){
    let data = {
      PasswordOld: this.passwordInfo['PasswordOld'],
      Password: this.passwordInfo['Password']
    }
    this.dataService.updateUserPassword(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_INVALID_CREDENTIAL")
        {
          this.isValidPassword = false;
        }else if(error_code == "ERR_NONE"){
          modal.close();
          this._notificationService.success(
              'User Profile',
              'Password updated'
          )
        }
      },
      (error) => {
        modal.close();
        this._notificationService.success(
            'User Profile',
            'Sth went wrong'
        )
      }
    );
  }

  getJobTitle(){
    this.jobTitle = this.jobTilteArr.find((item)=>{ return item['value'] == this.userInfo['Name']['JobTitle']})['label'];
  }
  initUpdateUserInfo(){
    this.userInfoUpdate['First'] = this.userInfo['Name']['First'];
    this.userInfoUpdate['Last'] = this.userInfo['Name']['Last'];
    this.userInfoUpdate['JobTitle'] = this.userInfo['Name']['JobTitle'];
    this.userInfoUpdate['Contact'] = this.userInfo['Contact'];
  }
  openModal(modal){
    this.isValidPassword  = true;
    this.initUpdateUserInfo();
    modal.open();
  }

}
