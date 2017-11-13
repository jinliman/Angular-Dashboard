import { Component, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Answer } from '../../../shared/objectSchema';

import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss']
})
export class HeatmapComponent implements OnInit {

  currentProject:object;
  projectID: string = null;
  assessmentList: Array<any> = [];
  tableData: Array<any> = [];

  loading: boolean;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
  ) {
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
    let selectedProject = this.authService.getUserProject();
    this.projectID = selectedProject['Project']['_id'] || null;
  }

  onProjectSelect(data){
    let project = this.authService.getUserProject();
    this.projectID = project['Project']['_id'] || null;
    this.initData();
  }

  ngOnInit() {
    let project = this.authService.getUserProject();
    this.projectID = project['Project']['_id'] || null;
    this.initData()
  }
  initData(){
    this.loading = true;
    let data = {projectID: this.projectID}
    this.dataService.getProject(data).subscribe(response => {
        this.currentProject = response.result;
        console.log(this.currentProject)
        this.apiHandler()
      },
      (error) => {

      }
    );
  }
  apiHandler(){

    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAssessment(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.getTableData();
    });
  }

  getAssessment(resolve){
    this.dataService.getAssessmentList(this.projectID).subscribe(response => {
        this.assessmentList = response.Categories;
        resolve();
      },
      (error) => {

      }
    );
  }

  recursiveUpdate(entries)
  {
    for(let entry of entries)
    {
      let item = { id: entry['uuid'], title: entry['Title']}
      let heatmap_item = this.currentProject['Heatmap'].find(function(h_item){ return h_item['AssignmentID'] == item.id});
      item['Heatmap'] = heatmap_item || { AssignmentID : item.id};
      this.tableData.push(item)
      if(entry.children.length)
      {
        this.recursiveUpdate(entry.children)
      }
    }
  }

  getTableData(){
    this.tableData = [];
    this.recursiveUpdate(this.assessmentList[0]['children'])
    console.log(this.tableData)
    this.loading = false;
  }

}
