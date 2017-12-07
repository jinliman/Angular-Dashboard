import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {

  PrimaryEmail: string;
  TeamEmail: Array<object>;
  token: string;
  projectID: string;
  isSent: boolean;
  submitText: string;
  plan_type: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService
  ) { }

  onSubmit(){
    let data = {
      ProjectID   : this.projectID,
      Primary     : this.PrimaryEmail,
      TeamMember  : this.TeamEmail.map(function(obj){ return obj['value']})
    }

    this.authService.inviteUser(data).subscribe(
      response => {
        this.isSent = true;
        this.submitText = "Resend";
      },
      (error) => {

      }
    );
  }

  addNewTeamMembr(){
    let newIndex = this.TeamEmail.length + 1;
    this.TeamEmail.push({"name": "teammember" + newIndex, "value": ""});
  }

  removeTeamMemeber(index){
    this.TeamEmail.splice(index, 1);
  }
  ngOnInit() {
    this.TeamEmail = []
    this.isSent = false;
    this.submitText = "Send";
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.token = params['token'] || '';
        this.projectID = params['id'] || '';
        this.plan_type = params['plan_type'] || '';
      });
  }
}
