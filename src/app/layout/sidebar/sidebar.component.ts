import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  userRole: string;
  menu: object;
  constructor(private authService: AuthService, private dataService: DataService) {
    this.userRole = this.authService.getUser().Role;

    if(this.userRole != "admin")
    {
      this.menu = [
        { route: "/app/dashboard", title: "Dashboard"},
        { route: "/app/progress", title: "Progress"},
        { route: "/app/files", title: "Files"},
        { route: "/app/team", title: "Team"},
        { route: "/app/heatmap", title: "Heat Map"},
        { route: "/app/reports",  title: "Reports"},
        { route: "/app/score",  title: "DealValue Score"},
        { route: "/app/assessments",  title: "Assessments", submenu: true, hascontent: false, open: true,
          menulist: [
            {route: "/IT", title: "Information Technology", submenu: true, hascontent: true, open: false,
              menulist: [
                { route: "/drl",  title: "Document Request List (DRL)"},
                { route: "/applications",  title: "Applications"},
                { route: "/infrastructure",  title: "Infrastructure"},
                { route: "/security",  title: "IT Security"},
                { route: "/organization",  title: "IT Organization"},
                { route: "/recovery",  title: "Disaster Recovery"},
                { route: "/projects",  title: "IT Projects"},
                { route: "/budget",  title: "IT Budget"},
                { route: "/welcome",  title: "Welcome to dealvalue"},
              ]
            },
            {route: "/HR", title: "Human Resources", submenu: true, hascontent: true, open: false,
              menulist: [
                { route: "/test",  title: "Test"},
              ]
            },
          ]
        }
      ]
    }else{
      this.menu = [
        { route: "/" + this.dataService.getAdminUrl() + "dashboard", title: "Dashboard"},
        { route: "/" + this.dataService.getAdminUrl() + "reports", title: "Reports"},
        { route: "/" + this.dataService.getAdminUrl() + "users", title: "Users"},
        { route: "/" + this.dataService.getAdminUrl() + "calendar", title: "Readout Calendar"},
        { route: "/" + this.dataService.getAdminUrl() + "assessments",  title: "Assessments", submenu: true, hascontent: false, open: true,
          menulist: [
            {route: "/IT", title: "Information Technology", submenu: true, hascontent: false, open: false,
              menulist: [
                { route: "/drl",  title: "Document Request List (DRL)"},
                { route: "/applications",  title: "Applications"},
                { route: "/infrastructure",  title: "Infrastructure"},
                { route: "/security",  title: "IT Security"},
                { route: "/organization",  title: "IT Organization"},
                { route: "/recovery",  title: "Disaster Recovery"},
                { route: "/projects",  title: "IT Projects"},
                { route: "/budget",  title: "IT Budget"},
                { route: "/welcome",  title: "Welcome to dealvalue"},
              ]
            },
            {route: "/HR", title: "Human Resources", submenu: true, hascontent: false, open: false,
              menulist: [
                { route: "/test",  title: "Test"},
              ]
            },
          ]
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
