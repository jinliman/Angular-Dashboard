import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  data: Array<any>;
  userTypeArr: object;
  constructor() { }

  ngOnInit() {
    this.userTypeArr = {
      1: 'Initiator',
      2: 'Primary User',
      3: 'Team Member'
    }

    this.data = [
      {
        ID: "1420",
        userType: 1,
        userName: "John Doe",
        userShortName: "JD",
        userCompanyName: "Soft Corp",
        date: "August 14, 2017",
        lastLogin: "August 14, 2017"
      },
      {
        ID: "1421",
        userType: 2,
        userName: "John Doe",
        userShortName: "JD",
        userCompanyName: "Soft Corp",
        date: "August 14, 2017",
        lastLogin: "August 14, 2017"
      },
      {
        ID: "1422",
        userType: 3,
        userName: "John Doe",
        userShortName: "JD",
        userCompanyName: "Soft Corp",
        date: "August 14, 2017",
        lastLogin: "August 14, 2017"
      }
    ];
  }

}
