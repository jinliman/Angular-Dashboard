import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';

import { Question, Answer } from '../../../shared/objectSchema';
import { environment } from '../../../../environments/environment';
import { DestroySubscribers } from "ng2-destroy-subscribers";

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})

@DestroySubscribers({
  addSubscribersFunc: 'addSubscribers',
  removeSubscribersFunc: 'removeSubscribers',
  initFunc: 'ngOnInit',
  destroyFunc: 'ngOnDestroy',
})


export class AssessmentComponent implements OnInit {

  public subscribers: any = {}

  tableData: Array<any> = [];
  statusArr: object;
  assessment: object = {};
  assessment_id: string = '';
  assignment: object = {};
  allAssignment: Array<object> = [];
  userAssignment: object = {};
  questionnaires: Array<object>= [];
  attachmentList: Array<object> = [];
  answers: Array<Answer> = [];

  editAssessmentUrl: string = "";
  currentProject: object = {};
  team: Array<object> = [];
  teamList: Array<object> = [];

  newAssignments: Array<object> = []
  newAttachmentObj: object = {}
  allowAnswer: boolean = false;
  allowAssign: boolean = false;
  userRole: string = "";
  user: object = {}
  loading: boolean = true;
  dropdownSettings = {};
  isInit: boolean = false;
  sortFilter: any = {
    type: null,
    order: true
  }

