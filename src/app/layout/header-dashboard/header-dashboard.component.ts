import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../shared/objectSchema';

@Component({
  selector: 'app-header-dashboard',
  templateUrl: './header-dashboard.component.html',
  styleUrls: ['./header-dashboard.component.scss']
})
export class HeaderDashboardComponent implements OnInit {

  userInfo : object;
  userProjects : Array<object> = [];
  projectList: Array<object> = [];
  currentProject: object = null;
  projectID: string;
  userProjectRole: string;
  isSignoff : boolean;
  loadProjectList: boolean = false;
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];

  firstname: string = 'Admin';
  shortname: string = 'DV';
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {
    this.dataService.progressChanged.subscribe(data => this.onProgressChanged(data));
    this.dataService.projectListUpdated.subscribe(data => this.onProjectListUpdated(data));
    this.dataService.projectSubmitted.subscribe(data => this.onProjectSubmitted());
  }

  onProjectSubmitted(){
    this.updateSignOff();
  }

  onProjectListUpdated(data){
    this.loadProjectList = false;
    this.dataService.onProjectChanged(data);
    this.getProjectList();
  }

  onProgressChanged(data){
    this.updateSignOff();
  }

  onSelectProject($event){
    let selectedProject = this.userProjects.find(function(item){ return item['Project']['_id'] == $event['value'] });
    this.dataService.onProjectChanged(selectedProject);
    this.projectID = $event['value'];
    this.updateSignOff();
  }

  getProjectList(){
    this.dataService.getUserProject().subscribe(response => {
        this.userProjects = response.result;
        console.log(this.userProjects)
        this.projectList = this.userProjects.map(function(item){
            return {'value': String(item['Project']['_id']), 'label': item['Project']['Name']};
        })
        this.updateSignOff();
      },
      (error) => {

      }
    );

  }
  ngOnInit() {
    this.loadProjectList = false;
    this.userInfo = this.authService.getUser()
    if(this.userInfo['Role'] != 'admin')
    {
      this.firstname = this.userInfo['Name']['First']
      this.shortname = this.userInfo['Name']['First'][0] + this.userInfo['Name']['Last'][0];
      this.getProjectList();
    }
  }

  updateSignOff(){
    let that = this;
    this.isSignoff = false;
    let tProject = this.authService.getUserProject();
    let data = { projectID: tProject['Project']['_id']}
    this.dataService.getProject(data).subscribe(response => {
        this.currentProject = response.result;
        this.projectID = this.currentProject['Project']['_id'] || null;
        this.userProjectRole = this.currentProject['Role']
        this.loadProjectList = true;
        let projectStatus = this.currentProject && this.currentProject['Status'] ? this.currentProject['Status'] : 'Pending';
        console.log(this.currentProject)
        if(this.userProjectRole == 'PRIMARY' && ['Pending', 'Reject'].indexOf(projectStatus) != -1)
        {
          this.getAssessment();
        }
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
    let data = {
      Project: this.projectID
    }
    this.dataService.getAnswerList(data).subscribe(
      response => {
        this.answers = response.result;
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
    let entry = this.assessmentList[0]
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
    if(getGroupPercent == '100')
      this.isSignoff = true;
  }
}
