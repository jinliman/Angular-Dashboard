import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable  } from 'rxjs/Observable';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  Email: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService
  ) { }

  onSubmitForgot(){
    let data = {
      email: this.Email
    }
    this.authService.forgotPasswordRequest(data).subscribe(
      response => {
        console.log(response)
      },
      (error) => {

      }
    );
  }

  ngOnInit() {
  }

}
