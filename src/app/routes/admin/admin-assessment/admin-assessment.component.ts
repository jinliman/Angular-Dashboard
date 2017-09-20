import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-admin-assessment',
  templateUrl: './admin-assessment.component.html',
  styleUrls: ['./admin-assessment.component.scss']
})
export class AdminAssessmentComponent implements OnInit {

  tableData: Array<any> = [];
  statusArr: object;
  assessment: object = {};
  questionnaires: Array<object>= [];
  editAssessmentUrl: string = "";
  loading: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit() {

    this.statusArr = {
      0: "NA",
      1: "Complete",
      2: "Pending",
    }

    this.route
      .params
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.assessment = {};
        this.tableData = [];
        this.questionnaires = [];
        this.editAssessmentUrl = "";
        this.loading = true;
        let assessment_id = params['id'] || '';
        let data = {id: assessment_id};
        this.dataService.getAdminAssessmentFlat(data).subscribe(
          response => {
            if(response.result == null)
              this.router.navigate(['admin/dashboard']);
            this.assessment = response.result;
            this.editAssessmentUrl = "/" + this.dataService.getAdminUrl() + "assessment/"+assessment_id;
            this.getQuestionnaire()
          },
          (error) => {
            this.router.navigate(['admin/dashboard']);
          }
        );
      });
  }

  getQuestionnaire(){
    this.dataService.getQAList().subscribe(
      response => {
        this.questionnaires = response.result;
        this.getTableData()
      },
      (error) => {
      }
    );
  }

  getTableData(){
    for(let entry of [this.assessment].concat(this.assessment['children']))
    {
      console.log(entry)
      let subDetails = [];
      let question = this.questionnaires.find(function(elem){
        return elem['category_id'] == entry['uuid']
      })
      let hasDetail = false;
      if( question && question['questions'].length )
      {
        hasDetail = true;
        for( let question_entry of question['questions'])
        {
          let question_item = {status: 1, desc: question_entry['Label'], type: question_entry['Type'], filename: "test.xls",  uploaderID: question_entry['uuid'], uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: question['createdAt']}
          subDetails.push(question_item)
        }
      }
      let item = {title: entry['Title'], hasDetail: hasDetail,  open: true, completed: false, subDetails: subDetails}
      this.tableData.push(item)
    }
    this.loading = false;
  }
}
