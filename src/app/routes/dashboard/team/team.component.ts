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
  projectID: string = '';
  userMembershipInfo : object = {};
  canAdd: boolean = true;
  hasPrimary: boolean = false;
  userRole: string = "";
  maxTeamCount: object = {}

  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) {
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect());
    this.maxTeamCount = {
      'Premium': 1,
      'Professional': 3
    }
  }

  onProjectSelect(){
      this.ngOnInit();
  }

  getUserMembership(resolve){
    this.loading = true;
    this.dataService.getUserMembership().subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE")
        {
          this.userMembershipInfo = response.result.Membership;
        }else {

        }
        resolve();
      },
      (error) => {

      }
    );
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

  getTeam(resolve){
    let data = {id: this.projectID}
    this.dataService.getTeam(data).subscribe(
      response => {
        this.team = response.result;
        resolve();
      },
      (error) => {

      }
    );
  }

  getAssessment(resolve){
    let projectID = this.projectID;
    this.dataService.getAssessmentListFlat(projectID).subscribe(
      response => {
        this.assessmentArr = response.Categories;
        resolve();
      },
      (error) => {

      }
    );
  }
  getAssignment(resolve){
    let projectID = this.projectID;
    let parma = { projectID: projectID}
    this.dataService.getAssignment(parma).subscribe(
      response => {
        this.assignment = response.result;
        resolve();
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
    this.updateCanAdd();
  }

  removeTeamMemeber(index){
    this.TeamEmail.splice(index, 1);
    this.updateCanAdd();
  }

  updateCanAdd(){
    let teamMemberCount = this.team.length + this.TeamEmail.length;
    console.log(this.userMembershipInfo['Type'],this.team.length,this.TeamEmail.length)
    if(this.userMembershipInfo['Type'] == 'Premium' && teamMemberCount > this.maxTeamCount['Premium'])
    {
      this.canAdd = false;
    }else if(this.userMembershipInfo['Type'] == 'Professional' && teamMemberCount > this.maxTeamCount['Professional'])
    {
      this.canAdd = false;
    }else{
      this.canAdd = true;
    }
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
              'Invitation Sent!',
              'Team'
          );
          modal.close();
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Team'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong',
            'Team'
        )
      }
    );
  }

  getAnswerList(resolve){
    let projectID = this.projectID;
    let data = {
      Project: projectID
    }
    this.dataService.getAnswerList(data).subscribe(
      response => {
          this.answerList = response.result;
          resolve();
      },
      (error) => {

      }
    );
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

  updateAnswerList(){
    let result = [];
    for(let item of this.answerList)
    {
      let status_item = { AssessmentID: item['Questionnaire']['category_id'], User: item['User'], Status: 0, Completed_at: ''};
      let status = 0;
      if(typeof item['Answers'] == 'undefined')
      {
        status = 1;
      }else{
        let statusArr = []
        for(let answer_item of item['Answers'])
        {
          statusArr.push(answer_item['Status'])
        }
        status = this.getGroupStatus(statusArr)
      }

      status_item.Status = status;
      result.push(status_item);
    }
    return result;
  }

  apiHandler(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getTeam(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssignment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAnswerList(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getUserMembership(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.initData();
    });
  }
  initData(){
    this.updateCanAdd();
    this.statusList = this.updateAnswerList();
    this.tableData = this.updateTableData();
    this.loading = false;
  }
  ngOnInit() {
    this.loading = true;
    this.TeamEmail = [{"name": "teammember1", "value": ""}];
    this.currentProject = this.authService.getUserProject();
    this.userRole = this.currentProject['Role'];
    this.projectID = this.currentProject['Project']['_id'] || null;;
    this.apiHandler();

    this.statusArr = {
      0: "NA",
      1: "Pending",
      2: "Completed",
    }
  }

}