  completePercent: string;
  totalComplete: number;
  totalIncomplete: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    private dataService: DataService,
    private authService: AuthService,
    private http: Http,
    private _notificationService: NotificationsService
  ) {
    this.user = this.authService.getUser()
  }

  addSubscribers(){
    this.subscribers.projectChanged = this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
  }

  onProjectSelect(data){
    this.router.navigate(['/app']);
  }

  ngOnInit() {

    this.statusArr = {
      0 : "NA",
      1 : "Pending",
      2 : "Complete"
    }

    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.assessment_id = params['id'] || '';
        this.initPage(true);
      });
  }

  initPage(isInit = false){
    this.loading = true;
    this.isInit = isInit;
    this.assessment = {};
    this.tableData = [];
    this.questionnaires = [];
    this.newAssignments = [];
    this.editAssessmentUrl = "";
    this.completePercent = '0';
    this.totalComplete = 0;
    this.totalIncomplete = 0;

    let tProject = this.authService.getUserProject();
    let data = { projectID: tProject['Project']['_id']}
    this.dataService.getProject(data).subscribe(
      response => {
        this.currentProject = response.result;
        let projectID = this.currentProject['Project']['_id'] || null;
        let projectStatus = this.currentProject['Status'] || null;
        this.userRole = this.currentProject['Role'];
        this.allowAnswer = false;
        if(this.userRole != "MEMBER" && ['Accept','Submitted','Hold'].indexOf(projectStatus) == -1)
          this.allowAssign = true;
        this.dropdownSettings = {
            singleSelection: false,
            text:'--',
            selectAllText:'Select All',
            unSelectAllText:'UnSelect All',
            enableSearchFilter: false ,
            enableCheckAll: false,
            classes:"cs-user-select custom-class",
            disabled: !this.allowAssign
          };
        this.apiHandler();
      },
      (error) => {
        this.router.navigate(['app/dashboard']);
      }
    );
  }
  apiHandler(){
    let promiseArr= [];

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessmentList(() => {resolve(); });
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
      this.getTeam(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getUserAttachment(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.prepareData();
    });
  }

  prepareData()
  {
    this.updateTeam();
    this.assignment = this.updateAssignment(this.allAssignment);
    this.getTableData();
    let projectStatus = this.currentProject['Status'] || null;
    if(this.userRole != "INITIATOR" && ['Accept','Submitted','Hold'].indexOf(projectStatus) == -1)
      this.setAllowAnswer();
  }

  getAssessmentList(resolve){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {id: this.assessment_id, projectID: projectID};
    this.dataService.getAssessmentFlat(data).subscribe(
      response => {
        if(response.result == null)
          this.router.navigate(['app/dashboard']);
        this.assessment = response.result;
        this.editAssessmentUrl = "/app/assessment/"+this.assessment_id;
        resolve();
      },
      (error) => {
        this.router.navigate(['app/dashboard']);
      }
    );
  }

  onAssignmentSelect(event, assignment, type, parent_assessment = null){
    this.onAssignmentSelectCustom(event, assignment['id'], type)
    if(type == 'Question')
    {
      this.onAssignmentSelectCustom(event, parent_assessment['id'], 'QAssessment')
    }
    this.saveAssignment();
  }

  onAssignmentSelectCustom(event, assignment_id, type){
    let userID = event.id;
    let item = this.allAssignment.find(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type;
    });

    let item1 = this.newAssignments.find(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type  && e['Action'] == 'add';
    });

    if(!item && !item1)
    {
      this.newAssignments.push({User: userID, AssignmentID: assignment_id, Type: type, Action: 'add'});
      this.allAssignment.push({User: userID, AssignmentID: assignment_id, Type: type});
    }
  }

  onAssignmentDeSelect(event, assignment, type, parent_assessment = null){
    this.onAssignmentDeSelectCustom(event, assignment['id'], type)
    if(type == 'Question')
    {
      let count = 0;
      for(let item of parent_assessment.questionArr)
      {
        let tmp = item.usersAssigned.find(function(e){
          return e.id == event.id
        })
        if(tmp)
          count++;
      }
      if(!count)
        this.onAssignmentDeSelectCustom(event, parent_assessment['id'], 'QAssessment')
    }
    this.saveAssignment();
  }

  onAssignmentDeSelectCustom(event, assignment_id, type, assessment_id1 = null){
    let userID = event.id;

    let index = this.newAssignments.findIndex(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type && e['Action'] == 'add';
    })
    if( index >= 0)
      this.newAssignments.splice(index, 1)
    let item = this.allAssignment.find(function(e){
      return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type;
    })

    if(item)
    {
      this.newAssignments.push({id: item['_id'], User: userID, AssignmentID: assignment_id, Type: type, Action: 'delete'});
      let qa_index = this.allAssignment.findIndex(function(e){
        return e['User'] == userID && e['AssignmentID'] == assignment_id && e['Type'] == type;
      });
      this.allAssignment.splice(qa_index, 1)
    }

  }

  saveAssignment(){
    if(!this.allowAssign)
      return false;
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID, data: this.newAssignments}
    this.dataService.saveAssignment(parma).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this.newAssignments = [];
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Assignment'
          )
        }
      },
      (error) => {
      }
    );
  }

  getAssignment(resolve){
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID}
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
  setAllowAnswer(){
    this.allowAnswer = true;
    let userID = this.user['_id'];
    let tmpArr = this.assignment['Assessments'][this.assessment_id] || [];
    tmpArr = tmpArr.concat(this.assignment['QAssessments'][this.assessment_id] || []);
    let tmp = tmpArr.find(function(i){
      return i['id'] == userID;
    });
    if(tmp)
      this.allowAnswer = true;
  }
  updateAssignment(data){
    var result = { Questions: {}, Assessments: {}, QAssessments: {}};

    var teamListJson = [];
    for(let item of this.teamList)
    {
      teamListJson[item['id']] = item;
    }

    for(let item of data)
    {
      let type = item['Type'];
      if(type == "Assessment")
      {
        if(!result.Assessments[item['AssignmentID']])
          result.Assessments[item['AssignmentID']] = []
        result.Assessments[item['AssignmentID']].push(teamListJson[item['User']])
      }
      if(type == "Question")
      {
        if(!result.Questions[item['AssignmentID']])
          result.Questions[item['AssignmentID']] = []
        result.Questions[item['AssignmentID']].push(teamListJson[item['User']])
      }
      if(type == "QAssessment")
      {
        if(!result.QAssessments[item['AssignmentID']])
          result.QAssessments[item['AssignmentID']] = []
        result.QAssessments[item['AssignmentID']].push(teamListJson[item['User']])
      }
    }
    return result;
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
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {Project: projectID}
    this.dataService.getAnswerList(data).subscribe(
      response => {
        this.answers = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  getTeam(resolve){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {id: projectID}

    this.dataService.getTeamMembers(data).subscribe(
      response => {
        this.team = response.result;
        resolve();
      },
      (error) => {
      }
    );
  }

  updateTeam(){
    this.teamList  = this.team.map(function(item){
      return {"id":item['User']['_id'],"itemName":item['User']['Name']['First']}
    })
  }
  /*
  ---------------- Attachment --------------------
  */

  getUserAttachment(resolve){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {ProjectID : projectID}
    this.dataService.getUserAttachment(data).subscribe(
        response => {
          this.updateUserAttachmetn(response.result)
          resolve();
        },
        (error) => {

        }
      );
  }
  updateUserAttachmetn(data){
    this.attachmentList = [];
    for(let item of data)
    {
      this.attachmentList[item['AssignmentID']] = item
    }
  }
  showUserAttachment(id){
    let result = '';
    if(this.attachmentList[id])
      result = this.attachmentList[id]['Comment'];
    return result;
  }

  toggleNA(checked, group, item){
    if(this.userRole == "INITIATOR" || !this.allowAnswer)
      return;
    this.loading = true;

    let that = this;
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {checked: checked, projectID: projectID, group_id: group['uuid'], item_id:item && item['id']? item['id'] : null}
    let assessmentID = group['id'];
    this.dataService.toggleNA(data).subscribe(response => {
        this.initPage()
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

  sort_by_type(type){
    this.sortFilter.order = !this.sortFilter.order;
    this.sortFilter.type = type;
    this.sortTableData();
  }

  getTableData(){
    this.tableData = [];
    this.completePercent = '0';
    this.totalComplete = 0;
    this.totalIncomplete = 0;
    for(let entry of [this.assessment].concat(this.assessment['children']))
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
          if(!this.assignment['Questions'][question_entry['uuid']])
            this.assignment['Questions'][question_entry['uuid']] = []
          let userAssignment = this.assignment['Questions'][question_entry['uuid']];
          let answer_item = this.findAnswerObject(question_entry['uuid']);
          let status = answer_item && typeof answer_item['Status'] != 'undefined' ? answer_item['Status'] : 1;

          if(this.userRole == "MEMBER")
          {
            if(this.userAssignment['Questions'].indexOf(question_entry['uuid']) != -1 || this.userAssignment['Assessments'].indexOf(question['category_id']) != -1)
            {
              statusArr.push(status)

              if(status == 0 || status == 2)
                this.totalComplete ++;
              else
                this.totalIncomplete ++;
            }
          }else{
            statusArr.push(status)

            if(status == 0 || status == 2)
              this.totalComplete ++;
            else
              this.totalIncomplete ++;
          }

          let question_item = { id: question_entry['uuid'], status: status, desc: question_entry['Label'], type: question_entry['Type'], hasDocument: question_entry['HasDocument'], filename: "test.xls",  usersAssigned: userAssignment}
          questionArr.push(question_item)
        }
      }
      let groupStatus = this.getGroupStatus(statusArr);
      let completed = [0,2].indexOf(groupStatus) != -1? true: false;
      if(!this.assignment['Assessments'][entry['uuid']])
        this.assignment['Assessments'][entry['uuid']] = []
      if(!this.assignment['QAssessments'][entry['uuid']])
        this.assignment['QAssessments'][entry['uuid']] = []
      let userAssignment = this.assignment['Assessments'][entry['uuid']];
      let groupUUID = question && question['_id'] ? question['_id'] : null;
      let item = { id: entry['uuid'], uuid: groupUUID, title: entry['Title'], hasDetail: hasDetail, completed: completed, status: groupStatus,  open: true,  usersAssigned: userAssignment, questionArr: questionArr}
      this.tableData.push(item)
    }

    if(this.totalComplete == 0)
      this.completePercent = '0';
    else
      this.completePercent = (this.totalComplete / (this.totalComplete + this.totalIncomplete) * 100).toFixed(0);
    if(!this.isInit)
      this.dataService.onProgressChanged({percent: this.completePercent});
    this.sortTableData();
  }

  sortTableData()
  {
    for(let assessment of this.tableData)
    {
      if(this.sortFilter.type == 'assign')
      {
        if(this.sortFilter.order)
        {
          assessment.questionArr.sort(function(a,b){
            if(a.usersAssigned.length < b.usersAssigned.length)
              return -1;
            if(a.usersAssigned.length > b.usersAssigned.length)
              return 1;
            return 0;
          });
        }else{
          assessment.questionArr.sort(function(a,b){
            if(a.usersAssigned.length > b.usersAssigned.length)
              return -1;
            if(a.usersAssigned.length < b.usersAssigned.length)
              return 1;
            return 0;
          });
        }
      }
      if(this.sortFilter.type == 'status')
      {
        if(this.sortFilter.order)
        {
          assessment.questionArr.sort(function(a,b){
            if(a.status < b.status)
              return -1;
            if(a.status > b.status)
              return 1;
            return 0;
          });
        }else{
          assessment.questionArr.sort(function(a,b){
            if(a.status > b.status)
              return -1;
            if(a.status < b.status)
              return 1;
            return 0;
          });
        }
      }
      if(this.sortFilter.type == 'na')
      {
        if(this.sortFilter.order)
        {
          assessment.questionArr.sort(function(a,b){
            if(a.status < b.status)
              return 1;
            if(a.status > b.status)
              return -1;
            return 0;
          });
        }else{
          assessment.questionArr.sort(function(a,b){
            if(a.status > b.status)
              return 1;
            if(a.status < b.status)
              return -1;
            return 0;
          });
        }
      }
    }
    this.loading = false;
  }
}
