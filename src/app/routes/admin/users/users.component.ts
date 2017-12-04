import { Component, Input, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NotificationsService } from 'angular2-notifications';

import * as moment from "moment";
declare var jsPDF: any;
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  tableData: Array<any> = [];
  tableData1: Array<any> = [];
  userInfo: object;
  userTypeArr: object;
  ProjectUsers: Array<any> = [];
  Users: Array<any> = [];
  Admins: Array<any> = [];
  UserType: Array<object> = [
    {type:'ADMIN', title: 'Admin'},
    {type:'User', title: 'User'}
  ]
  newUserType: number = null;
  newUser: object = {};
  newAdmin: object = {};
  job_list : Array<object> = [];
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private _notificationService: NotificationsService
  ) {

  }

  ngOnInit() {
    this.userInfo = this.authService.getUser();
    this.userTypeArr = {
      'INITIATOR': 'Initiator',
      'PRIMARY': 'Primary User',
      'MEMBER': 'Team Member'
    }
    this.newUserType = 1;
    this.newUser = {
      Name: {
        First: '',
        Last: '',
        Fullname: '',
        JobTitle: '0'
      },
    }
    this.newAdmin = {
      UserName: '',
      Name: {
        First: '',
        Last: '',
        Fullname: '',
      },
    }
    this.job_list = this.dataService.getJobList();
    this.initData();
  }

  initData(){
    this.tableData = [];
    this.tableData1 = [];
    this.loading = true;
    this.apiHandler();
  }

  openModal(modal)
  {
    this.newUserType = 1;
    this.newUser = {
      Name: {
        First: '',
        Last: '',
        Fullname: '',
        JobTitle: '0'
      },
    }
    this.newAdmin = {
      UserName: '',
      Name: {
        First: '',
        Last: '',
        Fullname: '',
      },
    }
    modal.open();
  }
  addNewUser(modal){
    if(this.newUserType == 1) // Create New User
    {
      let data = {
        data: this.newUser
      }
      this.dataService.newUser(data).subscribe(
        response => {
          if(response.ERR_CODE == 'ERR_NONE')
          {
            this._notificationService.success(
                'Successfully Added!',
                'New User'
            )
            modal.close();
            this.loading = true;
            this.initData();
          }else if(response.ERR_CODE == 'ERR_EMAIL_EXIST'){
            this._notificationService.warn(
                'Email Exist!',
                'New User'
            )
          }else if(response.ERR_CODE == 'ERR_USERNAME_EXIST'){
            this._notificationService.warn(
                'Username Exist!',
                'New User'
            )
          }
        },
        (error) => {
          this._notificationService.error(
              'Sth went wrong!',
              'New User'
          )
        }
      );
    }else if(this.newUserType == 2) // Create New Admin
    {
      let data = {
        data: this.newAdmin
      }
      this.dataService.newAdmin(data).subscribe(
        response => {
          if(response.ERR_CODE == 'ERR_NONE')
          {
            this._notificationService.success(
                'Successfully Added!',
                'New Admin'
            )
            modal.close();
            this.loading = true;
            this.initData();
          }else if(response.ERR_CODE == 'ERR_EMAIL_EXIST'){
            this._notificationService.warn(
                'Email Exist!',
                'New Admin'
            )
          }else if(response.ERR_CODE == 'ERR_USERNAME_EXIST'){
            this._notificationService.warn(
                'Username Exist!',
                'New Admin'
            )
          }
        },
        (error) => {
          this._notificationService.error(
              'Sth went wrong!',
              'New Admin'
          )
        }
      );
    }
  }

  removeAdmin(id)
  {
    if(confirm('Are you sure?'))
    {
      let data = {
        id: id
      }
      this.dataService.removeAdmin(data).subscribe(
        response => {
          let errr_code = response.ERR_CODE;
          if(errr_code == 'ERR_NONE')
          {
            this._notificationService.success(
                'User',
                'Successfully removed!'
            )
            this.loading = true;
            this.initData();
          }else{
            this._notificationService.warn(
                'User',
                response.Message
            )
          }
        },
        (error) => {
          this._notificationService.error(
              'User',
              'Sth went wrong!'
          )
        }
      );
    }
  }

  removeUser(id)
  {
    if(confirm('Are you sure? All information related will be permanently deleted.'))
    {
      let data = {
        id: id
      }
      this.dataService.removeUser(data).subscribe(
        response => {
          let errr_code = response.ERR_CODE;
          if(errr_code == 'ERR_NONE')
          {
            this._notificationService.success(
                'User',
                'Successfully removed!'
            )
            this.loading = true;
            this.initData();
          }else{
            this._notificationService.warn(
                'User',
                response.Message
            )
          }
        },
        (error) => {
          this._notificationService.error(
              'User',
              'Sth went wrong!'
          )
        }
      );
    }
  }
  download() {
    var columns = [
      {title: "ID", dataKey: "id"},
      {title: "User Name", dataKey: "user_name"},
      {title: "Project", dataKey: "project"},
      {title: "Role", dataKey: "project_role"},
      {title: "User Since", dataKey: "user_since"},
      {title: "Last Login", dataKey: "last_login"},
    ]
    var rows = [];
    for(var index in this.tableData)
    {
      let item = this.tableData[index];
      let username = item.userName;
      let project = item.userProjects && item.userProjects[0] ? item.userProjects[0].Project.Name : '';
      let project_role = item.userProjects && item.userProjects[0] ? this.userTypeArr[item.userProjects[0].Role] : '';
      let usersince = moment(item.date).format('MMMM D, YYYY');
      let lastlogin = item.lastLogin ? moment(item.lastLogin).format('MMMM D, YYYY') : '';
      rows.push({
        id: parseInt(index)+1,
        user_name: username,
        project: project,
        project_role: project_role,
        user_since: usersince,
        last_login: lastlogin
      });
      item.userProjects.forEach((projectItem, index) => {
        if(index < 1) return;
        rows.push({
          id: '',
          user_name: '',
          project: projectItem.Project.Name,
          project_role: this.userTypeArr[projectItem.Role],
          user_since: '',
          last_login: ''
        });
      })

    }
    var doc = new jsPDF('l');
    doc.autoTable(columns, rows,
      {
      drawHeaderCell: function (cell, data) {
        cell.styles.fontSize= 46;
        cell.styles.textColor = [96,166,40];
      },
      margin: {top: 40},
      styles: {overflow: 'linebreak', columnWidth: 'wrap'},
      columnStyles: {project: {columnWidth: 'auto'}},
      addPageContent: function(data) {
      	doc.text("User List", 140, 30);
      }}
    );
    doc.save("Users.pdf");
  }

  public apiHandler(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAllProjectUsers(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAdminAllUsers(() => {resolve(); });
    }))

    promiseArr.push(new Promise((resolve, reject) => {
      this.getAdminAllAdmins(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.initTable()
    });
  }

  getAdminAllAdmins(resolve){
    this.dataService.getAdminAllAdmins().subscribe(response => {
        this.Admins = response.result;
        resolve()
      },
      (error) => {

      }
    );
  }
  getAdminAllUsers(resolve){
    this.dataService.getAdminAllUsers().subscribe(response => {
        this.Users = response.result;
        resolve()
      },
      (error) => {

      }
    );
  }
  getAllProjectUsers(resolve){
    this.dataService.getAdminAllProjectUsers().subscribe(response => {
        this.ProjectUsers = response.result;
        resolve()
      },
      (error) => {

      }
    );
  }

  initTable(){

    let index = 1;
    for(let item of this.Users)
    {
      let userID = item['_id'];
      let userProjects = this.ProjectUsers.filter ((elem) => {return elem.User['_id'] == userID})
      this.tableData.push({
        ID: index++,
        userID: item['_id'],
        userName: item.Name.Fullname,
        userShortName: item.Name.First[0] + item.Name.Last[0],
        date: item.createdAt,
        lastLogin: item.LastLogin,
        userProjects: userProjects
      })
    }

    index = 1;
    for(let item of this.Admins)
    {
      this.tableData1.push({
        ID: index++,
        userID: item['_id'],
        userName: item.Name.Fullname,
        email: item.Email,
        userShortName: item.Name.First[0] + item.Name.Last[0],
        date: item.createdAt,
        lastLogin: item.LastLogin,
      })
    }
    this.loading = false;
  }

}
