import { Injectable, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthService {

  url = environment.serverUrl;

  constructor(private http: Http, private router: Router) { }

  getHeaders(): Headers {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (localStorage.getItem('token')) {
      headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
    }
    return headers;
  }

  getToken() {
    let token = "";
    if (localStorage.getItem('token')) {
      try {
        token = JSON.parse(localStorage.getItem('token'));
      } catch(e) {
        this.logout();
        location.href="/";
      }
    }
    return token;
  }

  getUser():any {
    let user = "";
    if (localStorage.getItem('user')) {
      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch(e) {
        this.logout();
        location.href="/";
      }
    }
    return user;
  }

  getUserRole() {
    let user = this.getUser();
    return user.Role;
  }

  getUserProject(){
    let currentUserProject = JSON.parse(localStorage.getItem('project'));
    let userProjects = JSON.parse(localStorage.getItem('userProjects'));
    let currentProject = null;
    if(userProjects && userProjects.length > 0 )
    {
      currentProject =  userProjects.find(function(item){
        return item['Project']['_id'] == currentUserProject['id'];
      })
    }
    return currentProject;
  }

  getUserProjectList(){
    let userProjects = JSON.parse(localStorage.getItem('userProjects'));
    return userProjects;
  }

  veryfiyRole(role) {
    let user = this.getUser();
    if(user.Role != role) {
      this.logout();
      location.href="/";
    }
  }

  getUserDisplayName() {
    return this.getUser().DisplayName;
  }

  login(data, is_admin = false) {
    let login_url = this.url + '/api/login'
    if(is_admin)
      login_url = this.url + '/api/admin_login'
		return this.http.post(login_url, data, { headers: this.getHeaders() })
			.map((response: Response) => response.json());
  }

  getUserPublic(data):any {
    return this.http.post(this.url + '/api/get_public', data, { headers: this.getHeaders() })
			.map((response: Response) => response.json());
  }

  logout() {
    // remove user from local storage to log user out
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // localStorage.removeItem('currentClass');
    localStorage.clear();
  }

  isLoggedIn() {
    let userInfo = this.getUser();
    return this.getToken()!="" && userInfo!="" && userInfo.Role != "admin";
  }

  isAdminLoggedIn() {
    let userInfo = this.getUser();
    return this.getToken()!="" && userInfo!="" && userInfo.Role == "admin"
  }

  @Output() userLoggedInEvent:EventEmitter<boolean> = new EventEmitter<boolean>();

  adminInfo(){
    let data = { UserID: this.getUser()._id };
    return this.http.post(this.url + '/api/admin/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  userInfo() {
    let data = { UserID: this.getUser()._id };
    return this.http.post(this.url + '/api/user/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  register(data) {
    return this.http.post(this.url + '/api/register', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateUserData() {
    this.userInfo().subscribe(
      user => {
        localStorage.setItem('user', JSON.stringify(user.UserInfo));
      }
    );
  }

  resendConfirmation(code){
    let data = { code: code };
    return this.http.post(this.url + '/api/resendconfirm', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  isUserConfirm(code){
    let data = { code: code };
    return this.http.post(this.url + '/api/is_user_confirm', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  confirmEmail(data){
    return this.http.post(this.url + '/api/confirmemail', data, { headers: this.getHeaders()})
      .map((response: Response) => response.json());
  }


  inviteUser(data){
    return this.http.post(this.url + '/api/invite', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  checkInvitationCode(code, update = false){
    let data = { code: code, update: update };
    return this.http.post(this.url + '/api/check_invitecode', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  confirmInvitation(data,){
    return this.http.get(this.url + '/api/confirmemail?data=' + data, { headers: this.getHeaders()})
      .map((response: Response) => response.json());
  }

  validUser(token){
    let data = { token: token };
    return this.http.post(this.url + '/api/is_user', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
	 *  Sample

		  sample(sample_args) {
		    return this.http.get(this.url + additional_urls, {data: sample_args}, {headers: this.getHeaders()})
		      .map((response: Response) => response.json());
		  }
	 *
  **/

}
