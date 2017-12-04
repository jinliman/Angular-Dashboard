import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from "moment";

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {

  userInfo : object = {};
  userProjects : Array<object> = [];
  jobTilteArr: Array<object> = [];
  jobTitle: string = '';
  userID: string = '';
  loading: boolean;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.jobTilteArr = this.dataService.getJobList();
    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.userID = params['id'] || '';
        this.getUserInfo();
      });
  }

  getJobTitle(){
    this.jobTitle = this.jobTilteArr.find((item)=>{ return item['value'] == this.userInfo['Name']['JobTitle']})['label'];
  }

  getUserInfo(){
    let data = {UserID: this.userID}
    this.dataService.getUser(data).subscribe(
      response => {
        this.userInfo = response.UserInfo;
        this.userProjects = response.UserProjects;
        this.getJobTitle();
        this.initData();
      },
      (error) => {

      }
    );
  }

  initData(){

    this.loading = false;
  }
}
