import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from "moment";


import {Name, Company, Reason1, Reason2, Reason3, Reason4, User} from '../../shared/objectSchema';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent implements OnInit {

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

  newUser : User;
  wizardStep : number;
  code: string;
  title: string;
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
    this.newUser.Reason1.tAcqDate = moment(new Date(value.start)).format("MMMM DD YYYY");
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
    let queryParam = null
    this.isConfirmed = false;
    this.wizardStep = 1;
    this.initUser();

    this.newUser.UserType = 'INITIATOR';
    this.title = "Let's initiate your project and begin receiving daily updates.";

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

  initUser(){
    this.newUser = {
      UserType: null,
      ProjectID: null,
      Email: '',
      Password: '',
      PasswordConfirm: '',
      Name: {
        First: '',
        Last: '',
        Fullname: '',
        JobTitle: '0'
      },
      ProjectName: '',
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
      Reason4: null,
      Contact: null
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

  updateInfo(){
    let data = {
      data : {
        UserType: this.newUser.UserType,
        Name: this.newUser.ProjectName,
        Company: this.newUser.Company,
        Reason: this.newUser.Reason,
        Reason1: this.newUser.Reason1,
        Reason2: this.newUser.Reason2,
        Reason3: this.newUser.Reason3,
        Reason4: this.newUser.Reason4,
      }
		};

    this.dataService.postProject(data).subscribe(
      response => {
        if(response.ERR_CODE == "ERR_NONE")
        {
          let projectID = response.result.Project['_id']
          localStorage.setItem('projectID', projectID);

          this.authService.userInfo().subscribe(
            user => {
              localStorage.setItem('user', JSON.stringify(user.UserInfo));
              localStorage.setItem('project', JSON.stringify(user.UserProjects[0]));
              this.navigateUser();
            }
          );
        }else{
          this.validArr.Register = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  navigateUser() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/team-invite']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  setReasonDefault(){
    this.newUser.Reason1 = {
      tCompanyName: '',
      tIndustry: '',
      tEmpNo: null,
      tAnnualRev: null,
      tAcqDate: moment(new Date()).format("MMMM DD YYYY")
    };
    this.newUser.Reason2 = {
      tEmpNo: null,
      tAnnualRev: null,
      tNetIncome: null,
      tSellDate: moment(new Date()).format("MMMM DD YYYY")
    };
    this.newUser.Reason3 = {
      tBizImp: true,
      tCostSaving: false,
      tPerformanceDate: false,
      tResOpt: false
    };
    this.newUser.Reason4 = {
      tReason: 'business'
    };
  }
  reasonCheck($event){
    let valid:boolean = false
    for( var key  in this.newUser.Reason3)
    {
      valid = valid || this.newUser.Reason3[key];
    }
    this.validArr.ReasonCheckbox = valid;
  }

}
