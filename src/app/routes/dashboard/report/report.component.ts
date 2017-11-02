import { Component, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../../shared/objectSchema';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  tableData: Array<any> = [];
  ProjectList: Array<any> =[];
  ProjectListTab:  Array<any> =[];
  assessmentList: Array<any> = [];
  questionnaires: Array<object>= [];
  answers: Array<Answer> = [];
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  feedbackList: Array<any> = [];
  decline_reason: string;
  is_report_available: boolean;
  currentProject:object;

  user: object = {}
  projectID: string = null;
  dropdownSettings: object;
  dropdownData: Array<object> = [];
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
    let selectedProject = this.authService.getUserProject();
    this.projectID = selectedProject['Project']['_id'] || null;
  }

  onProjectSelect(data){
    this.currentProject = this.authService.getUserProject();
    this.projectID = this.currentProject['Project']['_id'] || null;
    this.initReport();
  }

  changeProject(project){
    if(this.projectID != project.Project['_id'])
    {
      this.loading = true;
      this.projectID = project.Project['_id'];
      this.getAssessment();
    }
  }

  openCheckout() {
    let that = this;
    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_GFZkKo51tFb2tpOiSxsIcAxQ',
      locale: 'auto',
      token: function (token: any) {
        console.log(token)
        that.dataService.chargePayment(token).subscribe(
          response => {
            console.log(response)
          },
          (error) => {
          }
        );
      }
    });

    handler.open({
      name: 'Payment for DV Report',
      description: 'This is the payment from',
      amount: 300
    });

  }

  ngOnInit() {
    this.dropdownSettings = {
        singleSelection: false,
        text:'--',
        selectAllText:'Select All',
        unSelectAllText:'UnSelect All',
        enableSearchFilter: false ,
        enableCheckAll: false,
        classes:"cs-dropdown-select custom-class",
      };
    this.initReport()
  }

  initReport(){
    this.loading = true;
    this.is_report_available = true;
    this.dropdownData = []
    this.getSubmittedProject();
  }

  eachSlice(obj, size){
    let arr = []
    for (var i = 0, l = obj.length; i < l; i += size){
      arr.push(obj.slice(i, i + size))
    }
    return arr
  };

  getSubmittedProject(){
    this.dataService.getUserSubmittedProject().subscribe(response => {
        this.ProjectList = response.result;
        if(this.ProjectList.length == 0 )
        {
          this.loading = false;
          this.is_report_available = false;
        }else{
          let that = this;
          this.currentProject = this.ProjectList.find(function(item){
            return item.Project['_id'] == that.projectID;
          })
          if(!this.currentProject)
          {
            this.currentProject  =  this.ProjectList[0];
            this.projectID = this.currentProject['Project']['_id'];
          }
          this.ProjectListTab = this.eachSlice(this.ProjectList, 4);
          this.getAssessment();
        }
      },
      (error) => {
      }
    );
  }

  getFeedbackList(){
    this.feedbackList['Methdology'] = this.currentProject['Methdology'] || '';
    this.feedbackList['Executive'] = this.currentProject['Executive'] || '';
    this.feedbackList['HeatMap'] = this.currentProject['HeatMap'] || '';
    this.feedbackList['Document'] = this.currentProject['Document'] || '';
    for(let item of this.currentProject['Assessments'])
    {
      this.feedbackList[item['AssignmentID']] = item['Desc'];
    }
  }
  getAssessment(){
    this.getFeedbackList();
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
    let data = {Project: this.projectID}
    this.dataService.getAnswerList(data).subscribe(
      response => {
        this.answers = response.result;
        this.getAssignment();
      },
      (error) => {
      }
    );
  }

  getAssignment(){
    let parma = { projectID: this.projectID}
    this.dataService.getAssignment(parma).subscribe(
      response => {
        this.allAssignment = response.result;
        this.getTableData();
      },
      (error) => {
      }
    );
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

  findAnswerValue(uuid, object)
  {
    let result = []
    for(let item of object['Items'])
    {
      if(item['uuid'] == uuid)
        result.push(item)
    }
    return result;
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
    console.log(this.answers)
    this.tableData = [];
    for(let entry of this.assessmentList)
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
          let answer_item = this.findAnswerObject(question_entry['uuid']);
          let appIDArr = [];
          let question_value = null;

          let status = answer_item && typeof answer_item['Status'] != 'undefined' ? answer_item['Status'] : 1;
          statusArr.push(status)

          question_value = answer_item && answer_item['value'] ? answer_item['value'] : '';

          if(question_entry['Type'] == 'Grid')
          {
            question_value = {};
            if(answer_item)
            {
              answer_item['Items'].every(function(item){
                if(appIDArr.indexOf(item['appID']) == -1)
                  appIDArr.push(item['appID'])
                question_value[item['appID'] + '_' + item['uuid']] = item['value'];
                return true;
              })
            }
          }
          if(question_entry['Type'] == 'Dropdown')
          {
            if(!this.dropdownData[question_entry.uuid])
              this.dropdownData[question_entry.uuid] = { Content: [], Selected: []}
          }
          for(let question_entry_item of question_entry['Items'])
          {
            let answer_value_item = [];
            if(answer_item)
              answer_value_item = this.findAnswerValue(question_entry_item['uuid'], answer_item);
            if(question_entry['Type'] == 'Dropdown')
            {
              this.dropdownData[question_entry.uuid]['Content'].push({"id":question_entry_item.uuid,"itemName":question_entry_item.Text})
              if(question_value && question_value.split(",").indexOf(question_entry_item.uuid) != -1)
                this.dropdownData[question_entry.uuid]['Selected'].push({"id":question_entry_item.uuid,"itemName":question_entry_item.Text})
            }
            if(question_entry['Type'] != 'Grid')
            {
              question_entry_item['value'] = answer_value_item.length ? answer_value_item[0].value : '';
            }
          }

          let question_item = { id: question_entry['uuid'], status: status, desc: question_entry['Label'], appIDs:appIDArr, value: question_value, items:question_entry['Items'],  type: question_entry['Type'], hasDocument: question_entry['HasDocument'], filename: "test.xls"}
          questionArr.push(question_item)
        }
      }
      let groupStatus = this.getGroupStatus(statusArr);

      let groupUUID = question && question['_id'] ? question['_id'] : null;
      let item = { id: entry['uuid'], uuid: groupUUID, title: entry['Title'], hasDetail: hasDetail, status: groupStatus,  open: true, questionArr: questionArr}
      this.tableData.push(item)
    }
    console.log(this.tableData)
    console.log(this.dropdownData)
    this.loading = false;
  }

}
