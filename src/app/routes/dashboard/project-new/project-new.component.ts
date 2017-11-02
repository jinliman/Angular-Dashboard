import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from "moment";

import {Project, Company, Reason1, Reason2, Reason3, Reason4} from '../../../shared/objectSchema';

@Component({
  selector: 'app-project-new',
  templateUrl: './project-new.component.html',
  styleUrls: ['./project-new.component.scss']
})
export class ProjectNewComponent implements OnInit {

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

  reason_type : Array<object> = [];
  job_list : Array<object> = [];
  industry_list : Array<object> = [];

  newProject : Project;
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
    this.newProject.Reason1.tAcqDate = moment(new Date(value.start)).format("MMMM DD YYYY");
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
    this.initProject();

    this.getCountry();
    this.getDueDiligence();
  }

  getCountry(){
    this.dataService.getCountryList().subscribe(
      response => {
        this.country_list = response.result
      },
      (error) => {

      }
    );
  }
  getDueDiligence(){
    this.dataService.getDueDiligenceType().subscribe(
      response => {
        this.diligency_type = response.result
      },
      (error) => {

      }
    );
  }

  initProject(){
    this.newProject = {
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
    this.validArr = {
      Register: true,
      ReasonCheckbox: true
    }
    this.setReasonDefault();
  }

  onContinue(){
    this.wizardStep ++;
  }

  onCreateProject(){
    let data = {
      data: this.newProject
    }
    this.dataService.postProject(data).subscribe(
      response => {
        let project = response.result;
        this.dataService.onProjectListUpdated(project);
        this.router.navigate(['/app/dashboard']);
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
    this.newProject.Reason1 = {
      tCompanyName: '',
      tIndustry: '',
      tEmpNo: null,
      tAnnualRev: null,
      tAcqDate: moment(new Date()).format("MMMM DD YYYY")
    };
    this.newProject.Reason2 = {
      tEmpNo: null,
      tAnnualRev: null,
      tNetIncome: null,
      tSellDate: moment(new Date()).format("MMMM DD YYYY")
    };
    this.newProject.Reason3 = {
      tBizImp: true,
      tCostSaving: false,
      tPerformanceDate: false,
      tResOpt: false
    };
    this.newProject.Reason4 = {
      tReason: ''
    };
  }
  reasonCheck($event){
    let valid:boolean = false
    for( var key  in this.newProject.Reason3)
    {
      valid = valid || this.newProject.Reason3[key];
    }
    this.validArr.ReasonCheckbox = valid;
  }

}
