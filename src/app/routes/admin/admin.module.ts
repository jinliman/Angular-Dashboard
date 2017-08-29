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

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminComponent },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'users', component: UsersComponent },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [AdminComponent, CalendarPageComponent, CalendarComponent, UsersComponent, ReportComponent],
  exports: [
  	RouterModule
  ]
})
export class AdminModule { }
