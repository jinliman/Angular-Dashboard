import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {

  plan_type: string = null;
  adminSetting: object = {};
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        this.plan_type = params['plan_type'] || 'Free';
      });
    this.getSetting();
  }
  getSetting(){
    this.dataService.getAdminSetting().subscribe(
      response => {
        for(let item of response.result)
        {
            this.adminSetting[item['DataType']] = item['Data'].toString().replace(/(.)(?=(.{3})+$)/g,"$1,")
        }
      },
      (error) => {

      }
    );
  }

  freeMembership(){
    let data = {
      member_type: 'Free'
    }
    this.dataService.updateMembership(data).subscribe(
      response => {
        this.router.navigate(['/app/user/membership'], { queryParams: { update: true }} );
      },
      (error) => {

      }
    );
  }

}
