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
    private dataService: DataService
  ) {
  }

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
          alert('Looks like the email address already has an account. If this is you, please use your login credentials to access your account or select Forgot Password to reset your password.')
        else if(this.userType == 'invite')
          alert('Confirmation Email has already been sent!')
        else
          this.router.navigate(['/signup'],{ queryParams: this.userInfo });
      },
      (error) => {
      }
    );
  }
}
