import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  adminInfo : object = {};
  adminSetting: object = {};
  passwordInfo: object = {};
  adminSettingUpdate : object = {};
  isValidPassword: boolean = true;
  loading: boolean;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getAdminInfo();

    this.adminSetting = {
      projectupdate: true
    }

  }

  onSwitchToggle(type,event){
    if(!event)
    {
      alert("Warning - Turning off")
    }
    this.adminSettingUpdate[type] = !this.adminSettingUpdate[type]
  }
  getAdminInfo(){
    this.authService.adminInfo().subscribe(
      response => {
        this.adminInfo = response.UserInfo;
        console.log(this.adminInfo)
        if(response.UserInfo['Data'] && response.UserInfo['Data'].length)
        {
          response.UserInfo['Data'].forEach((item)=>{this.adminSetting[item['DataType']] = (!!item['Data'])})
        }
        this.initUpdateAdminSetting()
      },
      (error) => {

      }
    );
  }

  updateSetting(modal){

    let data = [];
    for(let i of Object.keys(this.adminSettingUpdate)){
      data.push({DataType: i, Data: this.adminSettingUpdate[i]})
    }
    this.dataService.updateAdminSetting({ data : data}).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE"){
          if(response.result.length)
          {
            response.result.forEach((item)=>{this.adminSetting[item['DataType']] = (!!item['Data'])})
          }
          this.initUpdateAdminSetting()
          modal.close();
          this._notificationService.success(
              'Admin Setting',
              'Setting updated'
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
    this.dataService.updateAdminPassword(data).subscribe(
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

  initUpdateAdminSetting(){
    for(let i of Object.keys(this.adminSetting))
    {
        this.adminSettingUpdate[i] = this.adminSetting[i];
    }
    this.loading = false;
  }
  openModal(modal){
    this.initUpdateAdminSetting();
    modal.open();
  }

}
