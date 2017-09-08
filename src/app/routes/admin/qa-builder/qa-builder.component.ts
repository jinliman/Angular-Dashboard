import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';

import { Question } from '../../../shared/objectSchema';

@Component({
  selector: 'app-qa-builder',
  templateUrl: './qa-builder.component.html',
  styleUrls: ['./qa-builder.component.scss'],
})
export class QaBuilderComponent implements OnInit {

  questions: Array<Question> = [];
  question_type = [
    {'value':'Text', 'label':'Text'},
    {'value':'Radio', 'label':'Radio'},
    {'value':'Checkbox', 'label':'Checkbox'}
  ]
  assessment: object = {};
  assessment_id = null;
  backUrl: string = '';
  private corner: string = 'right-top';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
  ) {
    // Custom default config
  }

  add_question(){
    var newQuestion: Question = {
      uuid: this.dataService.getUUID(),
      Type: "Text",
      Label: "",
      value: "",
      Items: [{
           uuid    : this.dataService.getUUID(),
           Text    : "",
           value   : ""
       }]
    };
    this.questions.push(newQuestion)
  }

  add_answer_filed(index){
    this.questions[index].Items.push({
         uuid    : this.dataService.getUUID(),
         Text    : "",
         value   : ""
     });
  }

  move_question_down(index){
    if (index+1 >= this.questions.length)
      return false;
    let tmp = this.questions[index];
    this.questions[index] = this.questions[index+1];
    this.questions[index+1] = tmp;
    return true;
  }

  move_question_up(index){
    if (index -1 < 0 )
      return false;
    let tmp = this.questions[index];
    this.questions[index] = this.questions[index-1];
    this.questions[index-1] = tmp;
    return true;
  }

  remove_question(index){
    this.questions.splice(index, 1);
  }

  move_answer_up(index, index1)
  {
    if (index1-1 < 0)
      return false;
    let tmp = this.questions[index].Items[index1]
    this.questions[index].Items[index1] = this.questions[index].Items[index1-1]
    this.questions[index].Items[index1-1] = tmp;
    return true;
  }

  move_answer_down(index, index1)
  {
    if (index1+1 >= this.questions[index].Items.length)
      return false;
    let tmp = this.questions[index].Items[index1]
    this.questions[index].Items[index1] = this.questions[index].Items[index1+1]
    this.questions[index].Items[index1+1] = tmp;
    return true;
  }

  remove_answer_type(index, index1){
    this.questions[index].Items.splice(index1, 1);
  }

  saveQA()
  {
    let data = { 'Questionnaire': this.questions, 'ID': this.assessment_id}
    this.dataService.saveQA(data).subscribe(
      response => {

      },
      (error) => {
      }
    );
  }

  getQA(id){
    let data = { 'ID': id}
    this.dataService.getQA(data).subscribe(
      response => {
        if(response.result)
          this.questions = response.result.questions;
      },
      (error) => {
      }
    );
  }

  ngOnInit() {
    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.assessment_id = params['id'] || '';
        let data = {id: this.assessment_id};
        this.dataService.getAssessment(data).subscribe(
          response => {
            if(response.result == null)
              this.router.navigate(['admin/dashboard']);
            this.assessment = response.result;
            this.backUrl = "/" + this.dataService.getAdminUrl() + "assessment/"+this.assessment_id;
            this.getQA(this.assessment_id)
          },
          (error) => {
          }
        );
      });
  }
}
