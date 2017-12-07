import { Component, OnInit, ElementRef } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  paymentMethodRadio: string = 'Stripe';
  member_type: string;
  fee: string;
  adminSetting: object = {};
  notification_text : string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.member_type = params['member_type'] || 'Free';
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
        this.initData();
      },
      (error) => {

      }
    );
  }

  initData(){
    switch(this.member_type)
    {
      case 'Premium':
        this.fee = this.adminSetting['PremiumFee']; break;
      case 'Professional':
        this.fee = this.adminSetting['ProfessionalFee']; break;
      case 'Enterprise':
        this.fee = this.adminSetting['EnterpriseFee']; break;
      case 'Free':
      default:
        this.fee = "0"; break;
    }
  }

  confirmPayment(){
    let data = {
      member_type: this.member_type
    }
    this.dataService.updateMembership(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this.router.navigate(['/app/user/membership'], { queryParams: { update: true }} );
        }else{
          this.notification_text = 'Sth went wrong';
        }
      },
      (error) => {

      }
    );

  }
}
