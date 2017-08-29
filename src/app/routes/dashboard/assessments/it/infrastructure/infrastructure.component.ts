import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-infrastructure',
  templateUrl: './infrastructure.component.html',
  styleUrls: ['./infrastructure.component.scss']
})
export class InfrastructureComponent implements OnInit {

  tableData: Array<any>;
  statusArr: object;
  constructor() { }

  ngOnInit() {
    this.statusArr = {
      0: "NA",
      1: "Complete",
      2: "Pending",
    }
    this.tableData = [
      {title: "Company Overview", hasDetail: true, open: true, completed: false,
        subDetails: [
          {status: 0, desc: "Company Legal Name?", filename: "test.xls",  uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 1, desc: "Corprate Address?", filename: "pdf",  uploaderID: 2, uploaderName: "Ryan",uploaderShortName: 'RB',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "Number of Employees?", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "Company Annual Revenue?", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "Years in Business?", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "What industry best fit your business model?", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      }
    ]
  }

}
