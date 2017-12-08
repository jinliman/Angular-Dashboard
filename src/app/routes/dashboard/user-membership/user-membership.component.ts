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
  selector: 'app-user-membership',
  templateUrl: './user-membership.component.html',
  styleUrls: ['./user-membership.component.scss']
})
export class UserMembershipComponent implements OnInit {

  userMembershipInfo : object = {};
  adminSetting: object = {};
  plan_type: string = null;
  loading: boolean;
  updated: string;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.updated = params['update'];
        if(this.updated)
        {
          this._notificationService.success(
              'User Membership',
              'Membership updated'
          )
        }
      });
    this.getSetting();
    this.getUserMembership();
  }

  getUserMembership(){
    this.loading = true;
    this.dataService.getUserMembership().subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE")
        {
          this.userMembershipInfo = response.result.Membership;
          this.initData();
        }else {

        }
      },
      (error) => {

      }
    );
  }
  getSetting(){
    this.dataService.getAdminSetting().subscribe(
      response => {
        for(let item of response.result)
        {
            this.adminSetting[item['DataType']] = item['Data'].toString().replace(/(.)(?=(.{3})+$)/g,"$1,")
        }
      },
      (error) => {

      }
    );
  }
  freeMembership(){
    let data = {
      member_type: 'Free'
    }
    this.dataService.updateMembership(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this._notificationService.success(
              'User Membership',
              'Membership updated'
          )
          this.getUserMembership();
        }else{
          this._notificationService.success(
              'User Membership',
              'Membership updated'
          )
        }
      },
      (error) => {

      }
    );
  }

  initData(){
    this.plan_type = this.userMembershipInfo['Type']
    this.loading = false;
  }
}
