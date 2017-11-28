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
  userSetting: object = {};
  userProjects : Array<object> = [];
  userSettingUpdate : object = {};
  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getUserSettingInfo();

    this.userSetting = {
      dailymail: true,
      projectupdate: true,
      newassignment: true
    }

  }

  onSwitchToggle(type,event){
    if(!event)
    {
      alert("Warning - Turning off updates for current assessments and open projects could delay completion or impact your team's ability to complete the project in a timely manner")
    }
    this.userSettingUpdate[type] = !this.userSettingUpdate[type]
  }
  getUserSettingInfo(){
    this.userInfo = this.authService.getUser();
    let data = {UserID: this.userInfo['_id']}
    this.dataService.getUserSetting(data).subscribe(
      response => {
        if(response.result.length)
        {
          response.result.forEach((item)=>{this.userSetting[item['DataType']] = (!!item['Data'])})
        }
        this.initUpdateUserSetting()
      },
      (error) => {

      }
    );
  }

  updateSetting(modal){

    let data = [];
    for(let i of Object.keys(this.userSettingUpdate)){
      data.push({DataType: i, Data: this.userSettingUpdate[i]})
    }
    this.dataService.updateUserSetting({ data : data}).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE"){
          if(response.result.length)
          {
            response.result.forEach((item)=>{this.userSetting[item['DataType']] = (!!item['Data'])})
          }
          this.initUpdateUserSetting()
          modal.close();
          this._notificationService.success(
              'User Setting',
              'Setting updated'
          )
        }
      },
      (error) => {
      }
    );
  }

  initUpdateUserSetting(){
    for(let i of Object.keys(this.userSetting))
    {
        this.userSettingUpdate[i] = this.userSetting[i];
    }
    this.loading = false;
  }
  openModal(modal){
    this.initUpdateUserSetting();
    modal.open();
  }

}
