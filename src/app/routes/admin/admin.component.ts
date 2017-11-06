import { Component, Input, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../shared/objectSchema';
import * as moment from "moment";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public daterange: any = {};

  // see original project for full list of options
  // can also be setup using the config service to apply to multiple pickers
  public options: any = {
    locale: { format: 'YYYY-MM-DD' },
    alwaysShowCalendars: false,
    opens: "left",
    ranges: {
      'Today': [moment(), moment()],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'This Week': [moment().day(1),moment().day(7)],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment()],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      'This Year': [moment().startOf('year'), moment()]
    }
  };

  loading: boolean = false;
  ProjectList: Array<object> = [];
  ProjectUsers: Array<object> = [];

  statusInfoArr = {
    total: 0,
    completed: 0,
    in_progress: 0,
    hold: 0,
    num_initiators: 0,
    num_owners: 0,
    num_members: 0
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.daterange.start = null;
    this.daterange.end = null;
    this.daterange.label = 'All';

    this.loading = true;
    this.statusInfoArr = {
      total: 0,
      completed: 0,
      in_progress: 0,
      hold: 0,
      num_initiators: 0,
      num_owners: 0,
      num_members: 0
    }

    this.apiHandler();

  }

  public selectedDate(value: any) {
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = moment(new Date(value.start)).format("MMMM DD YYYY") + ' - ' + moment(new Date(value.end)).format("MMMM DD YYYY");

  }
  public apiHandler(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAllProject(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAllProjectUsers(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.initData();
    });
  }

  public getAllProject(resolve){
    this.dataService.getAdminAllProject().subscribe(response => {
        this.ProjectList = response.result;
        resolve()
      },
      (error) => {

      }
    );
  }

  public getAllProjectUsers(resolve){
    this.dataService.getAdminAllProjectUsers().subscribe(response => {
        this.ProjectUsers = response.result;
        resolve()
      },
      (error) => {

      }
    );
  }

  public initData(){
    for(let entry of this.ProjectList)
    {
      this.statusInfoArr.total++;
      if(entry['Status'] == 'Accept')
        this.statusInfoArr.completed++;
      else if(entry['Status'] == 'Reject')
          this.statusInfoArr.hold++;
      else
        this.statusInfoArr.in_progress++;
    }

    for(let entry of this.ProjectUsers)
    {
      if(entry['Role'] == 'INITIATOR')
        this.statusInfoArr.num_initiators++;
      else if(entry['Role'] == 'PRIMARY')
        this.statusInfoArr.num_owners++;
      else
        this.statusInfoArr.num_members++;
    }
    this.loading = false;
  }
}
