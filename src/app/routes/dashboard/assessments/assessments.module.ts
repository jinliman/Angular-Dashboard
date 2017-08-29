import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssessmentsComponent } from './assessments.component';

const routes: Routes = [
  {
    path: 'IT',
    children: [
      {  path: '', loadChildren: './it/it.module#ITModule'}
    ]
  },
  {
    path: 'HR',
    children: [
      {  path: '', loadChildren: './hr/hr.module#HRModule'}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AssessmentsComponent],
  exports: [
    RouterModule
  ]
})
export class AssessmentsModule { }
