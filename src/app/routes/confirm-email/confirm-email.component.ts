import { Component, OnInit, ElementRef } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  token: string;
  projectID: string;
  isConfirmed: boolean;
  canInvite: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isConfirmed = true;
    this.canInvite = false;
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.token = params['token'] || '';
        this.projectID = params['id'] || '';
        let data = { token: this.token, projectID: this.projectID}
        this.authService.confirmEmail(data).subscribe(
          response => {
            if(response)
              this.canInvite = true;
            this.isConfirmed = true;
          },
          (error) => {
            this.isConfirmed = false;
          }
        );
      });
  }

}
