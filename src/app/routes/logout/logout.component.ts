import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor( private authService: AuthService, private router: Router ) { }

  ngOnInit() {
    let userInfo = this.authService.getUser()
    this.authService.logout();
    if(userInfo['Role'] == 'admin')
    {
      let adminUrl = environment.adminUrl
      this.router.navigate(['/'+adminUrl]);
    }else
    {
      this.router.navigate(['/']);
    }
  }

}
