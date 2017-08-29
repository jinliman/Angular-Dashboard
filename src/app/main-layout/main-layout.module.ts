import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { LayoutModule } from '../layout/layout.module';

import { MainLayoutComponent } from './main-layout.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [MainLayoutComponent],
  exports: [
  	MainLayoutComponent
  ]
})
export class MainLayoutModule { }
