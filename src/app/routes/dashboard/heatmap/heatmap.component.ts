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
import { DestroySubscribers } from "ng2-destroy-subscribers";

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss']
})

@DestroySubscribers({
  addSubscribersFunc: 'addSubscribers',
  removeSubscribersFunc: 'removeSubscribers',
  initFunc: 'ngOnInit',
  destroyFunc: 'ngOnDestroy',
})

export class HeatmapComponent implements OnInit {

  public subscribers: any = {}

  currentProject:object;
  projectID: string = null;
  assessmentList: Array<any> = [];
  heatmapData: Array<object> = [];
  heatmapScoreDescription: object = {};
  heatmapScoreDescriptionOrg: Array<object> = [];
  tableData: Array<any> = [];

  loading: boolean;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
  ) {
    let selectedProject = this.authService.getUserProject();
    this.projectID = selectedProject['Project']['_id'] || null;
  }

  addSubscribers(){
    this.subscribers.projectChanged = this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
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
        this.heatmapData = this.currentProject['Heatmap']
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

    promiseArr.push(new Promise((resolve, reject) => {
      this.getHeatmapDescription(() => {resolve(); });
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

  getHeatmapDescription(resolve)
  {
    this.dataService.getHeatmapDesc().subscribe(
      response => {
        this.heatmapScoreDescriptionOrg = response.result;
        for(let item of this.heatmapScoreDescriptionOrg)
        {
          this.heatmapScoreDescription[item['label']] = item['description']
        }
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
      let heatmap_item = this.heatmapData.find(function(h_item){ return h_item['AssignmentID'] == item.id});
      let assessment_heatmap = this.updateHeatMap([entry],null)
      item['Heatmap'] = assessment_heatmap;
      this.tableData.push(item)
      if(entry.children.length)
      {
        this.recursiveUpdate(entry.children)
      }
    }
  }

  getDes(label)
  {
    let result = this.heatmapScoreDescription[label];
    return result || 'Not Available';
  }

  getDes1(label)
  {
    return label || 'Not Available';
  }

  updateHeatMap(entries, heatmap){
    let t_heatmap = [];
    let heatmap_item = this.heatmapData.find(function(h_item){ return h_item['AssignmentID'] == entries[0]['uuid']});
    let t_heatmapSum = {AssignmentID : entries[0].uuid, Cost: null , Fit: null, Integrity:null, Viability:null};
    t_heatmapSum['CostDesc'] = heatmap_item && heatmap_item['CostDesc'] ? heatmap_item['CostDesc']: null;
    t_heatmapSum['IntegrityDesc'] = heatmap_item && heatmap_item['IntegrityDesc'] ? heatmap_item['IntegrityDesc']: null;
    t_heatmapSum['ViabilityDesc'] = heatmap_item && heatmap_item['ViabilityDesc'] ? heatmap_item['ViabilityDesc']: null;
    t_heatmapSum['FitDesc'] = heatmap_item && heatmap_item['FitDesc'] ? heatmap_item['FitDesc']: null;
    let that = this;
    function recursive(obj){
      for(let entry of obj)
      {
          let heatmap_item = that.heatmapData.find(function(h_item){ return h_item['AssignmentID'] == entry['uuid']});
          t_heatmap.push(heatmap_item)
          if(entry.children.length)
          {
            recursive(entry.children)
          }
      }
    }
    recursive(entries);
    t_heatmap.forEach((item, index) => {
      if(item == undefined)
        return;
      t_heatmapSum.Cost += item.Cost || 0;
      t_heatmapSum.Fit += item.Fit || 0;
      t_heatmapSum.Integrity += item.Integrity || 0;
      t_heatmapSum.Viability += item.Viability || 0;
    })
    t_heatmapSum.Cost = t_heatmapSum.Cost ? t_heatmapSum.Cost / t_heatmap.length : null;
    t_heatmapSum.Fit = t_heatmapSum.Fit ? t_heatmapSum.Fit / t_heatmap.length : null;
    t_heatmapSum.Integrity = t_heatmapSum.Integrity ? t_heatmapSum.Integrity  / t_heatmap.length: null;
    t_heatmapSum.Viability = t_heatmapSum.Viability ? t_heatmapSum.Viability  / t_heatmap.length: null;
    return t_heatmapSum;
  }

  getTableData(){
    this.tableData = [];
    this.recursiveUpdate(this.assessmentList[0]['children'])
    console.log(this.tableData)
    this.loading = false;
  }

}
