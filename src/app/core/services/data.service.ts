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

  public projectChanged: EventEmitter<Object>;
  public categoryChanged: EventEmitter<Object>;
  public progressChanged: EventEmitter<Object>;
  public projectListUpdated: EventEmitter<Object>;
  public projectSubmitted: EventEmitter<Object>;
  public sidebarToggled: EventEmitter<Object>;
  public profileUpdated: EventEmitter<Object>;

  constructor(private http: Http, private router: Router, private authService: AuthService) {
    this.projectChanged = new EventEmitter();
    this.projectListUpdated = new EventEmitter();
    this.categoryChanged = new EventEmitter();
    this.progressChanged = new EventEmitter();
    this.projectSubmitted = new EventEmitter();
    this.sidebarToggled = new EventEmitter();
    this.profileUpdated = new EventEmitter();
  }

  onProfileUpdated(data){
    this.profileUpdated.emit(data);
  }

  onSidebarToggled(data){
    this.sidebarToggled.emit(data);
  }

  onProjectSubmitted(){
    let data = JSON.parse(localStorage.getItem('project'));
    data['Status'] = 'Submitted';
    localStorage.setItem('project', JSON.stringify(data));
    this.projectSubmitted.emit();
  }

  onProjectListUpdated(data){
    localStorage.setItem('project', JSON.stringify(data));
    this.projectListUpdated.emit(data);
  }

  onProjectChanged(data){
    localStorage.setItem('project', JSON.stringify(data));
    this.projectChanged.emit(data);
  }

  onCategoryChanged(){
    this.categoryChanged.emit(true);
  }

  onProgressChanged(data){
    this.progressChanged.emit(data);
  }

  getAdminUrl(){
    return environment.adminUrl;
  }
  getHeaders(): Headers {
    return this.authService.getHeaders();
  }

  isUserEmailExists(data)
  {
    return this.http.post(this.url + '/api/userexists', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUser(data) {
    return this.http.post(this.url + '/api/user/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  getUserSetting(data) {
    return this.http.get(this.url + '/api/user/setting', { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateUserSetting(data){
    return this.http.post(this.url + '/api/user/update_setting', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateUserData(data) {
    return this.http.post(this.url + '/api/user/update', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateUserPassword(data) {
    return this.http.post(this.url + '/api/user/update_password', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  /*
  ---------------- Global Variables --------------------
  */
  getAboutUsList(){
    let about_us_list = [
      {'value':'1', 'label': 'Search Engine'},
      {'value':'2', 'label': 'Referral'},
      {'value':'3', 'label': 'LinkedIn'},
      {'value':'4', 'label': 'Twitter'},
      {'value':'5', 'label': 'DealValue Partner'},
      {'value':'6', 'label': 'Other'}
    ]
    return about_us_list;
  }
  getReasonType(){
    let reason_type = [
      {'value':'1', 'label':'Buy a Company'},
      {'value':'2', 'label':'Sell a Company'},
      {'value':'3', 'label':'IT Assessment'},
      {'value':'4', 'label':'Corporate Development'},
      {'value':'5', 'label':'Other'},
    ]
    return reason_type;
  }
  getJobList(){
    let job_list = [
      {'value': '1', 'label': 'Advisor'},
      {'value': '2', 'label': 'Analyst'},
      {'value': '3', 'label': 'Consultant'},
      {'value': '4', 'label': 'Developer'},
      {'value': '5', 'label': 'Manager'},
      {'value': '6', 'label': 'Director'},
      {'value': '7', 'label': 'Managing Director'},
      {'value': '8', 'label': 'Vice President'},
      {'value': '9', 'label': 'President/CEO'},
      {'value': '10', 'label': 'Partner'},
      {'value': '11', 'label': 'Other'},
    ]
    return job_list;
  }

  getIndustryList()
  {
    let industry_list = [
      {'value': '1', 'label': 'Advertising'},
      {'value': '2', 'label': 'Aerospace & Defense'},
      {'value': '3', 'label': 'Agriculture & Forestry Sector'},
      {'value': '4', 'label': 'Arts, Entertainment &  Media'},
      {'value': '5', 'label': 'Automotive'},
      {'value': '6', 'label': 'Building & Construction'},
      {'value': '7', 'label': 'Business Services'},
      {'value': '8', 'label': 'Chemical'},
      {'value': '9', 'label': 'Construction'},
      {'value': '10', 'label': 'Consulting & Professional Services'},
      {'value': '11', 'label': 'Consumer Products & Goods'},
      {'value': '12', 'label': 'Education'},
      {'value': '13', 'label': 'Finance & Insurance'},
      {'value': '14', 'label': 'Government'},
      {'value': '15', 'label': 'Healthcare'},
      {'value': '16', 'label': 'Healthcare Information & Technology'},
      {'value': '17', 'label': 'Manufacturing & Industrials'},
      {'value': '18', 'label': 'Membership Organizations'},
      {'value': '19', 'label': 'Mining'},
      {'value': '20', 'label': 'Oil & Gas'},
      {'value': '21', 'label': 'Pharmaceuticals'},
      {'value': '22', 'label': 'Real Estate'},
      {'value': '23', 'label': 'Renewables/Energy'},
      {'value': '24', 'label': 'Restaurants, Bars & Food Services'},
      {'value': '25', 'label': 'Retail'},
      {'value': '26', 'label': 'Technology & Telecom'},
      {'value': '27', 'label': 'Transportation Services'},
      {'value': '28', 'label': 'Utilities'},
      {'value': '29', 'label': 'Waste & Recycling'},
      {'value': '30', 'label': 'Wholesale'},
      {'value': '31', 'label': 'Other'}
    ]
    return industry_list;
  }

  getKeymetricList()
  {
    let keymetric_list = [
      {'value': '1', 'label': 'IT Spending as Percentage of Revenue'},
      {'value': '2', 'label': 'Per-User Spending'},
      {'value': '3', 'label': 'Capital Budget (CapEx) as a % of IT spending'},
      {'value': '4', 'label': 'IT Security and Disaster Recovery'},
      {'value': '5', 'label': 'Business application spending as %% of IT spending'},
      {'value': '6', 'label': 'Business application spending per user'},
      {'value': '7', 'label': 'Personnel as percentage of IT operational spending'},
      {'value': '8', 'label': 'Users per IT staff member'},
      {'value': '9', 'label': 'IT staff turnover'},
      {'value': '10', 'label': 'Annual training allocation per IT employee'},
      {'value': '11', 'label': 'Contingency workers as percentage of IT staff'},
      {'value': '12', 'label': 'Users per help desk staff member'},
      {'value': '13', 'label': 'Network infrastructure as percentage of IT spending'},
      {'value': '14', 'label': 'Network infrastructure spending per user'},
      {'value': '15', 'label': 'IT security as percentage of IT spending'},
      {'value': '16', 'label': 'IT security spending per user'},
      {'value': '17', 'label': 'PCs/end-user devices as percentage of IT spending'}
    ]
    return keymetric_list;
  }

  getMetricColorList()
  {
    let list = [
      {'value': '0', 'label': 'NA'},
      {'value': '1', 'label': 'Orange'},
      {'value': '2', 'label': 'Yellow'},
      {'value': '3', 'label': 'Green'}
    ]
    return list;
  }
  /*
  ---------------- Project -----------------
  */

  chargePayment(data){
    return this.http.post(this.url + '/api/user/charge_payment', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  postProject(data){
    return this.http.post(this.url + '/api/user/project/new', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getProjectUsers(data){
    return this.http.post(this.url + '/api/user/project/users', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getTimeLapse(data){
    return this.http.post(this.url + '/api/user/project/time_lapse', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getProject(data){
    return this.http.post(this.url + '/api/user/project/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUserProject(){
    return this.http.post(this.url + '/api/user/project/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getProjectStatusList(data){
    return this.http.post(this.url + '/api/user/project/status_list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getProjectAttachment(data){
    return this.http.post(this.url + '/api/user/project/attachment', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getDueDiligenceType(){
    return this.http.post(this.url + '/api/duediligence', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  submitProject(data){
    return this.http.post(this.url + '/api/user/project/submit', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUserSubmittedProject(){
    return this.http.post(this.url + '/api/user/project/submit_list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- Assessment -----------------
  */
  getAssessmentList(projectID = null){
    let data = {projectID: projectID};
    return this.http.post(this.url + '/api/assessment/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAssessmentListFlat(projectID = null){
    let data = {projectID: projectID};
    return this.http.post(this.url + '/api/assessment/list_flat', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAssessmentListAllFlat(){
    return this.http.post(this.url + '/api/assessment/list_flat_all', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAssessment(data){
    return this.http.post(this.url + '/api/assessment/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAssessmentFlat(data){
    return this.http.post(this.url + '/api/assessment/get_flat', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }


  getAssignment(data){
    return this.http.post(this.url + '/api/assessment/assignment/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveAssignment(data){
    return this.http.post(this.url + '/api/assessment/assignment/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUserAssignment(data){
    return this.http.post(this.url + '/api/assessment/assignment/get_user', data, { headers: this.getHeaders() })
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
    return this.http.post(this.url + '/api/data/country_list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getStateList(data){
    return this.http.post(this.url + '/api/data/state_list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getCityList(data){
    return this.http.post(this.url + '/api/data/city_list ', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getCountryItem(data){
    return this.http.post(this.url + '/api/data/country', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getStateItem(data){
    return this.http.post(this.url + '/api/data/state', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getCityItem(data){
    return this.http.post(this.url + '/api/data/city ', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- QA -----------------
  */

  getQAList(){
    return this.http.post(this.url + '/api/questionnaire/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getQA(data){
    return this.http.post(this.url + '/api/questionnaire/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveQA(data){
    return this.http.post(this.url + '/api/admin/questionnaire/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- Answer -----------------
  */

  getAnswers(data){
    return this.http.post(this.url + '/api/user/answer/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAnswerList(data){
    return this.http.post(this.url + '/api/user/answer/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAnswerAllList(data){
    return this.http.post(this.url + '/api/user/answer/list_all', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUserAnswerList(data){
    return this.http.post(this.url + '/api/user/answer/userlist', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveAnswers(data){
    return this.http.post(this.url + '/api/user/answer/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  toggleNA(data){
    return this.http.post(this.url + '/api/user/answer/toggle-na', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- Team -----------------
  */

  getTeam(data){
    return this.http.post(this.url + '/api/user/team/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getTeamMembers(data){
    return this.http.post(this.url + '/api/user/team/members', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- Attachment -----------------
  */

  getAttachment(data){
    return this.http.post(this.url + '/api/user/attachment/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getUserAttachment(data){
    return this.http.post(this.url + '/api/user/attachment/user', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveAttachment(sourceType, data){
    let headers = new Headers();
    headers.set('Accept', 'application/json');
  	headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
    let api_url = '/api/user/attachment/save';
    if(sourceType != 'Computer')
      api_url = '/api/user/attachment/save_link';
    return this.http.post(this.url + api_url, data, { headers: headers })
      .map((response: Response) => response.json());
  }

  /**************** ADMIN *********************/
  /*
  ---------------- Admin Generic -----------------
  */
  getAdminSetting(){
    return this.http.get(this.url + '/api/setting/get',  { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateAdminPaymentSetting(data)
  {
    return this.http.post(this.url + '/api/admin/setting/update', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateAdminSetting(data)
  {
    return this.http.post(this.url + '/api/admin/update_setting', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateAdminPassword(data)
  {
    return this.http.post(this.url + '/api/admin/update_password', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
  ---------------- PromoCode -----------------
  */

  getPromoCode()
  {
    return this.http.get(this.url + '/api/admin/promocode/get', { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  checkPromocode(data){
    return this.http.post(this.url + '/api/promocode/check', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updatePromoCode(data)
  {
    return this.http.post(this.url + '/api/admin/promocode/update', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  removePromoCode(data)
  {
    return this.http.post(this.url + '/api/admin/promocode/delete', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  sendPromoCode(data)
  {
    return this.http.post(this.url + '/api/admin/promocode/send', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  /*
  ---------------- Admin Assessment -----------------
  */

  getAdminAssessmentList(){
    return this.http.post(this.url + '/api/admin/assessment/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminAssessmentListFlat(){
    return this.http.post(this.url + '/api/admin/assessment/list_flat', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminAssessment(data){
    return this.http.post(this.url + '/api/admin/assessment/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminAssessmentFlat(data){
    return this.http.post(this.url + '/api/admin/assessment/get_flat', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  saveAsssessment(data){
    return this.http.post(this.url + '/api/admin/assessment/save', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminAssessmentListFlatProject(){
    return this.http.post(this.url + '/api/admin/assessment/list_flat_project', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminAnswerList(){
    return this.http.post(this.url + '/api/admin/answer/list_all', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  /*
  ---------------- Admin Project -----------------
  */

  getSubmittedProject(){
    return this.http.post(this.url + '/api/admin/project/submit_list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateProjectFeedback(data){
    return this.http.post(this.url + '/api/admin/project/update_feedback', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateProjectStatus(data){
    return this.http.post(this.url + '/api/admin/project/update_status', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getHeatmap(data){
    return this.http.post(this.url + '/api/user/project/get_heatmap', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getHeatmapDesc(){
    return this.http.post(this.url + '/api/user/project/get_heatmapdesc', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateHeatmap(data){
      return this.http.post(this.url + '/api/admin/project/update_heatmap', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateMetric(data){
    return this.http.post(this.url + '/api/admin/project/update_metric', data, { headers: this.getHeaders() })
    .map((response: Response) => response.json());
  }
  getAdminAllProject(){
    return this.http.post(this.url + '/api/admin/project/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminAllProjectUsers(){
    return this.http.post(this.url + '/api/admin/project/users', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminProjectStatusList(){
    return this.http.post(this.url + '/api/admin/project/status_list', {}, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAdminProject(data){
    return this.http.post(this.url + '/api/admin/project/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
}
