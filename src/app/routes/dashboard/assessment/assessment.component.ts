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
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit {

  statusArr: object;
  assessment: object = {};
  questionnaire: object = [];
  questions: Array<Question> = [];
  answers: Array<Answer> = [];
  projects: object;
  user = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) {
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.route
      .params
      .subscribe(params => {
        this.questionnaire = [];
        this.questions = [];
        this.answers = [];
        this.projects = [];
        this.loading = true;
        // Defaults to 0 if no query param provided.
        let assessment_id = params['id'] || '';
        let data = {id: assessment_id};
        this.dataService.getAssessment(data).subscribe(
          response => {
            if(response.result == null)
              this.router.navigate(['app/dashboard']);
            this.assessment = response.result;
            this.getProject()
          },
          (error) => {
          }
        );
      });
  }
  getProject(){
    this.dataService.getUserProject().subscribe(
      response => {
        this.projects = response.result;
        this.getAnswers()
      },
      (error) => {
      }
    );
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
	    for(var i in this.questions) {
        let answerObj = this.findAnswerObject(this.questions[i].uuid);
        if( answerObj && answerObj.value )
          this.questions[i].value = answerObj.value;
        for(var j in this.questions[i].Items) {
          let answerObj = this.findAnswerObject(this.questions[i].Items[j].uuid);
          if( answerObj && answerObj.value )
            this.questions[i].Items[j].value = answerObj.value;
        }
	    }
  }

  getAnswers(){
    let project_id = this.projects[0]['Project'];
    let data = {
      Assessment: this.assessment['uuid'],
      Project: project_id,
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

  saveAnswer(){
    let questionnare_id = this.questionnaire['_id'];
    let project_id = this.projects[0]['Project'];
    let data = {
      Questionnaire: questionnare_id,
      Project: project_id,
      Answers: this.questions
    }
    this.dataService.saveAnswers(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this._notificationService.success(
              'Successfully Saved!',
              'You answer'
          )
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'You answer'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong',
            'You answer'
        )
      }
    );
  }
}
