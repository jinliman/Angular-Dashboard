import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable  } from 'rxjs/Observable';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  Password: any;
  ConfirmPassword: any;
  token: any;
  Updated: boolean = false;
  hasError: boolean = false;
  ErrorString: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService
  ) { }

  onSubmitForgot(){

    let data = {
      password: this.Password,
      token: this.token
    }
    this.authService.resetPassword(data).subscribe(
      response => {
        this.Updated = true;
        this.hasError = false;
      },
      (error) => {
        let err= JSON.parse(error['_body'])
        this.hasError = true;
        this.Updated = false;
        if(err.err == "Token expired")
          this.ErrorString = 'Token is expired'
        else if(err.err == "Invalid request")
          this.ErrorString = 'Token in Invalid'
        else
          this.ErrorString = "User doens't exist";
      }
    );
  }

  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        this.token = params['token'] || null;

      });
  }
}
