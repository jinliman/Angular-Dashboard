import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';

import { Question, Answer, QuestionItem, AnswerItem } from '../../../shared/objectSchema';
import { environment } from '../../../../environments/environment';
import * as moment from "moment";

declare var Dropbox: any;
declare var BoxSelect: any;
declare var gapi: any;
declare var google: any;
declare var OneDrive: any;

@Component({
  selector: 'app-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit {

  statusArr: object;
  assessment: object = {};
  questionnaire: object = [];
  questions: Array<Question> = [];
  answers: Array<Answer> = [];
  userAssignment: object = {};
  currentProject: object;
  user = [];
  userRole: string = "";
  newAttachmentObj: object = {};
  customFileLink: string = "";
  customFileName: string = "";
  attAssessmentID = null
  attachmentList: Array<object> =[];
  dropdownData: Array<object> = [];
  gridData: object = {};

  backUrl: string = '';

  dropdownSettings = {};
  loading = true;

  public datepickerOptions: any = {
    locale: { format: 'MMMM DD YYYY' },
    singleDatePicker: true,
    showDropdowns: true,
    inline: false
  };

  dropboxOptions = {
    success: (files) => {
      this.selectDropboxFile(files)
    },
    cancel: function() {

    },
    linkType: "preview",
    multiselect: false,
    // extensions: ['.pdf', '.doc', '.docx'],
  };

  boxOptions = {
    clientId: environment.box_client_id,
    linkType: "shared",
    multiselect: false
  };
  boxSelect = null;

  odOptions = {
    clientId: environment.od_appkey,
    action: "share",
    multiSelect: false,
    advanced: {
      redirectUri: environment.hostUrl + 'onedriveAuth',
      endpointHint: "api.onedrive.com"
    },

    success: (files) => {
      this.selectOnedriveFile(files);
    },
    cancel: function() { /* cancel handler */ },
    error: function(e) { /* error handler */ }
  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) {
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
  }

  onProjectSelect(data){
    this.ngOnInit();
  }
  ngOnInit() {
    this.user = this.authService.getUser();
    this.route
      .params
      .subscribe(params => {
        this.questionnaire = [];
        this.questions = [];
        this.answers = [];
        this.dropdownData = [];
        this.gridData = [];
        this.currentProject = this.authService.getUserProject();
        this.userRole = this.currentProject['Role'];
        console.log(this.userRole)
        this.dropdownSettings = {
            singleSelection: false,
            text:'--',
            selectAllText:'Select All',
            unSelectAllText:'UnSelect All',
            enableSearchFilter: false ,
            enableCheckAll: true,
            classes:"cs-dropdown-select custom-class",
          };
        this.loading = true;
        // Defaults to 0 if no query param provided.
        let assessment_id = params['id'] || '';
        let data = {id: assessment_id};

        this.backUrl = "/app/assessment/"+assessment_id;

        this.getUserAssign();
        this.getUserAttachment();
        this.dataService.getAssessment(data).subscribe(
          response => {
            if(response.result == null)
              this.router.navigate(['app/dashboard']);
            this.assessment = response.result;
            this.getAnswers()
          },
          (error) => {
          }
        );
      });
  }

  /*
  ---------------- Attachment --------------------
  */


  // Dropbox
  dropboxChooser(){
    Dropbox.choose(this.dropboxOptions)
  }
  selectDropboxFile(files){
    this.newAttachmentObj['SourceType'] = 'Dropbox';
    this.newAttachmentObj['File'] = files[0];
    this.customFileLink = '';
  }
  // Box
  boxChooser(){
    if(this.boxSelect == null)
    {
      this.boxSelect = new BoxSelect(this.boxOptions);
      let that = this;
      this.boxSelect.success(function(files) {
        console.log(files)
        that.newAttachmentObj['SourceType'] = 'Box';
        that.newAttachmentObj['File'] = {};
        that.newAttachmentObj['File']['name'] = files[0]['name'];
        that.newAttachmentObj['File']['link'] = files[0]['url'];
        that.customFileLink = ''
      });

      this.boxSelect.cancel(function() {

      });
    }

    this.boxSelect.launchPopup();
  }

  //Custom link
  customLink($event){
    let value = $event.target.value;
    if(value != '')
    {
      this.newAttachmentObj['SourceType'] = 'Link';
      this.newAttachmentObj['File'] = {};
      this.newAttachmentObj['File']['name'] = '';
      this.newAttachmentObj['File']['link'] = $event.target.value;
    }else{
      this.newAttachmentObj['SourceType'] = null;
      this.newAttachmentObj['File'] = null;
    }
  }
  // Computer
  updateFile(event)
  {
    this.newAttachmentObj['SourceType'] = 'Computer'
    if(event.srcElement.files[0])
    {
      this.newAttachmentObj['File'] = event.srcElement.files[0];
    }else{
      this.newAttachmentObj['File'] = null;
      this.newAttachmentObj['SourceType'] = null;
      this.customFileLink = ""
    }
  }

  //Google dataService
  openGooglePicker(){
    let that = this
    // The Browser API key obtained from the Google API Console.
    var developerKey = environment.gd_developerKey;

    // The Client ID obtained from the Google API Console. Replace with your own Client ID.
    var clientId = environment.gd_clientId;

    // Scope to use to access user's photos.
    var scope = ['https://www.googleapis.com/auth/drive.file'];

    var pickerApiLoaded = false;
    var oauthToken;

    // Use the API Loader script to load google.picker and gapi.auth.
    function onApiLoad() {
      gapi.load('auth', {'callback': onAuthApiLoad});
      gapi.load('picker', {'callback': onPickerApiLoad});
    }

    function onAuthApiLoad() {
      gapi.auth.authorize(
          {
            'client_id': clientId,
            'scope': scope,
            'immediate': false
          },
          handleAuthResult);
    }

    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      }
    }

    // Create and render a Picker object for picking user Photos.
      function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var picker = new google.picker.PickerBuilder().
            addView(google.picker.​ViewId.DOCS).
            setOAuthToken(oauthToken).
            setDeveloperKey(developerKey).
            setCallback(pickerCallback).
            build();
        picker.setVisible(true);
      }
    }
    // A simple callback implementation.
    function pickerCallback(data) {
      console.log(data)
      var url = 'nothing';
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        that.newAttachmentObj['SourceType'] = 'Googledrive';
        that.newAttachmentObj['File'] = {};
        that.newAttachmentObj['File']['name'] = doc[google.picker.Document.NAME];
        that.newAttachmentObj['File']['link'] = doc[google.picker.Document.URL];
        that.customFileLink = ''
      }
    }
    if(!pickerApiLoaded)
      onApiLoad()
    createPicker()

  }

  //OneDrive
  launchOneDrivePicker(){
    OneDrive.open(this.odOptions);
  }
  selectOnedriveFile(files){
    console.log(files)
    this.newAttachmentObj['SourceType'] = 'Onedrive';
    this.newAttachmentObj['File'] = {}
    this.newAttachmentObj['File']['name'] = files['value'][0]['name'];
    this.newAttachmentObj['File']['link'] = files['value'][0]['webUrl'];
    console.log(this.newAttachmentObj)
  }
  getUserAttachment(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {ProjectID : projectID}
    this.dataService.getUserAttachment(data).subscribe(
        response => {
          this.updateUserAttachment(response.result)
        },
        (error) => {

        }
      );
  }
  updateUserAttachment(data){
    this.attachmentList = [];
    for(let item of data)
    {
      this.attachmentList[item['AssignmentID']] = item
    }
    console.log(this.attachmentList)
  }
  showUserAttachment(id){
    let result = '';
    if(this.attachmentList[id])
      result = this.attachmentList[id]['Comment'];
    return result;
  }

  OpenUploadFileModal(modal, AssessmentID){
    this.attAssessmentID = AssessmentID;
    let projectID = this.currentProject['Project']['_id'] || null;
    this.newAttachmentObj = {Comment: '', SourceType : null, File: null, AssessmentID: this.attAssessmentID, ProjectID: projectID}
    this.customFileLink = ""
    this.customFileName = ""
    modal.open()
  }

  addNewAttachment(modal){
    let sourceType = this.newAttachmentObj['SourceType'];
    if(sourceType == 'Link')
    {
      this.newAttachmentObj['File'] = {};
      this.newAttachmentObj['File']['name'] = this.customFileName;
      this.newAttachmentObj['File']['link'] = this.customFileLink;
    }
    let formData = new FormData();
    formData.append('attachment', this.newAttachmentObj['File']);
    formData.append('data', JSON.stringify(this.newAttachmentObj));
    this.dataService.saveAttachment(sourceType, formData).subscribe(
        response => {
          this.getUserAttachment();
          this._notificationService.success(
              'Successfully Saved!',
              'Attachment'
          )
          modal.close()
        },
        (error) => {
          this._notificationService.error(
              'Sth went wrong',
              'Attachment'
          )
        }
      );
  }

  getUserAssign(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let parma = { projectID: projectID}

    this.dataService.getUserAssignment(parma).subscribe(
      response => {
        this.userAssignment = this.updateUserAssignment(response.result)
        console.log(this.userAssignment)
      },
      (error) =>{
      }
    );
  }
  updateUserAssignment(data){
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
  findAnswerObject(uuid, appID = null){
    for(var i in this.answers) {
      if(this.answers[i].uuid == uuid)
        return this.answers[i];
      for(var j in this.answers[i].Items) {
        if(appID)
        {
          if(this.answers[i].Items[j].uuid == uuid && this.answers[i].Items[j].appID == appID)
            return this.answers[i].Items[j];
        }else{
          if(this.answers[i].Items[j].uuid == uuid)
            return this.answers[i].Items[j];
        }
      }
    }
    return null;
  }
  setDateQuestion(index, value: any)
  {
    console.log(index)
    this.questions[index].value = moment(new Date(value.start)).format("MMMM DD YYYY");
  }

  new_grid_answer(question_item){
    let newAppID = this.gridData[question_item.uuid].reduce(function(maxID, Item){
        return Item.appID > maxID ? Item.appID: maxID;
    },1)
    this.gridData[question_item.uuid].push({appID: newAppID+1, Items: this.arrayClone(question_item.Items)});
  }
  remove_grid_answer(uuid,index){
    this.gridData[uuid].splice(index,1);
  }
  move_answer_up(uuid,index){
    if (index-1 < 0)
      return false;
    let tmp = this.gridData[uuid][index]
    this.gridData[uuid][index] = this.gridData[uuid][index-1]
    this.gridData[uuid][index-1] = tmp;
    return true;
  }
  move_answer_down(uuid,index){
    if (index+1 >= this.gridData[uuid].length)
      return false;
    let tmp = this.gridData[uuid][index]
    this.gridData[uuid][index] = this.gridData[uuid][index+1]
    this.gridData[uuid][index+1] = tmp;
    return true;
  }
  toggleGridAnswer(uuid, type)
  {
    this.gridData[uuid] = [];
  }
  arrayClone( arr ) {
    var i, copy;
    if( Array.isArray( arr ) ) {
        copy = arr.slice( 0 );
        for( i = 0; i < copy.length; i++ ) {
            copy[ i ] = this.arrayClone( copy[ i ] );
        }
        return copy;
    } else if( typeof arr === 'object' ) {
        return Object.assign({}, arr);
    } else {
        return arr;
    }
  }

  selectGridYes(question_item){
    let uuid = question_item['uuid'];
    if(this.gridData[uuid].length == 0)
    {
      this.new_grid_answer(question_item);
    }
  }

  updateQuestionnair(){
    for(let qustion_group of this.questions) {
      let answerObj = this.findAnswerObject(qustion_group.uuid);
      qustion_group.comment = ""

      if( answerObj){
        if(answerObj.value )
            qustion_group.value = answerObj.value;
        if(answerObj['comment'] )
          qustion_group.comment = answerObj['comment'];
        if(typeof answerObj['Status'] != 'undefined' )
            qustion_group.Status = answerObj['Status'];
      }

      if(qustion_group.Type == 'Dropdown')
      {
        if(!this.dropdownData[qustion_group.uuid])
          this.dropdownData[qustion_group.uuid] = { Content: [], Selected: []}
      }
      if(qustion_group.Type == 'Grid')
      {
        if(!this.gridData[qustion_group.uuid])
          this.gridData[qustion_group.uuid] = []
        if(answerObj && answerObj['Items'] )
        {
          for(let answerItem of answerObj['Items'])
          {
            let appID = answerItem.appID;
            let tmpObj = this.arrayClone(this.gridData[qustion_group.uuid].find(function(item){return item['appID'] == appID}));
            if(!tmpObj)
            {
              tmpObj = { appID: appID, Items :  this.arrayClone(qustion_group.Items)};
              this.gridData[qustion_group.uuid].push(tmpObj)
            }
            for(let tmpItem of tmpObj.Items)
            {
                let tmpAnswerItem = this.findAnswerObject(tmpItem.uuid, appID);
                if(tmpAnswerItem && tmpAnswerItem.value)
                  tmpItem.value = tmpAnswerItem.value;
            }
          }
        }
      }
      for(let question_item of qustion_group.Items) {
        if(qustion_group.Type == 'Dropdown')
        {
          this.dropdownData[qustion_group.uuid].Content.push({"id":question_item.uuid,"itemName":question_item.Text})
          if(qustion_group.value && qustion_group.value.split(",").indexOf(question_item.uuid) != -1)
            this.dropdownData[qustion_group.uuid].Selected.push({"id":question_item.uuid,"itemName":question_item.Text})
        }
        if(qustion_group.Type != 'Grid')
        {
          let answerObjInner = this.findAnswerObject(question_item.uuid);
          if( answerObjInner && answerObjInner.value )
          {
            question_item.value = answerObjInner.value;
          }
        }
      }
    }
    console.log(this.questions)
  }

  getAnswers(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {
      Assessment: this.assessment['uuid'],
      Project: projectID,
    }
    this.dataService.getAnswers(data).subscribe(
      response => {
        if(response.result)
        {
          this.questionnaire = response.result.questionnaire;
          this.questions = response.result.questionnaire.questions || [];
          this.answers = response.result.answers;
            this.updateQuestionnair();
        }else{
          this.questionnaire = [];
          this.questions = [];
          this.answers = [];
        }
        this.loading = false;
      },
      (error) => {

      }
    );
  }

  prepareGridData(question_item){
    let result : Array<QuestionItem> = [];
    if(question_item.value == '1')
    {
      let uuid = question_item.uuid;
      for(let appItem of this.gridData[uuid])
      {
        let appID = appItem.appID;
        if(!result)
        {
          result = appItem.Items.map(function(item){ item['appID'] = appID; return item});
        }
        else{
          result = result.concat(appItem.Items.map(function(item){ item['appID'] = appID; return item}));
        }
      }
    }
    return result;
  }

  prepareSaveData(){
    for(let question_item of this.questions)
    {
      console.log(this.questions)
      if( question_item.Type == 'Dropdown')
      {
        question_item.value = this.dropdownData[question_item.uuid].Selected.map(function(e){
          return e['id'];
        }).toString();
      }
      if( question_item.Type == 'Grid')
      {
        question_item.Items = this.prepareGridData(question_item);
      }

      let status = question_item.Items.every(function(item){ return typeof item['value'] != 'undefined' && item['value'] != ''}) || (typeof question_item.value != 'undefined' && question_item.value != '');
      if(question_item.Status != 0)
        question_item.Status = status ? 2 : 1;
    }
  }


  saveAnswer(){
    this.prepareSaveData();
    let questionnare_id = this.questionnaire['_id'];
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {
      Questionnaire: questionnare_id,
      Project: projectID,
      Answers: this.questions
    }

    this.dataService.saveAnswers(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Saved!',
              'Answer'
          )
          this.router.navigate([this.backUrl]);
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Answer'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong',
            'Answer'
        )
      }
    );
  }

  initDropboxScript()
  {
    var script = document.createElement("script");
    script.type = "text/javascript"
    script.src = "https://www.dropbox.com/static/api/2/dropins.js"
    script.id = "dropboxjs"
    var app_key_attr = document.createAttribute("data-app-key");
    app_key_attr.value = environment.dropbox_appkey
    script.setAttributeNode(app_key_attr)
    this.elementRef.nativeElement.appendChild(script);
  }

  initBoxScript()
  {
    var script = document.createElement("script");
    script.type = "text/javascript"
    script.src = "https://cdn01.boxcdn.net/js/static/select.js"
    this.elementRef.nativeElement.appendChild(script);
  }

  initGoogledriveScript(){
    var script = document.createElement("script");
    script.type = "text/javascript"
    script.src = "https://apis.google.com/js/api.js"
    this.elementRef.nativeElement.appendChild(script);
  }

  initOnedriveScript(){
    var script = document.createElement("script");
    script.type = "text/javascript"
    script.src = "https://js.live.net/v7.2/OneDrive.js"
    this.elementRef.nativeElement.appendChild(script);
  }
  ngAfterViewInit() {
    this.initDropboxScript()
    this.initBoxScript()
    this.initGoogledriveScript()
    this.initOnedriveScript()
  }
}
