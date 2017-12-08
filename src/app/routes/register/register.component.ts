import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from "moment";
import { ViewChild } from '@angular/core';
import { ReCaptchaComponent } from 'angular2-recaptcha';

import {Name, Company, Reason1, Reason2, Reason3, Reason4, User} from '../../shared/objectSchema';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  public datepickerOptions: any = {
    locale: { format: 'MMMM DD YYYY' },
    singleDatePicker: true,
    showDropdowns: true,
    inline: false
  };
  @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

  captcha_response : string;
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
  plan_type: string;
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

  handleCorrectCaptcha($event){
    this.captcha_response = $event;
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
    this.captcha_response = null;
    let queryParam = null
    this.code = null;
    this.isConfirmed = false;
    this.wizardStep = 1;
    this.initUser();

    let quickStartInfo = null;

    this.route
      .queryParams
      .subscribe(params => {
        this.code = params['code'] || null;
        this.plan_type = params['plan_type'] || null;

        if(params['UserName'])
          quickStartInfo = params
      });

    if(quickStartInfo)
    {
      let nameArr = quickStartInfo['UserName'].split(' ');
      this.newUser.Email = quickStartInfo['UserEmail'];
      this.newUser.Password = quickStartInfo['UserPassword'];
      this.newUser.Name.First = nameArr.slice(0, -1).join(' ');
      this.newUser.Name.Last = nameArr.slice(-1).join(' ');
    }
    if(this.code)
    {
      this.initInvitor();
    }else{
      this.newUser.UserType = 'INITIATOR';
      this.title = "Let's establish your account as the Project Owner<br>to initiate your project and begin receiving daily updates.";
    }

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
  initInvitor(){
    this.authService.checkInvitationCode(this.code).subscribe(
      response => {
        this.isConfirmed = response.Data.Confirmed;
        if(!this.isConfirmed)
          this.newUser.Email = response.Data.Email;
        this.newUser.ProjectID = response.Data.Project;
        this.newUser.UserType = response.Data.Role;
        this.wizardStep = 3;
        if(this.newUser.UserType != 'INITIATOR')
          this.title = "Welcome to DealValue! <br/>Please Complete your profile";
      },
      (error) => {
        this.router.navigate(['/app']);
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
    // for(let i=1; i<=4; i++)
    // {
    //   if(i == this.newUser.Reason)
    //     continue;
    //   this.newUser["Reason"+i] = null
    // }
    this.wizardStep ++;
  }

  onRegister(){
    this.newUser.Name.Fullname = this.newUser.Name.First + " " + this.newUser.Name.Last;
    let data = {
      Captcha_response : this.captcha_response,
			PassportCollection: {
				EmailPassports: [
					{
						Email: this.newUser.Email,
						Password: this.newUser.Password
					}
				]
			},
      UserType: this.newUser.UserType,
      ProjectID: this.newUser.ProjectID,
      Name: this.newUser.Name,
      ProjectName: this.newUser.ProjectName,
      Company: this.newUser.Company,
      Reason: this.newUser.Reason,
      Reason1: this.newUser.Reason1,
      Reason2: this.newUser.Reason2,
      Reason3: this.newUser.Reason3,
      Reason4: this.newUser.Reason4,
      Contact: this.newUser.Contact,
      Code: this.code,
      Plan_Type: this.plan_type
		};

    this.authService.register(data).subscribe(
      response => {
        if(response.ERR_CODE == "ERR_NONE")
        {
          if(response.NewUser)
            this.router.navigate(['/email-sent'],{ queryParams: { code: response.ID } });
          else
          {
              if(response.Token)
              {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('token', JSON.stringify(response.Token));
                localStorage.setItem('user', JSON.stringify({ _id: response.ID}));

                this.authService.userInfo().subscribe(
                  user => {
                    localStorage.setItem('user', JSON.stringify(user.UserInfo));
                    localStorage.setItem('project', JSON.stringify(user.UserProjects[0]));
                    this.navigateUser();
                  }
                );
              }
          }
        }else{
          this.captcha.reset();
          this.captcha_response = null;
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
      this.router.navigate(['/membership']);
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
      tReason: ''
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
