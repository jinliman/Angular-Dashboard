import { Component, OnInit, ElementRef } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { environment } from '../../../../environments/environment';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  paymentMethodRadio: string = 'Stripe';
  member_type: string;
  member_type_arr = [
    'Premium',
    'Professional',
    'Enterprise',
    'Onedone'
  ]
  fee: string;
  adminSetting: object = {};
  notification_text : string = '';
  Promocode: object;
  displayFee: number;
  discount: number;
  paymentType: string;
  projectID: string;
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private authService: AuthService,
    private dataService: DataService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.Promocode = {
      Percent: 0,
      Code: '',
      ErrorStr: '',
      Passed: false
    }
    this.paymentType = "Membership";
    this.route
      .queryParams
      .subscribe(params => {
        this.projectID = params['projectId'];
        if(this.projectID != null && this.projectID != '')
          this.paymentType = "Onetime";
      });

    this.member_type = localStorage.getItem('member_type');
    if(!this.member_type_arr.includes(this.member_type))
    {
      this.member_type = 'Premium';
    }

    this.getSetting();
  }

  getSetting(){
    this.dataService.getAdminSetting().subscribe(
      response => {
        for(let item of response.result)
        {
            this.adminSetting[item['DataType']] = item['Data'];
        }
        this.initData();
      },
      (error) => {

      }
    );
  }

  initData(){
    if(this.paymentType == "Membership")
    {
      switch(this.member_type)
      {
        case 'Professional':
          this.fee = this.adminSetting['ProfessionalFee']; break;
        case 'Enterprise':
          this.fee = this.adminSetting['EnterpriseFee']; break;
        case 'Onedone':
          this.fee = this.adminSetting['OnedoneFee']; break;
        case 'Premium':
        default:
          this.fee = this.adminSetting['PremiumFee']; break;
      }
    }else{
      this.fee = this.adminSetting['OnedoneFee'];
    }
    this.displayFee = parseFloat(this.fee);
    this.discount = 0;
    this.loading = false;
  }

  formatString(str){
    if(str)
      return str.toString().replace(/(.)(?=(.{3})+$)/g,"$1,");
  }
  validPromocode(){
    let data = {
      Code : this.Promocode['Code']
    }
    this.dataService.checkPromocode(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        this.Promocode['Passed'] = false;
        if(error_code == "ERR_NONE")
        {
          this.Promocode['Percent'] = response.Percent;
          this.Promocode['ErrorStr'] = this.Promocode['Percent'] + "% Discount applied";
          this.Promocode['Passed'] = true;
          this.discount = parseFloat(this.fee) * parseFloat(this.Promocode['Percent']) / 100;
          let fee = parseFloat(this.fee) - this.discount;
          this.displayFee = fee;
        }else if(error_code == "ERR_CODE_EXPIRED"){
          this.Promocode['ErrorStr'] = "PromoCode is Expired";
        }else if(error_code == "ERR_INVALID_CODE"){
          this.Promocode['ErrorStr'] = "PromoCode is Invalid";
        }
      },
      (error) => {
        this.Promocode['ErrorStr'] = "Sth went wrong";
      }
    );
  }
  processStripePayment(){
    if(this.paymentType == "Membership"){
      this.membershipUpdate();
    }else{
      this.onetimePayment();
    }
  }
  membershipUpdate(){
    let that = this;
    var handler = (<any>window).StripeCheckout.configure({
      key: environment.stripe_publick_key,
      locale: 'auto',
      token: function (token: any) {
        let data = {
          amount: (that.displayFee * 100).toString(),
          stripe_token: token,
          member_type: that.member_type
        }
        that.dataService.checkoutMembership(data).subscribe(
          response => {
            let error_code = response.ERR_CODE;
            if(error_code == 'ERR_NONE')
            {
              that.router.navigate(['/app/user/membership'], { queryParams: { update: true }});
            }else{

            }
          },
          (error) => {

          }
        );
      }
    });
    handler.open({
      name: 'Payment for Membership',
      description: '',
      amount: this.displayFee * 100
    });
  }

  onetimePayment(){
    let that = this,
      id = this.projectID;
    var handler = (<any>window).StripeCheckout.configure({
      key: environment.stripe_publick_key,
      locale: 'auto',
      token: function (token: any) {
        let data = {
          projectID: id,
          amount: (that.displayFee * 100).toString(),
          stripe_token: token,
        }
        that.dataService.chargePayment(data).subscribe(
          response => {
            let error_code = response.ERR_CODE;
            if(error_code == 'ERR_NONE')
            {
              that.router.navigate(['/app/reports']);
            }else{

            }
          },
          (error) => {

          }
        );
      }
    });
    handler.open({
      name: 'Payment for Report',
      description: '',
      amount: this.displayFee * 100
    });
  }
}
