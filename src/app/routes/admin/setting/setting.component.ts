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
  paymentSetting: Array<object> = [];
  paymentSettingObject: object = {};
  paymentSettingUpdate: object = {};
  isValidPassword: boolean = true;
  loading: boolean;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.adminSetting = {
      projectupdate: true
    }
    this.apiHandler();
  }

  onSwitchToggle(type,event){
    if(!event)
    {
      alert("Warning - Turning off")
    }
    this.adminSettingUpdate[type] = !this.adminSettingUpdate[type]
  }
  getAdminInfo(resolve){
    this.authService.adminInfo().subscribe(
      response => {
        this.adminInfo = response.UserInfo;

        if(response.UserInfo['Data'] && response.UserInfo['Data'].length)
        {
          response.UserInfo['Data'].forEach((item)=>{this.adminSetting[item['DataType']] = (!!item['Data'])})
        }
        resolve();
      },
      (error) => {

      }
    );
  }

  getAdminSetting(resolve){
    this.dataService.getAdminSetting().subscribe(
      response => {
        this.paymentSetting = response.result;
        resolve();
      },
      (error) => {

      }
    );
  }

  apiHandler(){
    let promiseArr= [];

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAdminInfo(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAdminSetting(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.initUpdateAdminSetting()
    });
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

  updatePaymentSetting(modal){
    let data = [];
    for(let i of Object.keys(this.paymentSettingUpdate)){
      data.push({DataType: i, Data: this.paymentSettingUpdate[i]})
    }
    this.dataService.updateAdminPaymentSetting({ data : data}).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE"){
          this.paymentSetting = response.result;
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
  initUpdateAdminSetting(){
    for(let i of Object.keys(this.adminSetting))
    {
        this.adminSettingUpdate[i] = this.adminSetting[i];
    }
    for(let item of this.paymentSetting)
    {
        this.paymentSettingObject[item['DataType']] = item['Data']
    }
    this.paymentSettingUpdate = Object.assign({}, this.paymentSettingObject)
    this.loading = false;
  }
  openModal(modal){
    this.initUpdateAdminSetting();
    modal.open();
  }

}
