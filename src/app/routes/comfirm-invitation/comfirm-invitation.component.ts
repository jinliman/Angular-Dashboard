import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-comfirm-invitation',
  templateUrl: './comfirm-invitation.component.html',
  styleUrls: ['./comfirm-invitation.component.scss']
})
export class ComfirmInvitationComponent implements OnInit {

  code: string;
  isValid: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isValid = true;
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.code = params['code'] || '';
        this.authService.checkInvitationCode(this.code,true).subscribe(
          response => {
            console.log(response)
            this.isValid = true;
          },
          (error) => {
            this.router.navigate(['/signup']);
          }
        );
      });
  }
}
