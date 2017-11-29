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
  menu: Array<object>;
  assessment_menu: object;
  userProjectRole: string;
  currentProject: object;
  depth : number  = 0;
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
  isSidebarCollapsed: boolean = false;

  constructor(
    private authService: AuthService,
    private dataService: DataService)
  {
    this.userRole = this.authService.getUser().Role;
    this.dataService.categoryChanged.subscribe(data => this.onCategoryChanged(data));
    this.dataService.projectChanged.subscribe(data => this.onProjectSelect(data));
    this.dataService.sidebarToggled.subscribe(data => this.onSidebarToggled(data));
    if(window.innerWidth <= 1024)
      this.isSidebarCollapsed = true;
  }

  onSidebarToggled(data)
  {
    this.isSidebarCollapsed = data;
  }

  onCategoryChanged(data){
    this.ngOnInit();
  }

  onProjectSelect(data){
    this.ngOnInit();
  }
  updateAssessment(obj){
    this.depth += 1;
    for(var i in obj) {
      if(this.userRole != "admin")
        obj[i].route = "/app/assessment";
      else
        obj[i].route = "/"+this.dataService.getAdminUrl()+"assessment";
      if(obj[i].children.length == 0)
        obj[i].hasChildren = false;
      else
        obj[i].hasChildren = true;
      if(this.depth == 1)
        obj[i].expanded = true;
      else
        obj[i].expanded = false;
      if(obj[i].children && obj[i].children.length > 0)
      {
        this.updateAssessment(obj[i].children);
      }
    }
    return obj;
  }

  initMenu(){
    this.menu = [];
    if(this.userRole != "admin")
    {
      if(this.userProjectRole == "INITIATOR")
      {
        this.menu = [
          { route: "/app/dashboard", Title: "Dashboard - Project Owner"},
          { route: "/app/progress", Title: "Progress"},
          { route: "/app/files", Title: "Files"},
          { route: "/app/team", Title: "Team"},
          { route: "/app/heatmap", Title: "Heat Map"},
          { route: "/app/reports",  Title: "Reports"},
        ];
      }else if( this.userProjectRole == "PRIMARY" )
      {
        this.menu = [
          { route: "/app/dashboard", Title: "Dashboard - Primary User"},
          { route: "/app/progress", Title: "Progress"},
          { route: "/app/files", Title: "Files"},
          { route: "/app/team", Title: "Team"}
        ];
        this.menu = this.menu.concat( this.assessment_menu )
      }else{
        this.menu = [
          { route: "/app/dashboard", Title: "Dashboard - Team Member"},
          { route: "/app/progress", Title: "Progress"}
        ]
        this.menu = this.menu.concat( this.assessment_menu )
      }
    }else{
      this.menu = [
        { route: "/" + this.dataService.getAdminUrl() + "dashboard", Title: "Dashboard - Admin"},
        { route: "/" + this.dataService.getAdminUrl() + "reports", Title: "Reports"},
        { route: "/" + this.dataService.getAdminUrl() + "users", Title: "Users"},
        { href: "https://calendly.com/dealvalue/readout", Title: "Readout Calendar", Type: 'href'},
        { route: "/" + this.dataService.getAdminUrl() + "categories", Title: "Categories"},
      ]
      this.menu = this.menu.concat(this.assessment_menu)
    }
  }

  ngOnInit() {
    this.depth = 0;
    let projectID = null;
    if(this.userRole != "admin")
    {
      this.currentProject = this.authService.getUserProject();
      projectID = this.currentProject['Project']['_id'] || null;
      this.userProjectRole = this.currentProject['Role'];
      this.dataService.getAssessmentList(projectID).subscribe(
        response => {
          this.assessment_menu = response.Categories;
          this.assessment_menu = this.updateAssessment( this.assessment_menu );
          this.initMenu();
        },
        (error) => {

        }
      );
    }else{
      this.dataService.getAdminAssessmentList().subscribe(
        response => {
          this.assessment_menu = response.Categories;
          this.assessment_menu = this.updateAssessment( this.assessment_menu );
          this.initMenu();
        },
        (error) => {

        }
      );
    }
  }
  changeStatus(obj){
    obj.open = obj.open ? false: true;
  }
}
