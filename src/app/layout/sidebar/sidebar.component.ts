import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';

import { TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';

const actionMapping:IActionMapping = {
  mouse: {
    click: (tree, node, $event) => {
      if (node.hasChildren){
        TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
      }else{
        TREE_ACTIONS.SELECT(tree, node, $event);
        let router: Router;
        router.navigate(['/admin/users']);
      }
    }
  },
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  userRole: string;
  menu: object;
  assessment_menu: object;

  customTreeOptions: ITreeOptions = {
    // displayField: 'subTitle',
    isExpandedField: 'expanded',
    idField: 'uuid',
    actionMapping,
    allowDrag: (node) => {
      // console.log('allowDrag?');
      return false;
    },
    allowDrop: (node) => {
      // console.log('allowDrop?');
      return false;
    },
    animateExpand: false
  }

  constructor(private authService: AuthService, private dataService: DataService) {
    this.userRole = this.authService.getUser().Role;

    this.dataService.getAssessmentList().subscribe(
      response => {
        this.assessment_menu = response.Categories;
        this.assessment_menu = this.updateAssessment(this.assessment_menu);
        this.initMenu();
      },
      (error) => {

      }
    );
  }

  updateAssessment(obj){
    for(var i in obj) {
      if(this.userRole != "admin")
        obj[i].route = "/app/assessment";
      else
        obj[i].route = "/"+this.dataService.getAdminUrl()+"assessment";
      if(obj[i].children.length == 0)
        obj[i].hasChildren = false;
      else
        obj[i].hasChildren = true;
      obj[i].expanded = false;
      if(obj[i].children && obj[i].children.length > 0)
      {
        this.updateAssessment(obj[i].children);
      }
    }
    return obj;
  }

  initMenu(){
    if(this.userRole != "admin")
    {
      this.menu = [
        { route: "/app/dashboard", Title: "Dashboard"},
        { route: "/app/progress", Title: "Progress"},
        { route: "/app/files", Title: "Files"},
        { route: "/app/team", Title: "Team"},
        { route: "/app/heatmap", Title: "Heat Map"},
        { route: "/app/reports",  Title: "Reports"},
        { route: "/app/score",  Title: "DealValue Score"},
        { route: "/app/assessments",  Title: "Assessments", hasChildren: true, expanded: true,
          children: this.assessment_menu
        }
      ]
    }else{
      this.menu = [
        { route: "/" + this.dataService.getAdminUrl() + "dashboard", Title: "Dashboard"},
        { route: "/" + this.dataService.getAdminUrl() + "reports", Title: "Reports"},
        { route: "/" + this.dataService.getAdminUrl() + "users", Title: "Users"},
        { route: "/" + this.dataService.getAdminUrl() + "calendar", Title: "Readout Calendar"},
        { route: "/" + this.dataService.getAdminUrl() + "categories", Title: "Categories"},
        { route: "/" + this.dataService.getAdminUrl() + "assessment",  Title: "Assessments", hasChildren: true, expanded: true,
          children: this.assessment_menu
        }
      ]
    }
  }

  ngOnInit() {

  }
  changeStatus(obj){
    obj.open = obj.open ? false: true;
  }
}
