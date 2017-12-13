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
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent implements OnInit {

  Project: object = {};
  user: object = {}
  projectID: string;
  diligency_type: Array<object> = [];
  diligencyArr: Array<any> = [];
  reasonTypeArr: Array<any> =[];

  about_us_list : Array<object> = [];

  loading: boolean;


  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService,
  ) {
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect());
  }

  onProjectSelect(){
    this.initData();
  }

  ngOnInit() {
    this.user = this.authService.getUser()
    this.reasonTypeArr = this.dataService.getReasonType();
    this.about_us_list = this.dataService.getAboutUsList();
    this.route
    .params
    .subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.projectID = params['id'] || '';
      this.initData();
    });
  }
  initData(){
    this.loading = true;
    this.diligencyArr = [];
    this.apiHandler();
  }
  apiHandler(){
    let promiseArr= [];

    promiseArr.push(new Promise((resolve, reject) => {
      this.getDueDiligence(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getProject(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.formatData();
    });
  }

  getCountry(){
    let data = {id: this.Project['Project']['Company']['Country']}
    this.dataService.getCountryItem(data).subscribe(
      response => {
        if(response.result && response.result.label)
          this.Project['Country'] = response.result.label;
      },
      (error) => {
      }
    );
  }
  getState(){
    let data = {id: this.Project['Project']['Company']['State']}
    this.dataService.getStateItem(data).subscribe(
      response => {
        if(response.result && response.result.label)
          this.Project['State'] = response.result.label;
      },
      (error) => {
      }
    );
  }
  getCity(){
    let data = {id: this.Project['Project']['Company']['City']}
    this.dataService.getCityItem(data).subscribe(
      response => {
        if(response.result && response.result.label)
          this.Project['City'] = response.result.label;
      },
      (error) => {
      }
    );
  }
  getDueDiligence(resolve){
    this.dataService.getDueDiligenceType().subscribe(
      response => {
        this.diligency_type = response.result
        resolve();
      },
      (error) => {

      }
    );
  }

  getProject(resolve){
    let data = { projectID: this.projectID}
    this.dataService.getProject(data).subscribe(response => {
        this.Project = response.result;
        this.getCountry();
        this.getState();
        this.getCity();
        resolve();
      },
      (error) => {

      }
    );
  }
  formatData(){
    console.log(this.Project)

    if(this.Project['Project'].Company.Diligence)
    {
      let arr = this.Project['Project'].Company.Diligence.split(",");
      for(let item of arr)
      {
        this.diligencyArr.push(this.diligency_type.find((item1) => {return item1['value'] == item})['label'])
      }
    }
    this.Project['diligencyArr'] = this.diligencyArr;
    let reasonItem = this.reasonTypeArr.find((item)=>{ return item['value'] == '5'})
    if(this.reasonTypeArr.find((item)=>{ return item['value'] == this.Project['Project'].Reason}))
    {
      reasonItem = this.reasonTypeArr.find((item)=>{ return item['value'] == this.Project['Project'].Reason});
    }
    this.Project['Reason'] = reasonItem.label;
    this.Project['Additiona_Info_Title'] = '';
    switch(reasonItem.value)
    {
      case '1':
        this.Project['Additiona_Info_Title'] = 'Company Info (Buy)';
        break;
      case '2':
        this.Project['Additiona_Info_Title'] = 'Company Info (Sell)';
        break;
      case '3':
        this.Project['Additiona_Info_Title'] = 'Reason for IT Assessment';
        break;
      case '4':
      this.Project['Additiona_Info_Title'] = 'Reason';
        break;
      case '5':
      default:
        this.Project['Additiona_Info_Title'] = '';
        break;
    }
    let about_us = this.about_us_list.find((item)=>{return item['value'] == this.Project['Project'].Company.AboutUs});
    if(about_us)
      this.Project['About_Us'] = about_us['label'];
    this.loading = false;
    }
}
