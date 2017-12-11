import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { ReCaptchaComponent } from 'angular2-recaptcha';

import {Name, Company, Reason1, Reason2, Reason3, Reason4, User} from '../../shared/objectSchema';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  captcha_response : string;
  @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;
  code: string;
  plan_type: string;
  newUser : object = {};
  job_list : Array<object> = [];
  title: string = '';
  isConfirmed: boolean;
  success: boolean = true;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.newUser = {
      UserType: null,
      ProjectID: null,
      Email: '',
      Password: '',
      PasswordConfirm: '',
      First: '',
      Last: '',
      Fullname: '',
      JobTitle: '0',
      PlanType: null
    };
    this.success = true;
    this.job_list = this.dataService.getJobList();
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
      this.newUser['Email'] = quickStartInfo['UserEmail'];
      this.newUser['Password'] = quickStartInfo['UserPassword'];
      this.newUser['PasswordConfirm'] = quickStartInfo['UserPassword'];
      this.newUser['First'] = nameArr.slice(0, -1).join(' ');
      this.newUser['Last'] = nameArr.slice(-1).join(' ');
    }

    if(this.code)
    {
      this.initInvitor();
      localStorage.setItem('isInvite', 'true');
    }else{
      this.newUser['UserType'] = 'INITIATOR';
      this.title = "Complete the form below to Get Started";
      localStorage.setItem('isInvite', 'false');
    }

  }

  initInvitor(){
    this.authService.checkInvitationCode(this.code).subscribe(
      response => {
        this.isConfirmed = response.Data.Confirmed;
        if(!this.isConfirmed)
          this.newUser['Email'] = response.Data.Email;
          this.newUser['ProjectID'] = response.Data.Project;
          this.newUser['UserType'] = response.Data.Role;
          this.title = "Welcome to DealValue! <br/>Please Complete your profile";
      },
      (error) => {
        this.router.navigate(['/app']);
      }
    );
  }

  handleCorrectCaptcha($event){
    this.captcha_response = $event;
  }

  singup(){
    let Fullname = this.newUser['First'] + " " + this.newUser['Last'];
    let data = {
      Captcha_response : this.captcha_response,
      Name: {
        First: this.newUser['First'],
        Last: this.newUser['Last'],
        Fullname: Fullname,
        JobTitle: this.newUser['JobTitle'],
      },
			PassportCollection: {
				EmailPassports: [
					{
						Email: this.newUser['Email'],
						Password: this.newUser['Password']
					}
				]
			},
      Contact: this.newUser['Contact'],
      PlanType: this.plan_type,
      Code: this.code,
      ProjectID: this.newUser['ProjectID'],
      UserType: this.newUser['UserType']
    }
    this.authService.register(data).subscribe(
      response => {
        if(response.ERR_CODE == "ERR_NONE")
        {
          this.success = true;
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
                    if(user.UserProjects && user.UserProjects.length)
                    {
                      localStorage.setItem('project', JSON.stringify(user.UserProjects[0]));
                    }else{
                      localStorage.setItem('project', null);
                    }
                    this.navigateUser();
                  }
                );
              }
          }
        }else{
          this.captcha.reset();
          this.captcha_response = null;
          this.success = false;
        }
      },
      (error) => {
        console.log(error);
        this.success = false;
      }
    );
  }
  navigateUser() {
    if (this.authService.isLoggedIn()) {
      if(this.code)
      {
        this.router.navigate(['/membership']);
      }else{
        this.router.navigate(['/app']);
      }

    } else {
      this.router.navigate(['/login']);
    }
  }
}
