import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  tableData: Array<any>;
  constructor() {
    this.tableData = [
      {title: "Company Overview", hasFile: true, open: true,
        files: [
          {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {filename: "ID-DATA.pdf", filetype: "pdf", link: "test.test", uploaderID: 1, uploaderName: "Ryan",uploaderShortName: 'RB',  uploaded_at: "08/01/2017"},
          {filename: "ID-DATA1.doc", filetype: "doc", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
      {title: "IT Staff", hasFile: true, open: false,
        files: [
          {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
      {title: "Applications", hasFile: false ,open: false},
      {title: "Infrastructure", hasFile: true, open: false,
        files: [
          {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
          {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
      {title: "IT Security", hasFile: true, open: false,
        files: [
          {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
        ]
      },
    ]
  }

  ngOnInit() {
  }
}
