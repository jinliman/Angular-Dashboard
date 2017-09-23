import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';

import { Question, Answer } from '../../../shared/objectSchema';


@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit {

  tableData: Array<any> = [];
  statusArr: object;
  assessment: object = {};
  assessment_id: string = '';
  assignment: object = {};
  assignmentByUser: Array<object> = [];
  userAssignment: object = {};
  questionnaires: Array<object>= [];

  editAssessmentUrl: string = "";
  currentProject: object = {};
  team: Array<object> = [];
  teamList: Array<object> = [];
  assignDisabled: boolean = false;
  allowAnswer: boolean = false;
  userRole: string = "";
  user: object = {}
  loading: boolean;
  dropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private _notificationService: NotificationsService
  ) {
    this.user = this.authService.getUser()
  }

  ngOnInit() {

    this.statusArr = {
      0: "NA",
      1: "Complete",
      2: "Pending",
    }

    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.assessment = {};
        this.tableData = [];
        this.questionnaires = [];
        this.editAssessmentUrl = "";

        this.currentProject = this.authService.getUserProject();
        let projectID = this.currentProject['Project']['_id'] || null;
        this.userRole = this.currentProject['Role'];
        if(this.userRole == 'MEMBER')
          this.assignDisabled = true;
        this.allowAnswer = false;
        this.dropdownSettings = {
            singleSelection: false,
            text:'--',
            selectAllText:'Select All',
            unSelectAllText:'UnSelect All',
            enableSearchFilter: false ,
            enableCheckAll: false,
            classes:"cs-user-select custom-class",
            disabled: this.assignDisabled
          };

        this.loading = true;
        this.assessment_id = params['id'] || '';
        let data = {id: this.assessment_id, projectID: projectID};
        this.dataService.getAssessmentFlat(data).subscribe(
          response => {
            if(response.result == null)
              this.router.navigate(['app/dashboard']);
            this.assessment = response.result;
            this.editAssessmentUrl = "/app/assessment/"+this.assessment_id;
            this.getQuestionnaire();
            this.getTeam();
          },
          (error) => {
            this.router.navigate(['app/dashboard']);
          }
        );
      });
  }
  newArray(x,y) {
    let d = [];
    x.concat(y).forEach(item =>{
       if (d.indexOf(item) == -1)
         d.push(item);
    });
    return d;
  }
  prepareSaveData(data){
    console.log(this.tableData)
    let result ={};
    for (let member of this.teamList)
    {
      result[member['id']] = {Assessments: new Array, Questions: new Array, QAssessments: new Array};
    }
    for (let assessment of this.tableData)
    {
      this.assignment['QAssessments'][assessment['id']] =[];
      for( let question of assessment['questionArr'])
      {
        this.assignment['QAssessments'][assessment['id']] = this.newArray(this.assignment['QAssessments'][assessment['id']],question['usersAssigned'])
      }
    }
    for(var i in this.assignment['Assessments'])
    {
      for(let item of this.assignment['Assessments'][i]){
        if(result[item['id']]['Assessments'].indexOf(i) == -1)
          result[item['id']]['Assessments'].push(i)
      }
    }

    for(var i in this.assignment['Questions'])
    {
      for(let item of this.assignment['Questions'][i]){
        if(result[item['id']]['Questions'].indexOf(i) == -1)
          result[item['id']]['Questions'].push(i)
      }
    }
    for(var i in this.assignment['QAssessments'])
    {
      for(let item of this.assignment['QAssessments'][i]){
        if(result[item['id']]['QAssessments'].indexOf(i) == -1)
          result[item['id']]['QAssessments'].push(i)
      }
    }
    return result;
  }
  saveAssignment(){
    let data = {};
    data = this.prepareSaveData(this.tableData);
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID, data: data}
    this.dataService.saveAssignment(parma).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Saved!',
              'Questionnaire'
          )
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Questionnaire'
          )
        }
      },
      (error) => {
      }
    );
  }

  getAssignment(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID}
    this.dataService.getAssignment(parma).subscribe(
      response => {
        this.assignmentByUser = response.result;
        let that = this;
        this.userAssignment = this.assignmentByUser.find(function(item){ return item['User'] == that.user['_id'];})
        console.log(this.userAssignment)
        this.assignment = this.updateAssignment(this.assignmentByUser);
        this.getTableData();
        if(this.userRole != "INITIATOR")
          this.setAllowAnswer();
        console.log(this.tableData)
      },
      (error) => {
      }
    );
  }
  setAllowAnswer(){
    this.allowAnswer = true;
    let userID = this.user['_id'];
    let tmpArr = this.assignment['Assessments'][this.assessment_id] || [];
    tmpArr = tmpArr.concat(this.assignment['QAssessments'][this.assessment_id] || []);
    let tmp = tmpArr.find(function(i){
      return i['id'] == userID;
    });
    if(tmp)
      this.allowAnswer = true;
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
      for(let q_item of item['Questions'])
      {
        if(!result['Questions'][q_item])
          result['Questions'][q_item] = []
        result['Questions'][q_item].push(teamListJson[item['User']])
      }
      for(let a_item of item['Assessments'])
      {
        if(!result['Assessments'][a_item])
          result['Assessments'][a_item] = []
        result['Assessments'][a_item].push(teamListJson[item['User']])
      }
      for(let qa_item of item['QAssessments'])
      {
        if(!result['QAssessments'][qa_item])
          result['QAssessments'][qa_item] = []
        result['QAssessments'][qa_item].push(teamListJson[item['User']])
      }
    }
    return result;
  }
  getQuestionnaire(){
    this.dataService.getQAList().subscribe(
      response => {
        this.questionnaires = response.result;
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
      return {"id":item['User']['_id'],"itemName":item['User']['Name']['First']}
    })
  }
  getTableData(){

    for(let entry of [this.assessment].concat(this.assessment['children']))
    {
      let questionArr = [];
      let question = this.questionnaires.find(function(elem){
        return elem['category_id'] == entry['uuid']
      })
      let hasDetail = false;
      if( question && question['questions'].length )
      {
        hasDetail = true;
        for( let question_entry of question['questions'])
        {
          if(!this.assignment['Questions'][question_entry['uuid']])
            this.assignment['Questions'][question_entry['uuid']] = []
          let userAssignment = this.assignment['Questions'][question_entry['uuid']];

          let question_item = { id: question_entry['uuid'], status: 2, desc: question_entry['Label'], type: question_entry['Type'], filename: "test.xls",  usersAssigned: userAssignment}
          questionArr.push(question_item)
        }
      }
      if(!this.assignment['Assessments'][entry['uuid']])
        this.assignment['Assessments'][entry['uuid']] = []
      if(!this.assignment['QAssessments'][entry['uuid']])
        this.assignment['QAssessments'][entry['uuid']] = []
      let userAssignment = this.assignment['Assessments'][entry['uuid']];
      let item = { id: entry['uuid'], title: entry['Title'], hasDetail: hasDetail,  open: true, completed: false, filename: "test.xls",  usersAssigned: userAssignment, questionArr: questionArr}
      this.tableData.push(item)
    }

    this.loading = false;
  }
}
