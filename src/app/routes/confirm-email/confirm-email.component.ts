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
  membershipType: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isConfirmed = true;
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.token = params['token'] || '';
        this.membershipType = params['type'] || 'Professional';

        let data = { token: this.token, projectID: this.projectID}
        this.authService.confirmEmail(data).subscribe(
          response => {
            this.isConfirmed = true;
            if (response && response.userID) {
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('token', JSON.stringify(this.token));
              localStorage.setItem('user', JSON.stringify({ _id: response.userID}));
              this.authService.userInfo().subscribe(
                user => {
                  console.log(user)
                  localStorage.setItem('user', JSON.stringify(user.UserInfo));
                  if(user.UserProjects && user.UserProjects.length)
                  {
                    localStorage.setItem('project', JSON.stringify(user.UserProjects[0]));
                  }else{
                    localStorage.setItem('project', null);
                  }
                }
              );
            }
          },
          (error) => {
            this.isConfirmed = false;
          }
        );
      });
  }

}
