import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-header-dashboard',
  templateUrl: './header-dashboard.component.html',
  styleUrls: ['./header-dashboard.component.scss']
})
export class HeaderDashboardComponent implements OnInit {

  userInfo : object;
  userProjects : Array<object> = [];
  projectList: Array<object> = [];
  project: string;
  firstname: string = 'Admin';
  shortname: string = 'DV';
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {
  }
  onSelectProject($event){
    this.dataService.onProjectChanged({id: $event['value'], name: $event['label']});
  }

  getProjectList(){
    this.userProjects = JSON.parse(localStorage.getItem('userProjects'));
    this.project = JSON.parse(localStorage.getItem('project'))['id'];
    this.projectList = this.userProjects.map(function(item){
        return {'value': String(item['Project']['_id']), 'label': item['Project']['Name']};
    })
  }
  ngOnInit() {
    this.userInfo = this.authService.getUser()
    if(this.userInfo['Role'] != 'admin')
    {
      this.firstname = this.userInfo['Name']['First']
      this.shortname = this.userInfo['Name']['First'][0] + this.userInfo['Name']['Last'][0];
    }
    if(this.userInfo['Role'] != 'admin')
    {
      this.getProjectList();
    }
  }
}
