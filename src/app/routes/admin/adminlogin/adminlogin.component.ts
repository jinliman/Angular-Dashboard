import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { Router } from '@angular/router';

export class User{
  username: string;
  password: string;
}

@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.scss']
})

export class AdminloginComponent implements OnInit {

  userCredential: User;
  isValid: boolean
  constructor( private authService: AuthService, private router: Router, private dataService: DataService) {

  }

  navigateUser() {
    if (this.authService.isAdminLoggedIn()) {
      this.router.navigate(['/'+ this.dataService.getAdminUrl() + 'dashboard']);
    } else {
      this.router.navigate(['/'+ this.dataService.getAdminUrl() + 'login']);
    }
  }


  onSubmitLogin(){
    let data = {
      Username: this.userCredential.username,
      Password: this.userCredential.password
		};
    this.authService.login(data, true).subscribe(
      response => {
        // this.authService.LoggedInEvent.emit(true);
        // login successful if there's a jwt token in the response
        let user = response;
        if (user && user.Token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', JSON.stringify(user.Token));
          localStorage.setItem('user', JSON.stringify({ _id: user.UserID}));

          this.authService.adminInfo().subscribe(
            user => {
              localStorage.setItem('user', JSON.stringify(user.UserInfo));
              this.navigateUser();
            }
          );
        }else{
          this.isValid = false;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnInit() {
    this.isValid = true;
    if (this.authService.isAdminLoggedIn()) {
      this.router.navigate(['/' + this.dataService.getAdminUrl()]);
    } else {

    }

    this.userCredential = {
      username: '',
      password: ''
    }

  }

}
