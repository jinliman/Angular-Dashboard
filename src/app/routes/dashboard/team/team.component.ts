import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

  tableData: Array<any>;
  statusArr: object;
  assessmentArr: object;
  constructor() { }

  ngOnInit() {
    this.statusArr = {
      0: "NA",
      1: "Complete",
      2: "Pending",
    }
    this.assessmentArr = {
      0: "Application",
      1: "Infrastructure",
      2: "IT Security",
      3: "IT Organization",
      4: "Disaster Recovery",
      5: "IT Projects",
      6: "IT Budgets",
    }
    this.tableData = [
      {username: "Ann Hill", shortname: 'AH', hasDetail: true, open: true,
        subDetails: [
          {status: 0, desc: "Commercial produce development tools", assessment_type: 1,  created_at: "08/01/2017"},
          {status: 1, desc: "Third party content utilized", assessment_type: 2,  created_at: "08/01/2017"},
          {status: 2, desc: "Utilites", assessment_type: 1, created_at: "08/01/2017"},
        ]
      },
      {username: "Ben Reed", shortname: 'BR', hasDetail: true, open: false,
        subDetails: [
          {status: 0, desc: "Organization chart for IT Staff", assessment_type: 2,  created_at: "08/01/2017"},
          {status: 1, desc: "test", assessment_type: 3,  created_at: "08/01/2017"},
          {status: 2, desc: "Organization chart for IT Staff", assessment_type: 3, created_at: "08/01/2017"},
        ]
      },
      {username: "John Doe", shortname: 'JD', hasDetail: false ,open: false},
    ]
  }

}
