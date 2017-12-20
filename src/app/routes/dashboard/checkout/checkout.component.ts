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

  paymentMethodRadio: string = 'Credit Card';
  member_type: string;
  member_type_arr = [
    'Premium',
    'Professional',
    'Enterprise',
    'Onedone'
  ]
  ccInfo: object={}
  ccInfoInvalid: object={}

  plaidHander: any = null;

  fee: any;
  adminSetting: object = {};
  notification_text : string = '';
  Promocode: object;
  displayFee: number;
  discount: number;
  paymentType: string;
  projectID: string;
  currentModal: any;
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
      this.fee = this.fee * 12;
    }else{
      this.fee = this.adminSetting['OnedoneFee'];
    }
    this.displayFee = parseFloat(this.fee);
    this.discount = 0;
    this.loading = false;
  }

  formatString(str){
    if(str)
      return str.toFixed(2).toString();
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
  validCard(){
    let that = this;
    let stripe = (<any>window).Stripe;
    stripe.setPublishableKey(environment.stripe_publick_key);
    this.ccInfoInvalid[0] = !stripe.card.validateCardNumber(this.ccInfo['card_number']);
    this.ccInfoInvalid[1] = !this.ccInfo['card_first_name'];
    this.ccInfoInvalid[2] = !this.ccInfo['card_last_name'];
    this.ccInfoInvalid[3] = !stripe.card.validateExpiry(this.ccInfo['card_expiry']);
    this.ccInfoInvalid[4] = !stripe.card.validateCVC(this.ccInfo['card_cvc']);

    // Object.values(this.ccInfoInvalid).every((item) => {!item})
    let isValid = true;
    for(let key of Object.keys(this.ccInfoInvalid))
    {
      isValid = isValid && !this.ccInfoInvalid[key];
    }
    if(isValid){
      let that = this;
      stripe.card.createToken({
        number: this.ccInfo['card_number'],
        cvc: this.ccInfo['card_cvc'],
        exp: this.ccInfo['card_expiry'],
        name: this.ccInfo['card_first_name'] + ' ' + this.ccInfo['card_last_name']
      }, (status, response) => {
          this.processPayment(status, response, that)
      });
    }
  }
  processPayment(status, response, obj){
    if(status == 200){
      let token = {
				id: response.id
      }
      let data = {
        amount: (obj.displayFee * 100).toString(),
        stripe_token: token,
        member_type: obj.member_type,
        projectID: this.projectID
      }
      let apiHandler = obj.dataService.checkoutMembership(data);
      let redirectUrl = "/app/user/membership?update=true";
      if(this.paymentType == "Membership"){
        apiHandler = obj.dataService.checkoutMembership(data);
        redirectUrl = "/app/user/membership?update=true";
      }else{
        apiHandler = obj.dataService.chargePayment(data);
        redirectUrl = "/app/reports";
      }
      apiHandler.subscribe(
        response => {
          let error_code = response.ERR_CODE;
          if(error_code == 'ERR_NONE')
          {
            location.href= redirectUrl;
          }else{
            obj.ccInfoInvalid[0] = true;
          }
        },
        (error) => {
          obj.ccInfoInvalid[0] = true;
        }
      );
    }else if(status == 402)
    {
      let error = response.error;
      if(error.type == "card_error")
      {
        switch(error.param)
        {
          case 'exp':
            obj.ccInfoInvalid[3] = true;
            break;
          case 'cvc':
            obj.ccInfoInvalid[4] = true;
            break;
          case 'number':
            obj.ccInfoInvalid[0] = true;
            break;
        }
      }
    }
  }

  processBankPayment(public_token, metadata)
  {
    let data = {
      amount: (this.displayFee * 100).toString(),
      public_token: public_token,
      account_id: metadata.account_id,
      member_type: this.member_type,
      projectID: this.projectID
    }
    let apiHandler = this.dataService.checkoutMembershipBank(data);
    let redirectUrl = "/app/user/membership?update=true";
    if(this.paymentType == "Membership"){
      apiHandler = this.dataService.checkoutMembershipBank(data);
      redirectUrl = "/app/user/membership?update=true";
    }else{
      apiHandler = this.dataService.chargePaymentBank(data);
      redirectUrl = "/app/reports";
    }
    apiHandler.subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          location.href = redirectUrl;
        }else{
        }
      },
      (error) => {
      }
    );
  }

  paymentModal(modal){
    switch(this.paymentMethodRadio)
    {
      case 'Bank':
        this.plaidHander = (<any>window).Plaid.create({
          env: environment.PLAID_ENV,
          clientName: 'Stripe/Plaid Test',
          key: environment.PLAID_PUBLIC_KEY,
          product: ['auth'],
          selectAccount: true,
          onSuccess: (public_token, metadata) => {
            this.processBankPayment(public_token, metadata)
          },
        });
        this.plaidHander.open();
        break;
      case 'Credit Card':
      default:
        this.ccInfo = {};
        this.ccInfoInvalid = {};
        this.currentModal = modal;
        modal.open();
        break;
    }
  }

}
