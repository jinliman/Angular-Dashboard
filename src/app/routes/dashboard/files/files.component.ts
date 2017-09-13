import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  tableData: Array<any> = [];
  assessmentArr: Array<object> = [];
  loading: boolean;
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {

  }

  updateTableData(){
    for( let item of this.assessmentArr)
    {
      let assessment_item = { title: item['Title'], hasFile: true, open: false}
      let files = [
        {filename: "test.xls", filetype: "xls", link: "test.test", uploaderID: 1, uploaderName: "John",uploaderShortName: 'JD',  uploaded_at: "08/01/2017"},
      ]
      assessment_item['files'] = files;
      this.tableData.push(assessment_item);
    }
    this.loading = false;
  }

  getAssessment(){
    this.dataService.getAssessmentListFlat().subscribe(
      response => {
        this.assessmentArr = response.Categories;
        this.updateTableData()
      },
      (error) => {

      }
    );
  }

  ngOnInit() {
    this.loading = true;
    this.getAssessment();
  }
}
