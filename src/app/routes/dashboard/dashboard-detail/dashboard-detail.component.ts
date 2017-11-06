import { Component, Input, OnInit } from '@angular/core';
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
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss']
})
export class DashboardDetailComponent implements OnInit {

  tableData: Array<any> = [];
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  selectedProject: object = {};
  team: Array<object> = [];
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.loading = true;

    this.user = this.authService.getUser()
    this.route
    .params
    .subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.projectID = params['id'] || '';
      this.getProject();
    });
  }

  getProject(){
    let data = { projectID: this.projectID}
    this.dataService.getProject(data).subscribe(response => {
        this.selectedProject = response.result;
        this.getAssessment();
        this.getAttachment();
        this.getTeam();
        this.getTimeLapse();
      },
      (error) => {

      }
    );
  }

  getAssessment(){
    this.dataService.getAssessmentListFlat(this.projectID).subscribe(response => {
        this.assessmentList = response.Categories;
        this.getQuestionnaire();
      },
      (error) => {

      }
    );
  }

  getQuestionnaire(){
    this.dataService.getQAList().subscribe(
      response => {
        this.questionnaires = response.result;
        this.getAnswerList();
      },
      (error) => {
      }
    );
  }

  getAnswerList(){
    let data = {Project: this.projectID}
    this.dataService.getAnswerList(data).subscribe(
      response => {
        this.answers = response.result;
        this.getAssignment();
      },
      (error) => {
      }
    );
  }

  getAssignment(){
    let parma = { projectID: this.projectID}
    this.dataService.getAssignment(parma).subscribe(
      response => {
        this.allAssignment = response.result;
        this.userAssignment = this.getUserAssignment(this.allAssignment);
        this.getTableData();
      },
      (error) => {
      }
    );
  }

  getUserAssignment(data){
    var result = { Questions: [], Assessments: [], QAssessments: []};
    for(let item of data)
    {
      if(item['Type'] == 'Assessment')
        result.Assessments.push(item['AssignmentID'])
      else if(item['Type'] == 'QAssessment')
        result.QAssessments.push(item['AssignmentID'])
      else if(item['Type'] == 'Question')
        result.Questions.push(item['AssignmentID'])
    }
    return result;
  }

  getTimeLapse(){
    let parma = { projectID: this.projectID}
    this.dataService.getTimeLapse(parma).subscribe(
      response => {
        let data = response.result;
        if(data.startDate == null)
        {
          data.startDate = this.selectedProject['Project']['createdAt'];
        }
        let startDate = new Date(data.startDate).getTime();
        let endDate = new Date(data.endDate).getTime();
        let diffMs = endDate - startDate;
        this.statusInfoArr.timeLapse.day = Math.floor(diffMs / 86400000); // days
        this.statusInfoArr.timeLapse.hour = Math.floor((diffMs % 86400000) / 3600000); // hours
        this.statusInfoArr.timeLapse.min = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
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

  getAttachment(){
    let data = {ProjectID : this.projectID}
    this.dataService.getAttachment(data).subscribe(
        response => {
          this.statusInfoArr.files = response.result.length
        },
        (error) => {

        }
      );
  }

  getTeam(){
    let data = {id: this.projectID}

    this.dataService.getTeamMembers(data).subscribe(
      response => {
        this.team = response.result;
        this.statusInfoArr.team = this.team.length;
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
            statusArr.push(status)
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
