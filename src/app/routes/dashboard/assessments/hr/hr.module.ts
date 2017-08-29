import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HRComponent } from './hr.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HRComponent },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HRComponent],
  exports: [
    RouterModule
  ]
})
export class HRModule { }
