import { Injectable, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

import { environment } from '../../../environments/environment';

@Injectable()
export class DataService {

  url = environment.serverUrl;

  public currentClassChanged: EventEmitter<Object>;

  constructor(private http: Http, private router: Router, private authService: AuthService) {
    this.currentClassChanged = new EventEmitter();
  }
  getAdminUrl(){
    return environment.adminUrl;
  }
  getHeaders(): Headers {
    return this.authService.getHeaders();
  }

  getUser(data) {
    return this.http.post(this.url + '/api/user/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUserProject(){
    return this.http.post(this.url + '/api/user/project/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  /*
  ---------------- Assessment -----------------
  */
  getAssessmentList(){
    return this.http.post(this.url + '/api/assessment/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAssessment(data){
    return this.http.post(this.url + '/api/assessment/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveAsssessment(data){
    return this.http.post(this.url + '/api/admin/assessment/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUUID()
  {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  /*
  ---------------- Data -----------------
  */
  getCountryList(){
    return this.http.post(this.url + '/api/data/country', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getStateList(data){
    return this.http.post(this.url + '/api/data/state', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getCityList(data){
    return this.http.post(this.url + '/api/data/city', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- QA -----------------
  */

  getQA(data){
    return this.http.post(this.url + '/api/questionnaire/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveQA(data){
    return this.http.post(this.url + '/api/admin/questionnaire/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- QA -----------------
  */

  getAnswers(data){
    return this.http.post(this.url + '/api/user/answer/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveAnswers(data){
    return this.http.post(this.url + '/api/user/answer/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
}
