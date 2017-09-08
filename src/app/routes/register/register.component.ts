import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from "moment";

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

  country_list = [];
  state_list = [];
  city_list = [];
  about_us_list = [
    {'value':'1', 'label': 'Search Engine'},
    {'value':'2', 'label': 'Recommendation'},
    {'value':'3', 'label': 'LinkedIn'},
    {'value':'4', 'label': 'Twitter'},
    {'value':'5', 'label': 'Mailer'},
    {'value':'6', 'label': 'E-mail'},
    {'value':'7', 'label': 'Fax'},
    {'value':'8', 'label': 'Other'}
  ]
  diligency_type = [
    {'value':'1', 'label':'IT (INFORMATION TECHNOLOGY)'},
    {'value':'2', 'label':'HR (HUMAN RESOURCES)'},
    {'value':'3', 'label':'BOTH'},
  ]

  reason_type = [
    {'value':'1', 'label':'Buy a Company'},
    {'value':'2', 'label':'Sell a Company'},
    {'value':'3', 'label':'IT Assessment'},
    {'value':'4', 'label':'Other'},
  ]
  job_list = [
    {'value': '1', 'label': 'Advisor'},
    {'value': '2', 'label': 'Analyst'},
    {'value': '3', 'label': 'Consultant'},
    {'value': '4', 'label': 'Developer'},
    {'value': '5', 'label': 'Manager'},
    {'value': '6', 'label': 'Director'},
    {'value': '7', 'label': 'Managing Director'},
    {'value': '8', 'label': 'Vice Presvalueent'},
    {'value': '9', 'label': 'Presvalueent/CEO'},
    {'value': '10', 'label': 'Partner'},
  ]
  industry_list = [
    {'value': '1', 'label': 'Advertising'},
    {'value': '2', 'label': 'Aerospace &amp; Defense'},
    {'value': '3', 'label': 'Agriculture &amp; Forestry Sector'},
    {'value': '4', 'label': 'Arts, Entertainment &amp;  Media'},
    {'value': '5', 'label': 'Automotive'},
    {'value': '6', 'label': 'Building &amp; Construction'},
    {'value': '7', 'label': 'Business Services'},
    {'value': '8', 'label': 'Chemical'},
    {'value': '9', 'label': 'Construction'},
    {'value': '10', 'label': 'Consulting &amp; Professional Services'},
    {'value': '11', 'label': 'Consumer Products &amp; Goods'},
    {'value': '12', 'label': 'Education'},
    {'value': '13', 'label': 'Finance &amp; Insurance'},
    {'value': '14', 'label': 'Government'},
    {'value': '15', 'label': 'Healthcare'},
    {'value': '16', 'label': 'Healthcare Information &amp; Technology'},
    {'value': '17', 'label': 'Manufacturing &amp; Industrials'},
    {'value': '18', 'label': 'Membership Organizations'},
    {'value': '19', 'label': 'Mining'},
    {'value': '20', 'label': 'Oil &amp; Gas'},
    {'value': '21', 'label': 'Pharmaceuticals'},
    {'value': '22', 'label': 'Real Estate'},
    {'value': '23', 'label': 'Renewables/Energy'},
    {'value': '24', 'label': 'Restaurants, Bars &amp; Food Services'},
    {'value': '25', 'label': 'Retail'},
    {'value': '26', 'label': 'Technology &amp; Telecom'},
    {'value': '27', 'label': 'Transportation Services'},
    {'value': '28', 'label': 'Utilities'},
    {'value': '29', 'label': 'Waste &amp; Recycling'},
    {'value': '30', 'label': 'Wholesale'}
  ]
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
    private route: ActivatedRoute) {
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
    this.code = null;
    this.isConfirmed = false;
    this.title = "Please provide the information requested<br>to initiate your IT Assessment.";
    this.initUser();
    this.route
      .queryParams
      .subscribe(params => {
        this.code = params['code'] || null;
      });
    this.wizardStep = 1;
    if(this.code)
    {
      this.authService.checkInvitationCode(this.code).subscribe(
        response => {
          console.log(response);
          this.isConfirmed = response.Data.Confirmed;
          if(!this.isConfirmed)
            this.newUser.Email = response.Data.Email;
          this.newUser.ProjectID = response.Data.Project;
          this.newUser.UserType = response.Data.Role;
          if(this.newUser.UserType == 'MEMBER')
            this.wizardStep = 2;
          else
            this.wizardStep = 1;
          if(this.newUser.UserType != 'INITIATOR')
            this.title = "Welcome to DealValue! <br/>Please Complete to your profile";
        },
        (error) => {
          this.router.navigate(['/register']);
        }
      );
    }

    this.dataService.getCountryList().subscribe(
      response => {
        this.country_list = response.result
      },
      (error) => {

      }
    );

    this.validArr = {
      Register: true,
      ReasonCheckbox: true
    }
    this.setReasonDefault();
  }

  initUser(){
    this.newUser = {
      UserType: 'INITIATOR',
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
        Country: '0',
        State: '0',
        City: '0',
        AboutUs: '0',
        Industry: '0',
        Diligence: '0',
      },
      Reason: null,
      Reason1: null,
      Reason2: null,
      Reason3: null,
      Reason4: null
    }
  }

  onContinue(){
    for(let i=1; i<=4; i++)
    {
      if(i == this.newUser.Reason)
        continue;
      this.newUser["Reason"+i] = null
    }
    this.newUser.Name.Fullname = this.newUser.Name.First + " " + this.newUser.Name.Last;
    this.wizardStep = 2;
  }

  onRegister(){
    let data = {
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
      Code: this.code
		};

    this.authService.register(data).subscribe(
      response => {
        if(response.ERR_CODE == "ERR_NONE")
        {
          this.router.navigate(['/email-sent'],{ queryParams: { code: response.ID } });
        }else{
          this.validArr.Register = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
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
