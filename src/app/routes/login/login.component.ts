import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { ReCaptchaComponent } from 'angular2-recaptcha';

export class User{
  email: string;
  password: string;
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userCredential: User;
  captcha_response : string;
  isValid: boolean;
  @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

  constructor( private authService: AuthService, private router: Router) {

  }

  navigateUser() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  handleCorrectCaptcha($event){
    this.captcha_response = $event;
  }

  onSubmitLogin(){
    let data = {
      Captcha_response : this.captcha_response,
			PassportCollection: {
				EmailPassports: [
					{
						Email: this.userCredential.email,
						Password: this.userCredential.password
					}
				]
			}
		};
    this.authService.login(data).subscribe(
      response => {
        // this.authService.LoggedInEvent.emit(true);
        // login successful if there's a jwt token in the response
        let user = response;
        if (user && user.Token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', JSON.stringify(user.Token));
          localStorage.setItem('user', JSON.stringify({ _id: user.ID}));

          this.authService.userInfo().subscribe(
            user => {
              console.log(user)
              localStorage.setItem('user', JSON.stringify(user.UserInfo));
              localStorage.setItem('project', JSON.stringify(user.UserProjects[0]));
              this.navigateUser();
            }
          );
        }else{
          this.captcha.reset();
          this.captcha_response = null;
          this.isValid = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnInit() {
    this.captcha_response = null;
    this.isValid = true;
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app']);
    } else {

    }

    this.userCredential = {
      email: '',
      password: ''
    }

  }

}
