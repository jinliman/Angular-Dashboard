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
  styleUrls: ['./qa-builder.component.scss']
})
export class QaBuilderComponent implements OnInit {

  questions: Array<Question>
  question_type = [
    {'value':'Text', 'label':'Text'},
    {'value':'Radio', 'label':'Radio'},
    {'value':'Checkbox', 'label':'Checkbox'}
  ]
  assessment: object = {};
  backUrl: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  add_question(){
    var newQuestion: Question = {
      UUID: "1",
      Type: "Text",
      Order: "1",
      Label: "",
      Items: [{
           UUID    : "1",
           Order   : "1",
           Text    : "test"
       }]
    };
    this.questions.push(newQuestion)
  }

  add_answer_filed(index){
    this.questions[index].Items.push({
         UUID    : "1",
         Order   : "1",
         Text    : "test"
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

  ngOnInit() {
    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        let assessment_id = params['id'] || '';
        let data = {id: assessment_id};
        this.dataService.getAssessment(data).subscribe(
          response => {
            if(response.result == null)
              this.router.navigate(['admin/dashboard']);
            this.assessment = response.result;
            this.backUrl = "/" + this.dataService.getAdminUrl() + "assessment/"+assessment_id;
          },
          (error) => {
          }
        );
      });
    var test: Question = {
      UUID: "123",
      Type: "Text",
      Order: "1",
      Label: "This is test question",
      Items: [{
           UUID    : "1",
           Order   : "1",
           Text    : "test"
       }]
    };
    this.questions = [test]
  }
}
