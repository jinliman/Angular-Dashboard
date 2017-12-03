import { Component, OnInit } from '@angular/core';
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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

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

  tableData: Array<any> = [];
  userProjectList: Array<any> =[];
  userOwnProjectList: Array<any> =[];
  userProjectListTab:  Array<any> =[];
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  currentProject: object = {};

  userProjectRole: string = "";
  user: object = {}
  projectID: string;

  iconArr: Array<string> = [
    'applications-icon.svg',
    'recovery-icon.svg',
    'infrastructure-icon.svg',
    'projects-icon.svg',
    'it-security-icon.svg',
    'budget-icon.svg',
    'it-organization-icon.svg',
    'welcome-icon.svg'
  ]

  statusInfoArr = {
    assessment: 0,
    assigned: 0,
    complete: 0,
    pending: 0,
    files: 0,
    team: 0,
    timeLapse: {
      day: 0,
      hour: 0,
      min: 0
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
  ) {
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
    this.currentProject = this.authService.getUserProject();
  }

  public selectedDate(value: any) {
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = moment(new Date(value.start)).format("MMMM DD YYYY") + ' - ' + moment(new Date(value.end)).format("MMMM DD YYYY");

  }

  onProjectSelect(data){
    this.currentProject = this.authService.getUserProject();
    this.projectID = this.currentProject['Project']['_id'] || null;
    this.ngOnInit();
  }

  changeProject(project){
    if(this.projectID != project.Project['_id'])
    {
      this.projectID = project.Project['_id'];
      this.ngOnInit();
    }
  }

  ngOnInit() {
    this.daterange.start = null;
    this.daterange.end = null;
    this.daterange.label = 'All';
    this.user = this.authService.getUser()
    if(this.currentProject)
    {
      this.projectID = this.currentProject['Project']['_id'] || null;
      this.getAllUserProject();
    }
  }


  getAllUserProject(){
    this.dataService.getUserProject().subscribe(response => {
        this.userProjectList = response.result;
        let that = this;
        this.userProjectRole = this.userProjectList.find(function(item){ return item.Project['_id'] == that.projectID})['Role']
      },
      (error) => {

      }
    );
  }
}
