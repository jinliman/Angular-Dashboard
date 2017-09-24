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
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  questionnaires: Array<object>= [];
  newAssignments: Array<object> = []

  editAssessmentUrl: string = "";
  currentProject: object = {};
  team: Array<object> = [];
  teamList: Array<object> = [];
  assignDisabled: boolean = false;
  allowAnswer: boolean = false;
  allowAssign: boolean = false;
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
        this.assessment_id = params['id'] || '';
        this.initPage();
      });
  }

  initPage(){
    this.assessment = {};
    this.tableData = [];
    this.questionnaires = [];
    this.newAssignments = [];
    this.editAssessmentUrl = "";

    this.currentProject = this.authService.getUserProject();
    let projectID = this.currentProject['Project']['_id'] || null;
    this.userRole = this.currentProject['Role'];
    this.allowAnswer = false;
    if(this.userRole != "MEMBER")
      this.allowAssign = true;
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
  }
  newArray(x,y) {
    let d = [];
    x.concat(y).forEach(item =>{
       if (d.indexOf(item) == -1)
         d.push(item);
    });
    return d;
  }

  onAssignmentSelect(event, assignment, type, parent_assessment = null){
    this.onAssignmentSelectCustom(event, assignment['id'], type)
    if(type == 'Question')
    {
      this.onAssignmentSelectCustom(event, parent_assessment['id'], 'QAssessment')
    }
  }

  onAssignmentSelectCustom(event, assignment_id, type){
    let userID = event.id;
    let item = this.allAssignment.find(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type;
    });

    let item1 = this.newAssignments.find(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type  && e['Action'] == 'add';
    });

    if(!item && !item1)
      this.newAssignments.push({User: userID, AssignmentID: assignment_id, Type: type, Action: 'add'});
    console.log(this.newAssignments)
  }

  onAssignmentDeSelect(event, assignment, type, parent_assessment = null){
    this.onAssignmentDeSelectCustom(event, assignment['id'], type)
    if(type == 'Question')
    {
      let count = 0;
      for(let item of parent_assessment.questionArr)
      {
        let tmp = item.usersAssigned.find(function(e){
          return e.id == event.id
        })
        if(tmp)
          count++;
      }
      if(!count)
        this.onAssignmentDeSelectCustom(event, parent_assessment['id'], 'QAssessment')
    }
  }

  onAssignmentDeSelectCustom(event, assignment_id, type, assessment_id1 = null){
    let userID = event.id;

    let index = this.newAssignments.findIndex(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type && e['Action'] == 'add';
    })
    if( index >= 0)
      this.newAssignments.splice(index, 1)
    let item = this.allAssignment.find(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type;
    })

    if(item)
      this.newAssignments.push({id: item['_id'], User: userID, AssignmentID: assignment_id, Type: type, Action: 'delete'});
    console.log(this.newAssignments)
  }

  saveAssignment(){
    console.log(this.newAssignments)
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID, data: this.newAssignments}
    this.dataService.saveAssignment(parma).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Saved!',
              'Assignment'
          )
          this.newAssignments = [];
          this.loading = true;
          this.getAssignment()
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Assignment'
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
        this.allAssignment = response.result;
        this.userAssignment = this.getUserAssignment(this.allAssignment);
        console.log(this.userAssignment)
        this.assignment = this.updateAssignment(this.allAssignment);
        this.getTableData();
        if(this.userRole != "INITIATOR")
          this.setAllowAnswer();
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
        this.getAssignment();
      },
      (error) => {
      }
    );
  }

  getTeam(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {id: projectID}

    if(this.userRole == "INITIATOR")
    {
      this.dataService.getTeam(data).subscribe(
        response => {
          this.team = response.result;
          this.updateTeam();
        },
        (error) => {
        }
      );
    }else
    {
      this.dataService.getTeamMembers(data).subscribe(
        response => {
          this.team = response.result;
          this.updateTeam();
        },
        (error) => {
        }
      );
    }
  }

  updateTeam(){
    this.teamList  = this.team.map(function(item){
      return {"id":item['User']['_id'],"itemName":item['User']['Name']['First']}
    })
  }
  getTableData(){
    this.tableData = [];
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
