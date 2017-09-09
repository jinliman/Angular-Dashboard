import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { LayoutModule } from '../layout/layout.module';

import { MainLayoutComponent } from './main-layout.component';

import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { SimpleNotificationsModule } from 'angular2-notifications';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    SlimLoadingBarModule.forRoot(),
    SimpleNotificationsModule.forRoot()
  ],
  declarations: [MainLayoutComponent],
  exports: [
  	MainLayoutComponent
  ]
})
export class MainLayoutModule { }
