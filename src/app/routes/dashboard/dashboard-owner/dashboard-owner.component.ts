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
  selector: 'app-dashboard-owner',
  templateUrl: './dashboard-owner.component.html',
  styleUrls: ['./dashboard-owner.component.scss']
})
export class DashboardOwnerComponent implements OnInit {

  tableData: Array<any> = [];
  userProjectList: Array<any> =[];
  userOwnProjectList: Array<any> =[];
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  currentProject: object = {};

  userProjectRole: string = "";
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
    total: 0,
    completed: 0,
    in_progress: 0,
    hold: 0,
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
    this.loading = true;
    this.projectID = this.pID || null;
    this.currentProject = this.authService.getUserProject();
    this.user = this.authService.getUser()
    this.getAllUserProject();
  }

  getAllUserProject(){
    this.dataService.getUserProject().subscribe(response => {
        this.userProjectList = response.result;
        let that = this;
        this.userOwnProjectList = this.userProjectList.filter(function(item){ return item.Role != 'MEMBER'})
        this.getProjecStatus();
      },
      (error) => {

      }
    );
  }

  getProjecStatus(){
    let projectIDs = this.userOwnProjectList.map(function(item){return item.Project['_id']});
    let data = {
      ids: projectIDs
    }
    this.dataService.getProjectStatusList(data).subscribe(response => {
        let statusList = response.result;
        for(let projectItem of this.userOwnProjectList)
        {
          let statusItem = statusList.find(function(item){ return item['Project'] == projectItem.Project['_id']})
          if(statusItem)
          {
            projectItem['Status'] = statusItem['Status'];
            projectItem['endDate'] = statusItem['updatedAt'];
          }else{
            projectItem['Status'] = 'Pending';
            projectItem['endDate'] = null;
          }
        }
        this.getAssessment()
      },
      (error) => {

      }
    );
  }

  getAssessment(){
    this.dataService.getAssessmentListAllFlat().subscribe(response => {
        this.assessmentList = response.result;
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
        this.getAnswerListAll();
      },
      (error) => {
      }
    );
  }

  getAnswerListAll(){
    let ProjectIds = this.assessmentList.map(function(item){ return item['projectID']});
    let data = {
      ProjectIds: ProjectIds
    }
    this.dataService.getAnswerAllList(data).subscribe(
      response => {
        this.answers = response.result;
        console.log(this.answers)
        this.getTableData();
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
      let selProjectID = item['Project']['_id']
      this.router.navigate(['app/project/'+selProjectID]);
  }
  getTableData(){
    this.tableData = [];
    for(let entry of this.userOwnProjectList)
    {
      let userProjectID = entry['Project']['_id'];
      let assessment = this.assessmentList.find(function(item){ return item['projectID'] == userProjectID})
      let statusArr = [];
      for(let entry of assessment.categories)
      {
        let questionArr = this.findQuestionObject(entry);
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
      else if(entry['Status'] == 'Reject')
          this.statusInfoArr.hold++;
      else
        this.statusInfoArr.in_progress++;
      this.tableData.push(entry);
    }
    this.loading = false;
  }
}
