import { Component, Input, OnInit, OnChanges } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../../shared/objectSchema';
import * as moment from "moment";

@Component({
  selector: 'app-dashboard-member',
  templateUrl: './dashboard-member.component.html',
  styleUrls: ['./dashboard-member.component.scss']
})
export class DashboardMemberComponent implements OnInit, OnChanges {

  tableData: Array<any> = [];
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];
  allAssignment: Array<object> = [];
  userAssignment: object = {};

  user: object = {}
  projectID: string;
  loading: boolean;

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

  @Input() pID: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.projectID = this.pID || null;
    this.initData();
  }

  ngOnChanges(changes) {
    // pID is changed from parent
    if(changes.pID != undefined && !changes.pID.firstChange && changes.pID.currentValue != changes.pID.previousValue)
    {
      this.projectID = this.pID || null;
      this.initData()
    }
  }


  initData(){
    this.loading = true;
    this.user = this.authService.getUser()
    this.apiHandler();
  }

  apiHandler(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getQuestionnaire(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAnswerList(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssignment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getTimeLapse(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getUserAttachment(() => {resolve(); });
    }))


    Promise.all(promiseArr).then(() => {
      this.getTableData();
    });

  }
  getAssessment(resolve){
    this.dataService.getAssessmentListFlat(this.projectID).subscribe(response => {
        this.assessmentList = response.Categories;
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
        resolve()
      },
      (error) => {
      }
    );
  }

  getAnswerList(resolve){
    let data = {Project: this.projectID}
    this.dataService.getAnswerList(data).subscribe(
      response => {
        this.answers = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  getAssignment(resolve){
    let parma = { projectID: this.projectID}
    this.dataService.getAssignment(parma).subscribe(
      response => {
        this.allAssignment = response.result;
        resolve();
        this.userAssignment = this.getUserAssignment(this.allAssignment);
      },
      (error) => {
      }
    );
  }

  getUserAssignment(data){
    var result = { Questions: [], Assessments: [], QAssessments: []};
    for(let item of data)
    {
      if(item['User'] == this.user['_id'])
      {
        if(item['Type'] == 'Assessment')
          result.Assessments.push(item['AssignmentID'])
        else if(item['Type'] == 'QAssessment')
          result.QAssessments.push(item['AssignmentID'])
        else if(item['Type'] == 'Question')
          result.Questions.push(item['AssignmentID'])
      }
    }
    return result;
  }

  getTimeLapse(resolve){
    let parma = { projectID: this.projectID}
    this.dataService.getTimeLapse(parma).subscribe(
      response => {
        let data = response.result;
        if(data.startDate == null)
        {
          let currentProject = this.authService.getUserProject();
          data.startDate = currentProject['Project']['createdAt'];
        }
        let startDate = new Date(data.startDate).getTime();
        let endDate = new Date(data.endDate).getTime();
        let diffMs = endDate - startDate;
        this.statusInfoArr.timeLapse.day = Math.floor(diffMs / 86400000); // days
        this.statusInfoArr.timeLapse.hour = Math.floor((diffMs % 86400000) / 3600000); // hours
        this.statusInfoArr.timeLapse.min = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
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

  findAnswerObject(uuid, appID = null){
    for(let answer of this.answers) {
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

  uniqEs6 = (arrArg) => {
    return arrArg.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
  }

  getUserAttachment(resolve){
    let data = {ProjectID : this.projectID}
    this.dataService.getUserAttachment(data).subscribe(
        response => {
          this.statusInfoArr.files = response.result.length
          resolve();
        },
        (error) => {

        }
      );
  }

  getTableData(){
    this.tableData = [];
    for(let entry of this.assessmentList)
    {
      let questionArr = this.findQuestionObject(entry);
      let statusArr = [];
      for(let question of questionArr)
      {
        if( question && question['questions'].length )
        {
          for( let question_entry of question['questions'])
          {
            let answer_item = this.findAnswerObject(question_entry['uuid']);
            let status = answer_item && typeof answer_item['Status'] != 'undefined' ? answer_item['Status'] : 1;
            if(this.userAssignment['Questions'].indexOf(question_entry['uuid']) != -1 || this.userAssignment['Assessments'].indexOf(question['category_id']) != -1)
            {
              statusArr.push(status)
            }
          }
        }
      }
      let getGroupPercent = this.getGroupPercent(statusArr);

      let item = { id: entry['uuid'], title: entry['Title'], percent: getGroupPercent, s:statusArr}
      if(getGroupPercent == '100')
      {
        this.statusInfoArr.complete += 1;
      }
      else{
        this.statusInfoArr.pending += 1;
      }

      this.tableData.push(item)
    }
    this.statusInfoArr.assigned = this.uniqEs6((this.userAssignment['Assessments']).concat(this.userAssignment['QAssessments'])).length;
    this.statusInfoArr.assessment = this.tableData.length;
    this.loading = false;
  }

}
