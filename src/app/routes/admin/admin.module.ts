import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CalendarComponent } from "angular2-fullcalendar/src/calendar/calendar";

import { SharedModule } from '../../shared/shared.module';
import { AdminloginComponent } from './adminlogin/adminlogin.component';
import { CalendarPageComponent } from './calendar-page/calendar-page.component';
import { UsersComponent } from './users/users.component';
import { ReportComponent } from './report/report.component';
import { QaBuilderComponent } from './qa-builder/qa-builder.component';
import { CategoriesComponent } from './categories/categories.component';
import { AdminAssessmentComponent } from './admin-assessment/admin-assessment.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { SettingComponent } from './setting/setting.component';
import { PromocodeComponent } from './promocode/promocode.component';
import { UserViewComponent } from './user-view/user-view.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { AdminEditComponent } from './admin-edit/admin-edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminComponent },
      { path: 'project/:id', component: ProjectDetailComponent },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'user', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'assessment', component: AdminAssessmentComponent },
      { path: 'assessment/:id', component: AdminAssessmentComponent },
      { path: 'assessment/:id/edit', component: QaBuilderComponent },
      { path: 'setting', component: SettingComponent },
      { path: 'promocode', component: PromocodeComponent },
      { path: 'user/:id', component: UserViewComponent },
      { path: 'user/:id/edit', component: UserEditComponent },
      { path: 'user/admin/:id', component: AdminViewComponent },
      { path: 'user/admin/:id/edit', component: AdminEditComponent },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [
    AdminComponent, CalendarPageComponent, CalendarComponent, UsersComponent, ReportComponent, QaBuilderComponent, CategoriesComponent, AdminAssessmentComponent, ProjectDetailComponent, SettingComponent, PromocodeComponent, UserViewComponent, UserEditComponent, AdminViewComponent, AdminEditComponent],
  exports: [
  	RouterModule
  ]
})
export class AdminModule { }
