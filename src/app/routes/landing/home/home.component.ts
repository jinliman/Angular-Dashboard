import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  userInfo: object;

  ngOnInit() {
    this.userInfo = {
      UserName: '',
      UserEmail: '',
      UserPassword: '',
    };
  }
  get_start(){
    this.router.navigate(['/register'],{ queryParams: this.userInfo });
  }
}
