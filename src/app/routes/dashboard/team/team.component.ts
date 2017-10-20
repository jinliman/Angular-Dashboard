import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  tableData: Array<any>;
  statusArr: object;
  assessmentArr: Array<object> = [];
  assignment: Array<object> = []
  currentProject: object;
  team: Array<object> = [];
  answerList: Array<object> = [];
  statusList: Array<object> = [];
  PrimaryEmail: string = "";
  TeamEmail: Array<object> = [];
  hasPrimary: boolean = false;

  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) {
  }

  updateTableData(){
    let data = [];

    for(let user_item of this.team)
    {
      let userItem:object = {};
      userItem['username'] = user_item['User']['Name']['First'] + ' ' + user_item['User']['Name']['Last'];
      userItem['shortname'] = user_item['User']['Name']['First'].charAt(0) + user_item['User']['Name']['Last'].charAt(0);
      userItem['open'] = true;
      let userAssessments = []
      for(let item of this.assessmentArr)
      {
        let assignment_item = this.assignment.find(function(e){
          return e['User'] == user_item['User']['_id'] && e['AssignmentID'] == item['uuid'] && ['Assessment','QAssessment'].indexOf(e['Type']) != -1;
        })
        if(assignment_item)
        {
          let userAssessmentItem:object = {};
          userAssessmentItem['desc'] = item['Desc'];
          userAssessmentItem['title'] = item['Title'];
          userAssessmentItem['assigned_on'] = assignment_item['updatedAt'];
          let status_item = this.statusList.find(function(e){
            return e['User'] == user_item['User']['_id'] && e['AssessmentID'] == item['uuid'];
          })
          if(status_item)
          {
            userAssessmentItem['status'] = status_item['Status'];
            userAssessmentItem['completed_at'] = status_item['Completed_at'];;
          }else{
            userAssessmentItem['status'] = 0;
            userAssessmentItem['completed_at'] = '';
          }
          userAssessments.push(userAssessmentItem);
        }
      }
      userItem['hasDetail'] = (userAssessments.length>0) ? true: false;
      userItem['assessments'] = userAssessments;
      data.push(userItem);
    }
    return data;
  }

  getAssessment(projectID){
    this.dataService.getAssessmentListFlat(projectID).subscribe(
      response => {
        this.assessmentArr = response.Categories;
        this.getAssignment();
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
        this.assignment = response.result;
        this.getAnswerList();
      },
      (error) => {
      }
    );
  }
  inviteTeam(modal){
    this.hasPrimary = this.hasPrimaryMember()
    this.TeamEmail = [{"name": "teammember1", "value": ""}];
    this.PrimaryEmail = '';
    modal.open();
  }

  hasPrimaryMember(){
    let primary =  this.team.find(function(e){
      return e['Role'] == "PRIMARY"
    })
    return !!primary;
  }

  addNewTeamMembr(){
    let newIndex = this.TeamEmail.length + 1;
    this.TeamEmail.push({"name": "teammember" + newIndex, "value": ""});
  }

  removeTeamMemeber(index){
    this.TeamEmail.splice(index, 1);
  }

  inviteTeamMembers(modal){
    let token = this.authService.getToken()
    let projectID = this.currentProject['Project']['_id'];
    let data = {
      Token       : token,
      ProjectID   : projectID,
      Primary     : this.PrimaryEmail,
      TeamMember  : this.TeamEmail.map(function(obj){ return obj['value']})
    }

    this.authService.inviteUser(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Sent!',
              'Category'
          );
          modal.close();
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Category'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong',
            'Category'
        )
      }
    );
  }

  getAnswerList(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {
      Project: projectID
    }
    this.dataService.getAnswerList(data).subscribe(
      response => {
          this.answerList = response.result;
          this.statusList = this.updateAnswerList();
          this.tableData = this.updateTableData();
          console.log(this.statusList)
          this.loading = false;
      },
      (error) => {

      }
    );
  }

  updateAnswerList(){
    let result = [];
    console.log(this.assignment)
    for(let item of this.answerList)
    {
      let status_item = { AssessmentID: item['Questionnaire']['category_id'], User: item['User'], Status: 0, Completed_at: ''};
      let status = 0;
      if(item['Answers'])
      {
        status = 2;
        status_item['Completed_at'] = item['updatedAt'];
      }
      let stats_completed = true;
      for(var i in item['Questionnaire']['questions'])
      {
        let question_item = item['Questionnaire']['questions'][i];

        if(item['Answers'])
        {
          let answer_item = item['Answers'][i];
          for(var j in question_item['Items'])
          {
            switch(question_item['Type'])
            {
              case 'Text':
                if(!answer_item || !answer_item['Items'][j]['value'] || (answer_item['Items'][j]['value'] && answer_item['Items'][j]['value'] == ""))
                  stats_completed = false;
                break;
              case 'Radio':
              case 'Dropdown':
                if(!answer_item || !answer_item['value'] || (answer_item['value'] && answer_item['value'] == ""))
                  stats_completed = false;
                break;
              case 'Checkbox':
                if(!answer_item || !answer_item['Items'][j]['value'])
                  stats_completed = false;
                break;
              default:
                break;
            }
          }
        }
      }
      if(!stats_completed)
        status = 1;
      status_item.Status = status;
      result.push(status_item);
    }
    return result;
  }
  ngOnInit() {
    this.loading = true;
    this.TeamEmail = [{"name": "teammember1", "value": ""}];
    this.currentProject = this.authService.getUserProject();
    let projectID = this.currentProject['Project']['_id'];
    let data = {id: projectID}
    this.dataService.getTeam(data).subscribe(
      response => {
        this.team = response.result;
        this.getAssessment(projectID)
      },
      (error) => {

      }
    );

    this.statusArr = {
      0: "Not Started",
      1: "Started",
      2: "Completed",
    }
  }

}
