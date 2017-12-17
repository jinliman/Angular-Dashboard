import { Component, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../../shared/objectSchema';

import { environment } from '../../../../environments/environment';
import { NotificationsService } from 'angular2-notifications';

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
  is_report_available: string;
  currentProject:object;
  menu: Array<any> = [];
  attachment: Array<any> = [];
  project_info: any = {};
  project_users: any = [];
  address_info: Array<any> = [];
  userMembershipInfo: object= {}
  hasValidMembership: boolean = false;

  user: object = {}
  projectID: string = null;
  dropdownSettings: object;
  dropdownData: Array<object> = [];
  document_menu: any = [];
  heatmapData: Array<object> = [];
  heatmapScoreDescription: object = {};
  heatmapScoreDescriptionOrg: Array<object> = [];
  metricList: Array<object> = [];
  metricColorList: Array<object> = [];
  metricData: Array<object> = [];
  metricDataList: Array<object> = [];
  activeTab = 'cover_page';
  loading: boolean;
  Promocode: object = {
    ErrorStr: '',
    Percent: 0,
    Code: '',
    Has: true,
    Passed: false
  }
  paymentProjectId: string = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private _notificationService: NotificationsService
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
      this.currentProject = project;
      this.apiHandler();
    }
  }

  openCheckout(modal,id) {
    this.Promocode = {
      ErrorStr: '',
      Percent: 0,
      Code: '',
      Has: true,
      Passed: false
    }
    this.paymentProjectId = id;
    modal.open();
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
    this.metricList = this.dataService.getKeymetricList();
    this.metricColorList = this.dataService.getMetricColorList();
    this.getUserMembership();
  }

  getUserMembership(){
    this.loading = true;
    this.dataService.getUserMembership().subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == "ERR_NONE")
        {
          this.userMembershipInfo = response.result.Membership;
          let currentTime = new Date();
          this.hasValidMembership = new Date(this.userMembershipInfo['EndDate']) > currentTime
          this.initReport()
        }else {

        }
      },
      (error) => {

      }
    );
  }

  initReport(){
    this.loading = true;
    this.is_report_available = 'Available';
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
        let that = this;
        let validProjectList = this.ProjectList.filter(function(item){ return (item['Paid'] == true) || that.hasValidMembership})
        this.ProjectListTab = this.eachSlice(this.ProjectList, 4);
        if(validProjectList.length == 0 )
        {
          this.loading = false;
          if(this.ProjectList.length)
          {
            this.is_report_available = 'NotAvailabe';
          }
          else{
            this.is_report_available = 'NotReport';
          }
        }else{
          this.is_report_available = 'Available';
          let that = this;
          this.currentProject = validProjectList.find(function(item){
            return item.Project['_id'] == that.projectID;
          })
          if(!this.currentProject)
          {
            this.currentProject  =  validProjectList[0];
            this.projectID = this.currentProject['Project']['_id'];
          }
          this.apiHandler();
        }
      },
      (error) => {
      }
    );
  }

  apiHandler(){
    this.address_info = [];
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getQuestionnaire(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAnswerList(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssignment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getProjectUsers(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getProjectAttachment(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getCountry(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getState(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getCity(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getHeatmapDescription(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getHeatmap(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.getTableData();
    });
  }

  getHeatmap(resolve){
    let data = {projectID: this.projectID}
    this.dataService.getHeatmap(data).subscribe(
      response => {
        this.heatmapData  = response.result.Heatmap;
        this.metricData  = response.result.Metrics;
        resolve();
      },
      (error) => {

      }
    );
  }

  getHeatmapDescription(resolve)
  {
    this.dataService.getHeatmapDesc().subscribe(
      response => {
        this.heatmapScoreDescriptionOrg = response.result;
        for(let item of this.heatmapScoreDescriptionOrg)
        {
          this.heatmapScoreDescription[item['label']] = item['description']
        }
        resolve();
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
  getAssessment(resolve){
    this.getFeedbackList();
    this.dataService.getAssessmentList(this.projectID).subscribe(response => {
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
        resolve();
      },
      (error) => {
      }
    );
  }

  getProjectAttachment(resolve){
    let data = {id: this.projectID}
    this.dataService.getProjectAttachment(data).subscribe(
      response => {
        this.attachment = response.result;
        resolve();
      },
      (error) => {

      }
    );
  }

  getProjectUsers(resolve){
    let data = {id: this.projectID}
    this.dataService.getProjectUsers(data).subscribe(
      response => {
        this.project_users = response.result;
        resolve();
      },
      (error) => {

      }
    );
  }

  getCountry(resolve){
    let data = {id: this.currentProject['Project']['Company']['Country']}
    this.dataService.getCountryItem(data).subscribe(
      response => {
        this.address_info['Country'] = response.result;
        resolve();
      },
      (error) => {

      }
    );
  }

  getState(resolve)
  {
    let data = {id: this.currentProject['Project']['Company']['State']}
    this.dataService.getStateItem(data).subscribe(
      response => {
        this.address_info['State'] = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  getCity(resolve)
  {
    let data = {id: this.currentProject['Project']['Company']['City']}
    this.dataService.getCityItem(data).subscribe(
      response => {
        this.address_info['City'] = response.result;
        resolve();
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

  getFileUrl(file){
    let url = file.Url;
    if( file.SourceType == 'Computer' )
      url = environment.serverUrl + '/' + url;
    return url;
  }
  getDes(label)
  {
    let result = this.heatmapScoreDescription[label];
    return result || 'Not Available';
  }
  getDes1(label)
  {
    return label || 'Not Available';
  }
  updateMetric(){
    this.metricDataList = [];
    for(let item of this.metricList)
    {
      let index = item['value'];
      let data_item = this.metricData.find((i)=>{return i['index'] == index});
      let metric_item = {
        index: index,
        label: item['label'],
        percent: data_item && data_item['percent'] ? data_item['percent'] : 0,
        rating: data_item && data_item['rating'] ? data_item['rating'] : '0',
        average: data_item && data_item['average'] ? data_item['average'] : '0',
        percentDesc: data_item && data_item['percentDesc'] ? data_item['percentDesc'] : '',
        ratingDesc: data_item && data_item['ratingDesc'] ? data_item['ratingDesc'] : '',
        averageDesc: data_item && data_item['averageDesc'] ? data_item['averageDesc'] : ''
      }
      this.metricDataList.push(metric_item)
    }
  }
  updateHeatMap(entries, heatmap){
    let t_heatmap = [];
    let heatmap_item = this.heatmapData.find(function(h_item){ return h_item['AssignmentID'] == entries[0]['uuid']});
    let t_heatmapSum = {AssignmentID : entries[0].uuid, Cost: null , Fit: null, Integrity:null, Viability:null};
    t_heatmapSum['CostDesc'] = heatmap_item && heatmap_item['CostDesc'] ? heatmap_item['CostDesc']: null;
    t_heatmapSum['IntegrityDesc'] = heatmap_item && heatmap_item['IntegrityDesc'] ? heatmap_item['IntegrityDesc']: null;
    t_heatmapSum['ViabilityDesc'] = heatmap_item && heatmap_item['ViabilityDesc'] ? heatmap_item['ViabilityDesc']: null;
    t_heatmapSum['FitDesc'] = heatmap_item && heatmap_item['FitDesc'] ? heatmap_item['FitDesc']: null;
    let that = this;
    function recursive(obj){
      for(let entry of obj)
      {
          let heatmap_item = that.heatmapData.find(function(h_item){ return h_item['AssignmentID'] == entry['uuid']});
          t_heatmap.push(heatmap_item)
          if(entry.children.length)
          {
            recursive(entry.children)
          }
      }
    }
    recursive(entries);
    t_heatmap.forEach((item, index) => {
      if(item == undefined)
        return;
      t_heatmapSum.Cost += item.Cost || 0;
      t_heatmapSum.Fit += item.Fit || 0;
      t_heatmapSum.Integrity += item.Integrity || 0;
      t_heatmapSum.Viability += item.Viability || 0;
    })
    t_heatmapSum.Cost = t_heatmapSum.Cost ? t_heatmapSum.Cost / t_heatmap.length : null;
    t_heatmapSum.Fit = t_heatmapSum.Fit ? t_heatmapSum.Fit / t_heatmap.length : null;
    t_heatmapSum.Integrity = t_heatmapSum.Integrity ? t_heatmapSum.Integrity  / t_heatmap.length: null;
    t_heatmapSum.Viability = t_heatmapSum.Viability ? t_heatmapSum.Viability  / t_heatmap.length: null;
    return t_heatmapSum;
  }

  recursiveUpdate(entries)
  {
    for(let entry of entries)
    {
      let questionArr = [];
      let question = this.questionnaires.find(function(elem){
        return elem['category_id'] == entry['uuid']
      })

      let hasDetail = false;
      let statusArr = [];
      let attachmentList = [];
      if( question && question['questions'].length )
      {
        hasDetail = true;
        for( let question_entry of question['questions'])
        {
          let answer_item = this.findAnswerObject(question_entry['uuid']);
          if(answer_item)
            attachmentList = attachmentList.concat(this.attachment.filter(function(item){ return item['AssignmentID'] == answer_item['uuid']}));
          let appIDArr = [];
          let question_value = null;
          let status = answer_item && typeof answer_item['Status'] != 'undefined' ? answer_item['Status'] : 1;
          statusArr.push(status)
          question_value = (answer_item && answer_item['value']) ? answer_item['value'] : '';

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
              {
                this.dropdownData[question_entry.uuid]['Selected'].push({"id":question_entry_item.uuid,"itemName":question_entry_item.Text})
                question_entry_item['value'] = true;
              }else{
                question_entry_item['value'] = false;
              }
            }
            if(question_entry['Type'] != 'Grid' && question_entry['Type'] != 'Dropdown')
            {
              question_entry_item['value'] = answer_value_item.length ? answer_value_item[0].value : '';
            }
          }

          let question_item = { id: question_entry['uuid'], status: status, desc: question_entry['Label'], appIDs:appIDArr, value: question_value, items:question_entry['Items'],  type: question_entry['Type'], hasDocument: question_entry['HasDocument'], filename: "test.xls"}
          questionArr.push(question_item)
        }
      }
      let groupStatus = this.getGroupStatus(statusArr);

      let assessment_heatmap = this.updateHeatMap([entry],null)

      let groupUUID = question && question['_id'] ? question['_id'] : null;
      let item = { id: entry['uuid'], uuid: groupUUID, title: entry['Title'], hasDetail: hasDetail, status: groupStatus,  open: true, questionArr: questionArr, attachments: attachmentList, Heatmap: assessment_heatmap}
      entry['hasChildren'] = entry.children && entry.children.length;
      entry['expanded'] = false;
      entry['type'] = 'assessment';
      this.tableData.push(item)
      if(entry.children.length)
      {
        this.recursiveUpdate(entry.children)
      }
    }
  }

  updateSidebarList(){
    this.menu = []
    for(let item of this.assessmentList)
    {
        this.menu = this.menu.concat(item.children)
    }
    // this.menu = this.assessmentList;
  }

  getCompanyInfo(){
    let that = this;
    this.project_info =  Object.assign({}, this.currentProject['Project']['Company']);
    this.project_info['Project_Name'] = this.currentProject['Project']['Name'];
    this.project_info['Company_Name'] = this.currentProject['Project']['Company']['Name'];
    this.project_info['Website'] = this.currentProject['Project']['Company']['Website'];

    this.project_info['Country'] = this.address_info['Country'] ? this.address_info['Country']['label'] : '';
    this.project_info['State'] = this.address_info['State'] ? this.address_info['State']['label'] : '';
    this.project_info['City'] = this.address_info['City'] ? this.address_info['City']['label'] : '';

    this.project_info['Industry'] = this.menu.map(function(item){ return item['Title']});

    this.project_info['Annual_Revenue'] = this.currentProject['Project']['Reason1'] && this.currentProject['Project']['Reason1']['tAnnualRev'] ? this.currentProject['Project']['Reason1']['tAnnualRev'] : 'NA';
    this.project_info['Annual_Budget'] = this.currentProject['Project']['Reason1'] && this.currentProject['Project']['Reason1']['tAnnualRev'] ? this.currentProject['Project']['Reason1']['tAnnualRev'] : 'NA';
    this.project_info['Number_Employee'] = this.currentProject['Project']['Reason1'] && this.currentProject['Project']['Reason1']['tEmpNo'] ? this.currentProject['Project']['Reason1']['tEmpNo'] : 'NA';
    this.project_info['Years_Business'] = 'NA';

    this.project_info['Start_Date'] = this.currentProject['Project']['createdAt'];
    this.project_info['End_Date'] = this.currentProject['submitDate'];
    this.project_info['Review_Date'] = this.currentProject['updateDate'];

    let PrimaryUser = this.project_users.find(function(item){ return item['Role'] == 'PRIMARY'});
    this.project_info['Primary_User'] = PrimaryUser ? PrimaryUser['User']['Name']['Fullname'] : 'NA';
    this.project_info['Primary_User_Email'] = PrimaryUser ? PrimaryUser['User']['Email'] : 'NA';
    this.project_info['Primary_User_Phone'] = PrimaryUser ? '' : 'NA';

    let TeamUsers = this.project_users.filter(function(item){ return item['Role'] == 'MEMBER'});
    if(TeamUsers)
    {
      let tmp = TeamUsers.map(function(item){ return item['User']['Name']['Fullname']});
      this.project_info['Team_Users'] = tmp.join(", ");
    }else
    {
      this.project_info['Team_Users'] = 'NA';
    }
  }

  getTableData(){
    this.tableData = [];
    this.menu = [];
    this.recursiveUpdate(this.assessmentList[0]['children'])
    this.updateSidebarList();
    this.getCompanyInfo();
    this.updateMetric();
    this.loading = false;
  }

}
