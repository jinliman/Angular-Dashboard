import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header-dashboard',
  templateUrl: './header-dashboard.component.html',
  styleUrls: ['./header-dashboard.component.scss']
})
export class HeaderDashboardComponent implements OnInit {

  userInfo : object;
  constructor(private authService: AuthService) {
  }
  ngOnInit() {
    this.userInfo = this.authService.getUser()
  }

}
