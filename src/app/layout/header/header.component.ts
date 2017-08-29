import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (this.authService.isLoggedIn())
      this.isLoggedIn = true;
  }

}
