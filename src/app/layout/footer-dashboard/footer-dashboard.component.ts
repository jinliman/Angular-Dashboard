import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-footer-dashboard',
  templateUrl: './footer-dashboard.component.html',
  styleUrls: ['./footer-dashboard.component.scss']
})
export class FooterDashboardComponent implements OnInit {

  isLoggedIn = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn())
    {
      this.isLoggedIn = true;
    }
  }

}
