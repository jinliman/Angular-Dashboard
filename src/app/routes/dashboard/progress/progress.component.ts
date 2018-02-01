import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../../shared/objectSchema';

import { DestroySubscribers } from "ng2-destroy-subscribers";

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})

@DestroySubscribers({
  addSubscribersFunc: 'addSubscribers',
  removeSubscribersFunc: 'removeSubscribers',
  initFunc: 'ngOnInit',
  destroyFunc: 'ngOnDestroy',
})

export class ProgressComponent implements OnInit {

  tableData: Array<any> = [];
  userProjectList: Array<any> =[];
  userProjectListTab:  Array<any> =[];
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

  public subscribers: any = {}

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
  ) {
    this.currentProject = this.authService.getUserProject();
    this.projectID = this.currentProject['Project']['_id'] || null;
  }

  addSubscribers(){
    this.subscribers.projectChanged = this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
  }

  onProjectSelect(data){
    this.currentProject = this.authService.getUserProject();
    this.projectID = this.currentProject['Project']['_id'] || null;
    this.initData();
  }

  changeProject(project){
    if(this.projectID != project.Project['_id'])
    {
      this.projectID = project.Project['_id'];
      this.initData();
    }
  }

  ngOnInit() {
    this.user = this.authService.getUser()
    this.initData();
  }

  initData(){
    this.loading = true;
    this.apiHandler();
  }

  apiHandler(){
    let promiseArr= [];

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAllUserProject(() => { resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => { resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getQuestionnaire(() => { resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAnswerList(() => { resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssignment(() => { resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.getTableData();
    });
  }
  eachSlice(obj, size){
    let arr = []
    for (var i = 0, l = obj.length; i < l; i += size){
      arr.push(obj.slice(i, i + size))
    }
    return arr
  };

  getAllUserProject(resolve){
    this.dataService.getUserProject().subscribe(response => {
        this.userProjectList = response.result;
        let that = this;
        this.userProjectRole = this.userProjectList.find(function(item){ return item.Project['_id'] == that.projectID})['Role']
        this.userProjectListTab = this.eachSlice(this.userProjectList, 4);
        resolve();
      },
      (error) => {

      }
    );
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
        resolve();
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
        this.userAssignment = this.getUserAssignment(this.allAssignment);
        resolve();
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

            if(this.userProjectRole == 'MEMBER' )
            {
              if(this.userAssignment['Questions'].indexOf(question_entry['uuid']) != -1 || this.userAssignment['Assessments'].indexOf(question['category_id']) != -1)
              {
                statusArr.push(status)
              }
            }else{
              statusArr.push(status)
            }
          }
        }
      }
      let getGroupPercent = this.getGroupPercent(statusArr);

      let item = { id: entry['uuid'], title: entry['Title'], percent: getGroupPercent, s:statusArr}
      this.tableData.push(item)
    }

    this.loading = false;
  }
}
