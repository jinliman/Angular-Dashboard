import { Component, OnInit, ElementRef } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';


@Component({
  selector: 'app-email-sent',
  templateUrl: './email-sent.component.html',
  styleUrls: ['./email-sent.component.scss']
})
export class EmailSentComponent implements OnInit {

  Email: string;
  code: string;
  isResend: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService) { }

  onResend(){
    this.authService.resendConfirmation(this.code).subscribe(
      response => {
        this.isResend = true;
      },
      (error) => {
        this.isResend = false;
      }
    );
  }

  ngOnInit() {
    this.isResend = false;
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.code = params['code'] || '';
      });
    this.authService.isUserConfirm(this.code).subscribe(
      response => {
        this.Email = response.Email;
      },
      (error) => {
        this.router.navigate(['/login']);
      }
    );
  }
}
