import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-drl',
  templateUrl: './drl.component.html',
  styleUrls: ['./drl.component.scss']
})
export class DrlComponent implements OnInit {

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
      {title: "IT Staff", hasDetail: true, open: true, completed: false,
        subDetails: [
          {status: 0, desc: "Company Legal Name", filename: "test.xls",  uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 1, desc: "Corporate Address, including department,location, employee name, title, supervisor name", filename: "pdf",  uploaderID: 2, uploaderName: "Ryan",uploaderShortName: 'RB',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "Nmber of Employees", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
      {title: "Applications", hasDetail: true ,open: false, completed: false,
        subDetails: [
          {status: 1, desc: "Organization chart for IT Staff", filename: "test.xls", uploaderID: 6, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 1, desc: "Organization chart for IT Staff", filename: "test.xls", uploaderID: 7, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
      {title: "Infrastructure", hasDetail: true, open: false,  completed: true,
        subDetails: [
          {status: 1, desc: "Organization chart for IT Staff", filename: "test.xls", uploaderID: 6, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 1, desc: "Organization chart for IT Staff", filename: "test.xls", uploaderID: 7, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
      {title: "IT Security", hasDetail: false, open: false, completed: false},
      {title: "IT Organization", hasDetail: true, open: false, completed: true,
        subDetails: [
          {status: 0, desc: "Organization chart for IT Staff", filename: "test.xls",  uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {status: 1, desc: "List of IT employees, including department,location, employee name, title, supervisor name", filename: "pdf",  uploaderID: 2, uploaderName: "Ryan",uploaderShortName: 'RB',  uploaded_at: "08/01/2017"},
          {status: 2, desc: "Organization chart for IT Staff", filename: "doc", uploaderID: 3, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
    ]
  }

}
