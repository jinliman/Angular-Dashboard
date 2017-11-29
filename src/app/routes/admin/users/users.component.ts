import { Component, Input, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser'

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute,Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import * as moment from "moment";
declare var jsPDF: any;
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  tableData: Array<any> = [];
  userTypeArr: object;
  ProjectUsers: Array<any> = [];
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.userTypeArr = {
      1: 'Initiator',
      2: 'Primary User',
      3: 'Team Member'
    }
    this.tableData = [];
    this.loading = true;
    this.apiHandler();
  }

  download() {
    var columns = [
      {title: "ID", dataKey: "id"},
      {title: "User Type", dataKey: "user_type"},
      {title: "User Name", dataKey: "user_name"},
      {title: "User Company", dataKey: "user_company"},
      {title: "User Since", dataKey: "user_since"},
      {title: "Last Login", dataKey: "last_login"},
    ]
    var rows = [];
    for(var index in this.tableData)
    {
      let item = this.tableData[index];
      let usertype = this.userTypeArr[item.userType];
      let username = item.userName;
      let companyname = item.userCompanyName;
      let usersince = moment(item.date).format('MMMM D, YYYY');
      let lastlogin = moment(item.lastLogin).format('MMMM D, YYYY');
      rows.push({
        id: parseInt(index)+1,
        user_type: usertype,
        user_name: username,
        user_company: companyname,
        user_since: usersince,
        last_login: lastlogin
      });
      console.log(rows)
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
      columnStyles: {user_company: {columnWidth: 'auto'}},
      addPageContent: function(data) {
      	doc.text("User List", 140, 30);
      }}
    );
    doc.save("table.pdf");
  }

  public apiHandler(){
    let promiseArr= [];
    promiseArr.push(new Promise((resolve, reject) => {
      this.getAllProjectUsers(() => {resolve(); });
    }))

    Promise.all(promiseArr).then(() => {
      this.initData()
    });
  }

  public getAllProjectUsers(resolve){
    this.dataService.getAdminAllProjectUsers().subscribe(response => {
        this.ProjectUsers = response.result;
        console.log(this.ProjectUsers)
        resolve()
      },
      (error) => {

      }
    );
  }

  initData(){

    let index = 1;
    for(let item of this.ProjectUsers)
    {
      let userType = 3;
      userType = (item.Role == 'INITIATOR') ? 1 : userType;
      userType = (item.Role == 'PRIMARY') ? 2 : userType;

      this.tableData.push({
        ID: index++,
        userType: userType,
        userName: item.User.Name.Fullname,
        userShortName: item.User.Name.First[0] + item.User.Name.Last[0],
        userCompanyName: item.Project.Company.Name,
        date: item.createdAt,
        lastLogin: item.User.LastLogin
      })
    }
    this.loading = false;
    console.log(this.tableData)
  }

}
