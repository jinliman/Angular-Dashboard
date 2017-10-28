import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';

import { Question, Answer } from '../../../shared/objectSchema';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  tableData: Array<any> = [];
  statusArr: object;
  assessment: Array<object> = [];
  assessment_id: string = '';
  assignment: object = {};
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];

  editAssessmentUrl: string = "";
  currentProject: object = {};
  team: Array<object> = [];
  teamList: Array<object> = [];
  AgreeTerm: boolean = false;

  userRole: string = "";
  user: object = {}
  loading: boolean;

  completePercent: string;
  totalComplete: number;
  totalIncomplete: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private http: Http,
    private _notificationService: NotificationsService
  ) {
    this.user = this.authService.getUser()
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
  }

  onProjectSelect(data){
    this.ngOnInit();
  }

  ngOnInit() {

    this.statusArr = {
      0 : "NA",
      1 : "Pending",
      2 : "Complete"
    }

    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.assessment_id = params['id'] || '';
        this.initPage();
      });
  }

  initPage(){
    this.assessment = [];
    this.tableData = [];
    this.questionnaires = [];
    this.editAssessmentUrl = "";
    this.completePercent = '0';
    this.totalComplete = 0;
    this.totalIncomplete = 0;

    this.currentProject = this.authService.getUserProject();
    let projectID = this.currentProject['Project']['_id'] || null;
    this.userRole = this.currentProject['Role'];

    this.loading = true;

    this.dataService.getAssessmentListFlat(projectID).subscribe(
      response => {
        this.assessment = response.Categories;
        this.editAssessmentUrl = "/app/assessment/"+this.assessment_id;
        this.getQuestionnaire();
        this.getTeam();
      },
      (error) => {
        this.router.navigate(['app/dashboard']);
      }
    );
  }


  getAssignment(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID}
    this.dataService.getAssignment(parma).subscribe(
      response => {
        this.allAssignment = response.result;
        this.userAssignment = this.getUserAssignment(this.allAssignment);
        console.log(this.userAssignment)
        this.assignment = this.updateAssignment(this.allAssignment);
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

  updateAssignment(data){
    var result = { Questions: {}, Assessments: {}, QAssessments: {}};

    var teamListJson = [];
    for(let item of this.teamList)
    {
      teamListJson[item['id']] = item;
    }

    for(let item of data)
    {
      let type = item['Type'];
      if(type == "Assessment")
      {
        if(!result.Assessments[item['AssignmentID']])
          result.Assessments[item['AssignmentID']] = []
        result.Assessments[item['AssignmentID']].push(teamListJson[item['User']])
      }
      if(type == "Question")
      {
        if(!result.Questions[item['AssignmentID']])
          result.Questions[item['AssignmentID']] = []
        result.Questions[item['AssignmentID']].push(teamListJson[item['User']])
      }
      if(type == "QAssessment")
      {
        if(!result.QAssessments[item['AssignmentID']])
          result.QAssessments[item['AssignmentID']] = []
        result.QAssessments[item['AssignmentID']].push(teamListJson[item['User']])
      }
    }
    return result;
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
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {Project: projectID}
    this.dataService.getAnswerList(data).subscribe(
      response => {
        this.answers = response.result;
        console.log(this.answers)
        this.getAssignment();
      },
      (error) => {
      }
    );
  }

  getTeam(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {id: projectID}

    this.dataService.getTeamMembers(data).subscribe(
      response => {
        this.team = response.result;
        this.updateTeam();
      },
      (error) => {
      }
    );
  }

  updateTeam(){
    this.teamList  = this.team.map(function(item){
      return {"id":item['User']['_id'],"itemName":item['User']['Name']['First'], "shortname":item['User']['Name']['First'][0]+item['User']['Name']['Last'][0]}
    })
  }


  findAnswerObject(uuid, appID = null){
    for(let answer of this.answers) {
      if(answer['Questionnaire']['category_id'] == uuid)
        return answer
      for(let answer_item of answer['Answers']) {
        if(answer_item.uuid == uuid)
          return answer_item;
      }
    }
    return null;
  }

  getGroupStatus(arr)
  {
    let status = 1;
    if(arr.length)
    {
      if(arr.every(function(item){  return item == 2 || item == 0}))
        status = 2;
      if(arr.every(function(item){  return item == 0}))
        status = 0;
    }
    return status;
  }

  getTableData(){
    this.tableData = [];
    for(let entry of this.assessment)
    {
      let questionArr = [];
      let question = this.questionnaires.find(function(elem){
        return elem['category_id'] == entry['uuid']
      })

      let hasDetail = false;
      let statusArr = [];
      if( question && question['questions'].length )
      {
        hasDetail = true;
        for( let question_entry of question['questions'])
        {
          if(!this.assignment['Questions'][question_entry['uuid']])
            this.assignment['Questions'][question_entry['uuid']] = []
          let userAssignment = this.assignment['Questions'][question_entry['uuid']];
          let answer_item = this.findAnswerObject(question_entry['uuid']);
          let status = answer_item && typeof answer_item['Status'] != 'undefined' ? answer_item['Status'] : 1;

          if(this.userRole == "MEMBER")
          {
            if(this.userAssignment['Questions'].indexOf(question_entry['uuid']) != -1 || this.userAssignment['Assessments'].indexOf(question['category_id']) != -1)
            {
              statusArr.push(status)

              if(status == 0 || status == 2)
                this.totalComplete ++;
              else
                this.totalIncomplete ++;
            }
          }else{
            statusArr.push(status)

            if(status == 0 || status == 2)
              this.totalComplete ++;
            else
              this.totalIncomplete ++;
          }

          let question_item = { id: question_entry['uuid'], status: status, desc: question_entry['Label'], type: question_entry['Type'], hasDocument: question_entry['HasDocument'], filename: "test.xls",  usersAssigned: userAssignment}
          questionArr.push(question_item)
        }
      }
      let groupStatus = this.getGroupStatus(statusArr);
      let completed = [0,2].indexOf(groupStatus) != -1? true: false;
      if(!this.assignment['Assessments'][entry['uuid']])
        this.assignment['Assessments'][entry['uuid']] = []
      if(!this.assignment['QAssessments'][entry['uuid']])
        this.assignment['QAssessments'][entry['uuid']] = []
      let userAssignment = this.assignment['Assessments'][entry['uuid']];
      let groupUUID = question && question['_id'] ? question['_id'] : null;

      let answer_group = this.findAnswerObject(entry['uuid']);
      let updated_at = answer_group && answer_group['updatedAt'] ? answer_group['updatedAt'] : null;
      let item = { id: entry['uuid'], uuid: groupUUID, title: entry['Title'], hasDetail: hasDetail, completed_date: updated_at, completed: completed, status: groupStatus,  open: false,  usersAssigned: userAssignment, questionArr: questionArr}
      if(hasDetail)
        this.tableData.push(item)
    }

    if(this.totalComplete == 0)
      this.completePercent = '0';
    else
      this.completePercent = (this.totalComplete / (this.totalComplete + this.totalIncomplete) * 100).toFixed(0);
    console.log(this.tableData)
    this.loading = false;
  }

  submitProject(modal){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {Project: projectID}
    this.dataService.submitProject(data).subscribe(
      response => {
        this._notificationService.success(
            'Successfully Saved!',
            'Submission'
        )
        modal.close();
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong',
            'Submission'
        )
        modal.close();
      }
    );
  }
}
