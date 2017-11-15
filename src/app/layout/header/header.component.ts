import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;
  dashboardUrl = '/app';
  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (this.authService.isAdminLoggedIn())
    {
      this.isLoggedIn = true;
      this.dashboardUrl = '/'+ environment.adminUrl;
    }
    if (this.authService.isLoggedIn())
    {
      this.isLoggedIn = true;
      this.dashboardUrl = '/app';
    }
  }

}
