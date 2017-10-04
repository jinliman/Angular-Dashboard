import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  tableData: Array<any> = [];
  assessmentArr: Array<object> = [];
  questionnaires: Array<object> = [];
  attachmentArr: Array<object> = [];
  currentProject: object;
  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {

  }

  updateTableData(){
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

  getQuestionnaire(){
    this.dataService.getQAList().subscribe(
      response => {
        this.questionnaires = response.result;
        console.log(this.questionnaires)
        this.getAttachment()
      },
      (error) => {
      }
    );
  }
  getAttachment(){
    let projectID = this.currentProject['Project']['_id'] || null;
    let data = {ProjectID : projectID}
    this.dataService.getAttachment(data).subscribe(
        response => {
          this.attachmentArr = response.result;
          console.log(this.attachmentArr)
          this.updateTableData();
          console.log(this.tableData)
        },
        (error) => {

        }
      );
  }

  getAssessment(projectID){
    this.dataService.getAssessmentListFlat(projectID).subscribe(
      response => {
        this.assessmentArr = response.Categories;
        this.getQuestionnaire()
        console.log(this.assessmentArr)
      },
      (error) => {

      }
    );
  }

  ngOnInit() {
    this.loading = true;
    this.tableData = [];
    this.currentProject = this.authService.getUserProject();
    let projectID = this.currentProject['Project']['_id'];
    this.getAssessment(projectID);
  }
}
