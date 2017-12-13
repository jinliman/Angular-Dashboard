import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from "moment";

import {Project, Company, Reason1, Reason2, Reason3, Reason4} from '../../../shared/objectSchema';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit {

  public datepickerOptions: any = {
    locale: { format: 'MMMM DD YYYY' },
    singleDatePicker: true,
    showDropdowns: true,
    inline: false
  };
  country_list = [];
  state_list = [];
  city_list = [];
  about_us_list : Array<object> = [];
  diligency_type: Array<object> = [];
  current_diligence_arr: Array<any> = [];
  reason_type : Array<object> = [];
  job_list : Array<object> = [];
  industry_list : Array<object> = [];

  loading: boolean;

  projectID: string;
  currentProject : Project;
  wizardStep : number;
  code: string;
  isConfirmed: boolean;
  validArr;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
      this.about_us_list = this.dataService.getAboutUsList();
      this.reason_type = this.dataService.getReasonType();
      this.job_list = this.dataService.getJobList();
      this.industry_list = this.dataService.getIndustryList();
  }

  selectedDate(index, value: any)
  {
    this.currentProject.Reason1.tAcqDate = moment(new Date(value.start)).format("MMMM DD YYYY");
  }
  onSelectCountry(event)
  {
    let data = { 'id': event.value };
    this.dataService.getStateList(data).subscribe(
      response => {
        this.state_list = response.result;
      },
      (error) => {
      }
    );
  }

  onSelectState(event)
  {
    let data = { 'id': event.value };
    this.dataService.getCityList(data).subscribe(
      response => {
        this.city_list = response.result;
      },
      (error) => {
      }
    );
  }

  ngOnInit() {
    this.wizardStep = 1;
    this.currentProject = {
      Name: '',
      Company: {
        Name: '',
        Contact: '',
        ZipCode: '',
        Website: '',
        Address1: '',
        Address2: '',
        Country: '0',
        State: '0',
        City: '0',
        AboutUs: '0',
        Industry: '0',
        Diligence: '',
      },
      Reason: null,
      Reason1: null,
      Reason2: null,
      Reason3: null,
      Reason4: null
    }

    this.route
      .params
      .subscribe(params => {
        this.projectID = params['id'];
      });
    this.apiHandler();
  }

  apiHandler(){
    this.loading = true;
    let promiseArr= [];

    promiseArr.push(new Promise((resolve, reject) => {
      this.getProject(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getCountry(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getDueDiligence(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.initProject()
    });
  }

  getCountry(resolve){
    this.dataService.getCountryList().subscribe(
      response => {
        this.country_list = response.result
        resolve();
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
        if(response.result.Role == 'MEMBER')
        {
          this.router.navigate(['/app/project/'+this.projectID]);
        }
        if(response.result && response.result.Project)
          this.currentProject  = response.result.Project
        resolve();
      },
      (error) => {

      }
    );
  }

  initProject(){
    this.setReasonDefault();

    this.validArr = {
      Register: true,
      ReasonCheckbox: true
    }

    this.loading = false;
  }

  onContinue(){
    this.wizardStep ++;
  }

  onUpdateProject(){
    this.currentProject.Company.Diligence = this.current_diligence_arr.join(",");
    let data = {
      id: this.projectID,
      data: this.currentProject
    }
    this.dataService.updateProject(data).subscribe(
      response => {
        let project = response.result;
        this.dataService.onProjectUpdated();
        this.router.navigate(['/app/project/'+this.projectID]);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  navigateUser() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  setReasonDefault(){
    this.current_diligence_arr = [];
    let diligenceArr = this.currentProject.Company.Diligence.split(",");
    let tmpArr = this.diligency_type.filter((item1)=>{return diligenceArr.includes(item1['value'])})
    tmpArr.forEach((item) => { this.current_diligence_arr.push(item['value'])});
  }
  reasonCheck($event){
    let valid:boolean = false
    for( var key  in this.currentProject.Reason3)
    {
      valid = valid || this.currentProject.Reason3[key];
    }
    this.validArr.ReasonCheckbox = valid;
  }
}
