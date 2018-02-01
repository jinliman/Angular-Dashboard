import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

import { environment } from '../../../../environments/environment';
import { DestroySubscribers } from "ng2-destroy-subscribers";

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

@DestroySubscribers({
  addSubscribersFunc: 'addSubscribers',
  removeSubscribersFunc: 'removeSubscribers',
  initFunc: 'ngOnInit',
  destroyFunc: 'ngOnDestroy',
})

export class FilesComponent implements OnInit {

  public subscribers: any = {}

  tableData: Array<any> = [];
  assessmentArr: Array<object> = [];
  questionnaires: Array<object> = [];
  attachmentArr: Array<object> = [];
  currentProject: object;
  userRole: string = "";
  loading: boolean;
  projectID: string = null;
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {

  }

  ngOnInit() {
    this.initData();
  }

  initData(){
    this.loading = true;
    this.tableData = [];
    this.currentProject = this.authService.getUserProject();
    this.userRole = this.currentProject['Role'];
    this.projectID = this.currentProject['Project']['_id'];
    this.apiHandler();
  }

  addSubscribers(){
    this.subscribers.projectChanged = this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
  }

  onProjectSelect(data){
    this.initData();
  }

  apiHandler(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => { resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => { resolve(); });
    }))
    promiseArr.push(new Promise((resolve, reject) => {
      this.getQuestionnaire(() => { resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAttachment(() => { resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.getTableData();
    });
  }

  getTableData(){
    for( let item of this.assessmentArr)
    {
      let assessment_item = { title: item['Title'], hasQuestions: false, questions: [], open: false}
      let questions = this.questionnaires.find(x => x['category_id'] == item['uuid'])
      if(questions && questions['questions'])
      {
        let custom_questions = []
        for( let q_item of questions['questions'])
        {
          let attachments = this.attachmentArr.filter(x => x['AssignmentID'] == q_item['uuid'])
          for( let attachment_item of attachments)
          {
            let tmp_attachment_item = Object.assign({}, q_item);
            tmp_attachment_item['attachment'] = attachment_item;
            if(attachment_item['SourceType'] == 'Computer')
            {
              tmp_attachment_item['attachment']['Url'] = environment.serverUrl + '/' + tmp_attachment_item['attachment']['Url']
            }
            tmp_attachment_item['attachment']['User']['Name']['shortname'] = attachment_item['User']['Name']['First'][0] + attachment_item['User']['Name']['Last'][0];
            custom_questions.push(tmp_attachment_item);
          }
        }
        assessment_item['questions'] = custom_questions;
        assessment_item['hasQuestions'] = true;
      }
      this.tableData.push(assessment_item);
    }
    this.loading = false;
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
  getAttachment(resolve){
    let projectID = this.projectID || null;
    let data = {ProjectID : projectID}
    this.dataService.getAttachment(data).subscribe(
        response => {
          this.attachmentArr = response.result;
          resolve();
        },
        (error) => {

        }
      );
  }

  getAssessment(resolve){
    let projectID = this.projectID || null;
    this.dataService.getAssessmentListFlat(projectID).subscribe(
      response => {
        this.assessmentArr = response.Categories;
        resolve();
      },
      (error) => {

      }
    );
  }
}
