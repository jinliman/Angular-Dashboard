import { Component, Input, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../shared/objectSchema';
import { environment } from '../../../environments/environment';
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
  ProjectList: Array<any> = [];
  ProjectUsers: Array<any> = [];

  tableData: Array<any> = [];
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];

  statusInfoArr = {
    total: 0,
    completed: 0,
    in_progress: 0,
    reject: 0,
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
      reject: 0,
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
      this.apiHandlerProjectTable()
    });
  }

  public apiHandlerProjectTable(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getProjecStatus(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getQuestionnaire(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAnswerListAll(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.getTableData();
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

  getProjecStatus(resolve){
    for(let projectItem of this.ProjectList)
    {
      let statusItem = projectItem['Status'];

      var currentTime = new Date(projectItem['createdAt']);
      if(currentTime.getDay() == 0)
        currentTime.setDate(currentTime.getDate()+15);
      else if(currentTime.getDay() == 6)
        currentTime.setDate(currentTime.getDate()+16);
      else
        currentTime.setDate(currentTime.getDate()+14);

      projectItem['deadlineDate'] = currentTime;
      if(statusItem)
      {
        projectItem['Status'] = statusItem['Status'];
        projectItem['endDate'] = statusItem['submitDate'];
      }else{
        projectItem['Status'] = 'Pending';
        projectItem['endDate'] = null;
      }
    }
    resolve();
  }

  getAssessment(resolve){
    this.dataService.getAdminAssessmentListFlatProject().subscribe(response => {
        this.assessmentList = response.result;
        resolve();
      },
      (error) => {

      }
    );
  }

  getQuestionnaire(resolve){
    this.dataService.getQAList().subscribe(
      response => {
        this.questionnaires = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  getAnswerListAll(resolve){
    this.dataService.getAdminAnswerList().subscribe(
      response => {
        this.answers = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  getAllCatIds(entry)
  {
    let idArr = []
    function recursive(obj){
      idArr.push(obj.uuid)
      if(obj.children)
      {
        for(let item of obj.children){
            recursive(item);
        }
      }
    }
    recursive(entry)
    return idArr;
  }

  findQuestionObject(entry)
  {
    let idArr = this.getAllCatIds(entry)
    let result = [];
    for(let item of this.questionnaires)
    {
      if(idArr.indexOf(item['category_id']) != -1)
        result.push(item);
    }

    return result;
  }

  findAnswerObject(userProjectID, uuid, appID = null){
    for(let answer of this.answers) {
      if(answer['Project'] != userProjectID)
        continue;
      if(answer['Questionnaire'] == uuid)
        return answer
      for(let answer_item of answer['Answers']) {
        if(answer_item.uuid == uuid)
          return answer_item;
      }
    }
    return null;
  }

  getGroupPercent(arr)
  {
    let completedCnt = 0;
    let percent = '0';
    arr.forEach(function(item){
      if(item == 2 || item == 0)
        completedCnt += 1;
    })
    if(completedCnt)
      percent = (completedCnt / arr.length * 100).toFixed(0);
    return percent;
  }

  viewDetail(item){
      let selProjectID = item['_id']
      this.router.navigate([environment.adminUrl + 'project/'+selProjectID]);
  }
  getTableData(){
    this.tableData = [];
    for(let entry of this.ProjectList)
    {
      let userProjectID = entry['_id'];
      let assessment = this.assessmentList.find(function(item){ return item['projectID'] == userProjectID})
      let statusArr = [];
      for(let assessment_item of assessment.categories)
      {
        let questionArr = this.findQuestionObject(assessment_item);
        for(let question of questionArr)
        {
          if( question && question['questions'].length )
          {
            for( let question_entry of question['questions'])
            {
              let answer_item = this.findAnswerObject(userProjectID, question_entry['uuid']);
              let status = answer_item && typeof answer_item['Status'] != 'undefined' ? answer_item['Status'] : 1;

              statusArr.push(status)
            }
          }
        }
      }
      let getGroupPercent = this.getGroupPercent(statusArr);
      entry['progress'] = getGroupPercent;
      this.statusInfoArr.total++;
      if(entry['Status'] == 'Accept')
        this.statusInfoArr.completed++;
      else if(entry['Status'] == 'Hold')
          this.statusInfoArr.hold++;
      else
        this.statusInfoArr.in_progress++;
      this.tableData.push(entry);
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
