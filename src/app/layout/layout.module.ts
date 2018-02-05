import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderDashboardComponent } from './header-dashboard/header-dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterDashboardComponent } from './footer-dashboard/footer-dashboard.component';
import { SimpleNotificationsModule } from 'angular2-notifications';
@NgModule({
  imports: [
    SimpleNotificationsModule.forRoot(),
    SharedModule
  ],
  declarations: [LayoutComponent, HeaderComponent, FooterComponent, HeaderDashboardComponent, SidebarComponent, FooterDashboardComponent],
  exports: [
  	LayoutComponent,
    HeaderComponent,
    FooterComponent,
    HeaderDashboardComponent,
    FooterDashboardComponent,
    SidebarComponent
  ]
})
export class LayoutModule { }
