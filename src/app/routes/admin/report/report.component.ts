import { Component, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../../shared/objectSchema';
import { NotificationsService } from 'angular2-notifications';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
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
  currentProject: object;
  feedbackList: Array<any> = [];
  decline_reason: string;
  hold_reason: string;
  projectStatus: string = ''
  menu: Array<any> = [];
  attachment: Array<any> = [];

  project_info: any = {};
  project_users: any = [];
  address_info: Array<any> = [];

  user: object = {}

  projectID: string;
  dropdownSettings: object;
  dropdownData: Array<object> = [];
  document_menu: any = [];
  heatmapData: Array<object> = [];
  inputHeatmapData: Array<object> = [];
  heatmapScoreDescription: object = {};
  heatmapScoreDescriptionOrg: Array<object> = [];
  activeTab = 'heat_map';
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private _notificationService: NotificationsService
  ) {

  }

  public editor;
  public editorContent = ``;
  public editorOptions = {
    placeholder: "insert content..."
  };
  public editor_id = null;
  public editor_type = null;

  ngOnInit() {
    this.loading = true;
    this.dropdownSettings = {
        singleSelection: false,
        text:'--',
        selectAllText:'Select All',
        unSelectAllText:'UnSelect All',
        enableSearchFilter: false ,
        enableCheckAll: false,
        classes:"cs-dropdown-select custom-class",
      };
    this.dropdownData = []
    this.getSubmittedProject();
    this.heatmapScoreDescription = {}
    this.heatmapScoreDescriptionOrg = [];
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
  openHeatmap(modal){
    modal.open('lg');
    for(let item of this.heatmapScoreDescriptionOrg)
    {
      this.heatmapScoreDescription[item['label']] = item['description']
    }
  }
  submitHeatmap(modal){
    let heatmap_arr = this.inputHeatmapData;
    let data = {
      id: this.currentProject['_id'],
      descList: this.heatmapScoreDescription,
      data: heatmap_arr
    }
    this.dataService.updateHeatmap(data).subscribe(
      response => {
          this._notificationService.success(
              'Successfully Saved!',
              'Heatmap'
          )
          this.heatmapData = response.result;
          this.getHeatmapDescription(() => {});
          this.getTableData();
          modal.close();
      },
      (error) => {
      }
    );
  }
  openModal(modal, id, type){
    modal.open('lg');
    this.editor_id = id;
    this.editor_type = type;
    this.editorContent = this.feedbackList[this.editor_id] || ``;
  }

  updateFeedback(modal){
    this.feedbackList[this.editor_id] = this.editorContent;
    let data = {
      id: this.currentProject['_id'],
      data: { AssignmentID:this.editor_id, Desc: this.editorContent , type: this.editor_type }
    }
    this.dataService.updateProjectFeedback(data).subscribe(
      response => {
        if( this.editor_type == 'default')
        {
          this.currentProject[this.editor_id] = this.feedbackList[this.editor_id];
        }
        else{
          let that = this;
          let obj = this.currentProject['Assessments'].find(function(item){ return item['AssignmentID'] == that.editor_id})
          if( obj )
          {
            obj['Desc'] = this.editorContent;
          }else{
            obj = { AssignmentID : this.editor_id, Desc: this.editorContent, _id: this.currentProject['_id']}
            this.currentProject['Assessments'].push(obj)
          }
        }
      },
      (error) => {
      }
    );
    modal.close()
  }

  releaseReport(){
    let data = {
      id: this.currentProject['_id'],
      data: {
        Status: 'Accept',
        Reason: ''
      }
    }
    this.dataService.updateProjectStatus(data).subscribe(
      response => {
        this.currentProject['Status'] = 'Accept';
        this.projectStatus = 'Accept'
        this._notificationService.success(
            'Project Released!',
            'Report'
        )
      },
      (error) => {
      }
    );
  }

  openDeclineModal(modal){
    this.decline_reason = '';
    modal.open()
  }
  declineReport(modal){
    let data = {
      id: this.currentProject['_id'],
      data: {
        Status: 'Reject',
        Reason: this.decline_reason
      }
    }
    this.dataService.updateProjectStatus(data).subscribe(
      response => {
        this.currentProject['Status'] = 'Reject';
        this.projectStatus = 'Reject'
        this._notificationService.success(
            'Project Declined!',
            'Report'
        )
      },
      (error) => {
      }
    );
    modal.close()
  }

  openHoldModal(modal){
    this.hold_reason = '';
    modal.open()
  }
  holdReport(modal){
    let data = {
      id: this.currentProject['_id'],
      data: {
        Status: 'Hold',
        Reason: this.hold_reason
      }
    }
    this.dataService.updateProjectStatus(data).subscribe(
      response => {
        this.currentProject['Status'] = 'Hold';
        this.projectStatus = 'Hold'
        this._notificationService.success(
            'Project Held!',
            'Report'
        )
      },
      (error) => {
      }
    );
    modal.close()
  }


  changeProject(project){
    if(this.projectID != project.Project['_id'])
    {
      this.loading = true;
      this.dropdownData = [];
      this.currentProject = project;
      this.projectStatus = this.currentProject['Status']
      this.projectID = project.Project['_id'];
      this.apiHandler();
    }
  }

  eachSlice(obj, size){
    let arr = []
    for (var i = 0, l = obj.length; i < l; i += size){
      arr.push(obj.slice(i, i + size))
    }
    return arr
  };

  getSubmittedProject(){
    this.dataService.getSubmittedProject().subscribe(response => {
        this.ProjectList = response.result;
        if(this.ProjectList.length)
        {
          this.currentProject = this.ProjectList[0];
          this.projectStatus = this.currentProject['Status'];
          this.projectID = this.currentProject['Project']['_id'];
          this.ProjectListTab = this.eachSlice(this.ProjectList, 4);
          this.apiHandler();
        }else{
          this.currentProject = null;
          this.loading = false;
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
        this.heatmapData  = response.result;
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

  getFeedbackList(){
    this.feedbackList = [];
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
        resolve()
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
        resolve()
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

    this.project_info['Country'] = this.address_info['Country'] ? this.address_info['Country']['label'] : '';
    this.project_info['State'] = this.address_info['State'] ? this.address_info['State']['label'] : '';
    this.project_info['City'] = this.address_info['City'] ? this.address_info['City']['label'] : '';

    this.project_info['Industry'] = this.menu.map(function(item){ return item['Title']});
    this.project_info['Annual_Revvenue'] = this.currentProject['Reason2'] && this.currentProject['Reason2']['tAnnualRev'] ? this.currentProject['Reason2']['tAnnualRev'] : 'NA';
    this.project_info['Number_Employee'] = this.currentProject['Reason2'] && this.currentProject['Reason2']['tEmpNo'] ? this.currentProject['Reason2']['tEmpNo'] : 'NA';
    this.project_info['Years_Business'] = 'NA';
    this.project_info['Start_Date'] = this.currentProject['Project']['createdAt'];
    this.project_info['End_Date'] = this.currentProject['submitDate'];
    this.project_info['Review_Date'] = this.currentProject['updateDate'];

    let PrimaryUser = this.project_users.find(function(item){ return item['Role'] == 'PRIMARY'});
    this.project_info['Primary_User'] = PrimaryUser ? PrimaryUser['User']['Name']['Fullname'] : 'NA';
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
  updateHeatMapInput(){
    this.tableData.forEach((item, index) => {
      let heatmap_item = this.heatmapData.find(function(h_item){ return h_item['AssignmentID'] == item.id});
      this.inputHeatmapData[index] = Object.assign({}, heatmap_item || { AssignmentID : item.id});
    });
  }

  getTableData(){
    this.tableData = [];
    this.menu = [];
    this.recursiveUpdate(this.assessmentList[0]['children'])
    this.updateSidebarList();
    this.getCompanyInfo();
    this.updateHeatMapInput();
    this.loading = false;
  }
}
