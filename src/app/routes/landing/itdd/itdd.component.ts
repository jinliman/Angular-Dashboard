import { Component, OnInit, ElementRef } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-itdd',
  templateUrl: './itdd.component.html',
  styleUrls: ['./itdd.component.scss']
})
export class ItddComponent implements OnInit {
  userInfo:object  = {}
  success: number = 0;
  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.success = 0;
  }
  send(){
    let data = {
      info: this.userInfo
    }
    this.dataService.contactUs(data).subscribe(
      response => {
        let error_code = response.ERR_CODE;
        if(error_code == 'ERR_NONE')
        {
          this.success = 1;
        }else{
          this.success = 2;
        }
      },
      (error) => {
          this.success = 2;
      }
    );
  }
}
