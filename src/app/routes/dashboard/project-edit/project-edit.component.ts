import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from "moment";
import { NotificationsService } from 'angular2-notifications';

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
  userProjectRole: string;

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
    private route: ActivatedRoute,
    private _notificationService: NotificationsService
  ) {
      this.about_us_list = this.dataService.getAboutUsList();
      this.reason_type = this.dataService.getReasonType();
      this.job_list = this.dataService.getJobList();
      this.industry_list = this.dataService.getIndustryList();
  }

  formatCurrency(value)
  {
    value = parseFloat(value);
    value = '$' + value;
    console.log(value)
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
        this.userProjectRole  = response.result.Role;
        if(response.result.Role == 'MEMBER')
        {
          this.router.navigate(['/app/project/'+this.projectID]);
        }
        if(response.result && response.result.Project)
        {
          this.currentProject  = JSON.parse(JSON.stringify(response.result.Project));

        }
        resolve();
      },
      (error) => {

      }
    );
  }

  initProject(){
    let promiseArr= [];

    promiseArr.push(new Promise((resolve, reject) => {
      this.initState(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.initCity(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      if(!this.currentProject.Reason1)
        this.currentProject.Reason1 = new Reason1;
      if(!this.currentProject.Reason2)
        this.currentProject.Reason2 = new Reason2;
      if(!this.currentProject.Reason3)
        this.currentProject.Reason3 = new Reason3;
      if(!this.currentProject.Reason4)
        this.currentProject.Reason4 = new Reason4;
      console.log(this.currentProject)
      this.setReasonDefault();

      this.validArr = {
        Register: true,
        ReasonCheckbox: true
      }

      this.loading = false;
    });
  }

  initState(resolve)
  {
    let data = { 'id': this.currentProject.Company.Country };
    this.dataService.getStateList(data).subscribe(
      response => {
        this.state_list = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  initCity(resolve)
  {
    let data = { 'id': this.currentProject.Company.State };
    this.dataService.getCityList(data).subscribe(
      response => {
        this.city_list = response.result;
        resolve();
      },
      (error) => {
      }
    );
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
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE"){
          this._notificationService.success(
              'Project',
              'project updated'
          )
          this.dataService.onProjectUpdated();
          this.router.navigate(['/app/project/'+this.projectID]);
        }else{
          this._notificationService.warn(
              'Project',
              response.Message
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Project',
            'Sth went wrong'
        )
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

    if(this.currentProject.Reason1 && this.currentProject.Reason1.tAcqDate)
      this.currentProject.Reason1.tAcqDate = moment(new Date(this.currentProject.Reason1.tAcqDate)).format("MMMM DD YYYY")
    if(this.currentProject.Reason2 && this.currentProject.Reason2.tSellDate)
      this.currentProject.Reason2.tSellDate =  moment(new Date(this.currentProject.Reason2.tSellDate)).format("MMMM DD YYYY")
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
