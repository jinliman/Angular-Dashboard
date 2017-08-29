import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

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
      {title: "Company Overview", hasDetail: true, open: true,
        subDetails: [
          {status: 0, desc: "Company Legal Name", filename: "test.xls",  uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 1, desc: "Corporate Address, including department,location, employee name, title, supervisor name", filename: "pdf",  uploaderID: 2, uploaderName: "Ryan",uploaderShortName: 'RB',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "Nmber of Employees", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      }
    ]
  }

}
