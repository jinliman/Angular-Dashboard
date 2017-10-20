import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
  ) { }

  userInfo: object;
  userType: string = '';
  ngOnInit() {
    this.userInfo = {
      UserName: '',
      UserEmail: '',
      UserPassword: '',
    };
  }
  get_start(){
    let data = { Email: this.userInfo['UserEmail']}
    this.dataService.isUserEmailExists(data).subscribe(
      response => {
        this.userType = response.type;
        if(this.userType == 'user')
          alert('User exists!')
        else if(this.userType == 'invite')
          alert('Confirmation Email has already been sent!')
        else
          this.router.navigate(['/register'],{ queryParams: this.userInfo });
      },
      (error) => {
      }
    );
  }
}
