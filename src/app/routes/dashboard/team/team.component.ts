import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  tableData: Array<any>;
  statusArr: object;
  assessmentArr: Array<object> = [];
  project: string;
  team: Array<object> = [];
  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {
  }

  updateTableData(){
    let data = [];
    for(let i=0; i < this.team.length; i++)
    {
      let userItem:object = {};
      let item = this.team[i];
      userItem['username'] = item['User']['Name']['First'] + ' ' + item['User']['Name']['Last'];
      userItem['shortname'] = item['User']['Name']['First'].charAt(0) + item['User']['Name']['Last'].charAt(0);
      userItem['open'] = true;
      let userAssessments = []
      for(let j=0; j < this.assessmentArr.length; j++)
      {
        let userAssessmentItem:object = {};
        userAssessmentItem['status'] = 0;
        userAssessmentItem['desc'] = this.assessmentArr[j]['Desc'];
        userAssessmentItem['title'] = this.assessmentArr[j]['Title'];
        userAssessmentItem['created_at'] = this.assessmentArr[j]['createdAt'] || this.assessmentArr[j]['created_time'];
        userAssessments.push(userAssessmentItem);
      }
      userItem['hasDetail'] = (userAssessments.length>0) ? true: false;
      userItem['assessments'] = userAssessments;
      data.push(userItem);
    }
    return data;
  }

  getAssessment(){
    this.dataService.getAssessmentListFlat().subscribe(
      response => {
        this.assessmentArr = response.Categories;
        this.tableData = this.updateTableData();
        this.loading = false;
      },
      (error) => {

      }
    );
  }
  ngOnInit() {
    this.loading = true;
    this.project = JSON.parse(localStorage.getItem('project'))['id'];
    let data = {id: this.project}
    this.dataService.getTeam(data).subscribe(
      response => {
        this.team = response.result;
        this.getAssessment()
      },
      (error) => {

      }
    );

    this.statusArr = {
      0: "NA",
      1: "Complete",
      2: "Pending",
    }

    // this.tableData = [
    //   {username: "Ann Hill", shortname: 'AH', hasDetail: true, open: true,
    //     subDetails: [
    //       {status: 0, desc: "Commercial produce development tools", assessment_type: 1,  created_at: "08/01/2017"},
    //       {status: 1, desc: "Third party content utilized", assessment_type: 2,  created_at: "08/01/2017"},
    //       {status: 2, desc: "Utilites", assessment_type: 1, created_at: "08/01/2017"},
    //     ]
    //   },
    //   {username: "Ben Reed", shortname: 'BR', hasDetail: true, open: false,
    //     subDetails: [
    //       {status: 0, desc: "Organization chart for IT Staff", assessment_type: 2,  created_at: "08/01/2017"},
    //       {status: 1, desc: "test", assessment_type: 3,  created_at: "08/01/2017"},
    //       {status: 2, desc: "Organization chart for IT Staff", assessment_type: 3, created_at: "08/01/2017"},
    //     ]
    //   },
    //   {username: "John Doe", shortname: 'JD', hasDetail: false ,open: false},
    // ]
  }

}
