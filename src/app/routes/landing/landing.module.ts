import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [LandingComponent],
  exports: [
  	RouterModule
  ]
})
export class LandingModule { }
