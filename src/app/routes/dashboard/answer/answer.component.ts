import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from 'angular2-notifications';

import { Question, Answer } from '../../../shared/objectSchema';

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

  dropdownData: Array<object> = [];
  test = [];
  dropdownSettings = {};
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

        this.getUserAssign()
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
  findAnswerObject(uuid){
    for(var i in this.answers) {
      if(this.answers[i].uuid == uuid)
        return this.answers[i];
      for(var j in this.answers[i].Items) {
        if(this.answers[i].Items[j].uuid == uuid)
          return this.answers[i].Items[j];
      }
    }
    return null;
  }

  updateQuestionnair(){
	    for(let qustion_group of this.questions) {
        let answerObj = this.findAnswerObject(qustion_group.uuid);
        if( answerObj && answerObj.value )
          qustion_group.value = answerObj.value;
        if(qustion_group.Type == 'Dropdown')
        {
          if(!this.dropdownData[qustion_group.uuid])
            this.dropdownData[qustion_group.uuid] = { Content: [], Selected: []}
        }
        for(let question_item of qustion_group.Items) {
          if(qustion_group.Type == 'Dropdown')
          {
            this.dropdownData[qustion_group.uuid].Content.push({"id":question_item.uuid,"itemName":question_item.Text})
            if(qustion_group.value && qustion_group.value.split(",").indexOf(question_item.uuid) != -1)
              this.dropdownData[qustion_group.uuid].Selected.push({"id":question_item.uuid,"itemName":question_item.Text})
          }
          let answerObj = this.findAnswerObject(question_item.uuid);
          if( answerObj && answerObj.value )
          {
            question_item.value = answerObj.value;
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
  prepareSaveData(){
    for(let item of this.questions)
    {
      if( item.Type == 'Dropdown')
      {
        item.value = this.dropdownData[item.uuid].Selected.map(function(e){
          return e['id'];
        }).toString();
      }
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
}
