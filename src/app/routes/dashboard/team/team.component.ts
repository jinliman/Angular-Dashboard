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

    console.log(this.assessmentArr)
    console.log(this.team)
    for(let user_item of this.team)
    {
      let userItem:object = {};
      userItem['username'] = user_item['User']['Name']['First'] + ' ' + user_item['User']['Name']['Last'];
      userItem['shortname'] = user_item['User']['Name']['First'].charAt(0) + user_item['User']['Name']['Last'].charAt(0);
      userItem['open'] = false;
      let userAssessments = []
      for(let item of this.assessmentArr)
      {
        let assignment_item = this.assignment.find(function(e){
          return e['User'] == user_item['User']['_id'] && e['AssignmentID'] == item['uuid'] && ['Assessment','QAssessment'].indexOf(e['Type']) != -1;
        })
        if(assignment_item)
        {
          let userAssessmentItem:object = {};
          userAssessmentItem['status'] = 0;
          userAssessmentItem['desc'] = item['Desc'];
          userAssessmentItem['title'] = item['Title'];
          userAssessmentItem['assigned_on'] = assignment_item['updatedAt'];
          userAssessmentItem['completed_at'] = assignment_item['updatedAt'];
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
        this.tableData = this.updateTableData();
        this.loading = false;
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
