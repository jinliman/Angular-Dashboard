import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';
import * as moment from "moment";

@Component({
  selector: 'app-promocode',
  templateUrl: './promocode.component.html',
  styleUrls: ['./promocode.component.scss']
})
export class PromocodeComponent implements OnInit {

  newCodeInfo: object = {}
  public datepickerOptions: any = {
    locale: { format: 'MMMM DD YYYY' },
    singleDatePicker: true,
    showDropdowns: true,
    inline: false
  };
  public dropdownSettings: any = {
    singleSelection: false,
    text:'Select Project Owners',
    selectAllText:'Select All',
    unSelectAllText:'UnSelect All',
    enableSearchFilter: false ,
    enableCheckAll: true,
    classes:"cs-dropdown-select custom-class",
    badgeShowLimit: 3
  };
  projectOwnerList = {
    Content: [],
    Selected: []
  }
  loading: boolean;
  promocodeList: Array<object> = [];
  codeSelected: string = '';
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {

    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()+15);
    this.codeSelected = '';
    this.loading = true;
    this.newCodeInfo = {
      title: '',
      code: '',
      percent: 10,
      expiredate: moment(new Date(currentTime)).format("MMMM DD YYYY"),
      status: 'Active'
    }
    this.getPromoCode()
    this.getProjectOwner();
  }

  getProjectOwner()
  {
    this.dataService.getAdminAllProjectUsers().subscribe(
      response => {
        let projectOwners = response.result.filter(item => item.Role == "INITIATOR")
        for (let userItem of projectOwners)
        {
          let tmp_item =  {'id': userItem['User']['_id'], 'itemName': userItem['User']['Name']['First']}
          if(!this.projectOwnerList.Content.find(item => item['id'] == tmp_item['id']))
            this.projectOwnerList.Content.push(tmp_item)
        }
      },
      (error) => {

      }
    );
  }

  setExpireDate(value: any)
  {
    this.newCodeInfo['expiredate'] = moment(new Date(value.start)).format("MMMM DD YYYY");
  }

  generateRandomCode(){
    let text = "",
        length = 12,
        possible  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for ( var i=0; i < length; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    this.newCodeInfo['code'] = text;
  }

  updatePromocode(modal,type){
    let data = {
      type: type,
      data: this.newCodeInfo
    }
    this.dataService.updatePromoCode(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Saved!',
              'PromoCode'
          )
          this.getPromoCode();
          modal.close();
        }else{
          this._notificationService.error(
              'Sth went wrong!',
              'PromoCode'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong!',
            'PromoCode'
        )
      }
    );
  }

  openModal(modal){
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()+15);
    this.newCodeInfo = {
      title: '',
      code: '',
      percent: 10,
      expiredate: moment(new Date(currentTime)).format("MMMM DD YYYY"),
      status: 'Active'
    }
    modal.open();
  }

  editPromocode(modal, item)
  {
    this.newCodeInfo = {
      id: item['_id'],
      title: item.Title,
      code: item.Code,
      percent: item.Percent,
      expiredate: moment(item.ExpireDate).format("MMMM DD YYYY"),
      status: item.Status
    }
    modal.open();
  }

  onSwitchToggle(){
    this.newCodeInfo['status'] = this.newCodeInfo['status'] == 'Active' ? 'Inactive' : 'Active';
  }

  removePromocode(id){
    let data = {
      id: id
    }
    if(confirm('Are you sure you want to delete this PromoCode?'))
    {
      this.dataService.removePromoCode(data).subscribe(
        response => {
          if(response.ERR_CODE == 'ERR_NONE')
          {
            this._notificationService.success(
                'Successfully Removed!',
                'PromoCode'
            )
            this.getPromoCode();
          }else{
            this._notificationService.error(
                'Sth went wrong!',
                'PromoCode'
            )
          }
        },
        (error) => {
          this._notificationService.error(
              'Sth went wrong!',
              'PromoCode'
          )
        }
      );
    }
  }
  sendModal(modal, item)
  {
    this.projectOwnerList.Selected = [];
    this.codeSelected = item.Code;
    modal.open();
  }
  sendPromocode(modal){
    let data = {
      code: this.codeSelected,
      data: this.projectOwnerList.Selected
    }
    this.dataService.sendPromoCode(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Sent!',
              'PromoCode'
          )
          modal.close();
        }else{
          this._notificationService.error(
              'Sth went wrong!',
              'PromoCode'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong!',
            'PromoCode'
        )
      }
    );
  }
  getPromoCode(){
    this.dataService.getPromoCode().subscribe(
      response => {
        this.promocodeList = response.result
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }
}
