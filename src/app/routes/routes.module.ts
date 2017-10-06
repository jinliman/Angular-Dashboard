import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../core/services/auth.guard';
import { AdminAuthGuard } from '../core/services/admin.auth.guard';

import { CommonModule } from '@angular/common';


//Admin
import { AdminloginComponent } from './admin/adminlogin/adminlogin.component';

//LayoutComponent
import { LayoutComponent } from '../layout/layout.component';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { AssetLayoutComponent } from '../asset-layout/asset-layout.component';

// Landing pages
import { HomeComponent } from './landing/home/home.component';
import { FaqComponent } from './landing/faq/faq.component';
import { PoliciesComponent } from './landing/policies/policies.component';

// Asset Pages
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { EmailSentComponent } from './email-sent/email-sent.component';
import { LogoutComponent } from './logout/logout.component';
import { TeamsComponent } from './teams/teams.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ComfirmInvitationComponent } from './comfirm-invitation/comfirm-invitation.component';
import { OnedriveAuthComponent } from './onedrive-auth/onedrive-auth.component';

export const routes = [

  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', loadChildren: './dashboard/dashboard.module#DashboardModule'}
    ]
  },

  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      {  path: '', loadChildren: './admin/admin.module#AdminModule'}
    ]
  },
  {
    path: 'admin',
    component: AssetLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AdminloginComponent},
      { path: '**', redirectTo: 'login' }
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {  path: '', component: HomeComponent},
      {  path: 'faq', component: FaqComponent},
      {  path: 'terms-policies', component: PoliciesComponent},
      // {  path: 'testimonial', component: './landing/landing.module#HomeComponent'},
      // {  path: 'news', component: './landing/landing.module#HomeComponent'},
      // {  path: 'contact', component: './landing/landing.module#HomeComponent'},
    ]
  },
  {
    path: '',
    component: AssetLayoutComponent,
    children: [
      {  path: 'login', component: LoginComponent},
      {  path: 'register', component: RegisterComponent},
      {  path: 'logout', component: LogoutComponent},
      {  path: 'forgot-password', component: ForgotPasswordComponent},
      {  path: 'email-sent', component: EmailSentComponent},
      {  path: 'confirm-email', component: ConfirmEmailComponent},
      {  path: 'team-invite', component: TeamsComponent },
      {  path: 'confirm-invitation', component: ComfirmInvitationComponent },
      {  path: 'onedriveAuth', component: OnedriveAuthComponent }
    ]
  },

  // Not found
  { path: '**', redirectTo: '' }

];


@NgModule({
  imports: [
		SharedModule,
    CommonModule,
		RouterModule.forRoot(routes)
  ],
  declarations: [
    HomeComponent,
    FaqComponent,
    PoliciesComponent,
    RegisterComponent,
    LoginComponent,
    ForgotPasswordComponent,
    EmailSentComponent,
    LogoutComponent,
    TeamsComponent,
    AdminloginComponent,
    ConfirmEmailComponent,
    ComfirmInvitationComponent,
    OnedriveAuthComponent
    ],
  exports: [
  	RouterModule,
    SharedModule,
  ]
})
export class RoutesModule {
	constructor() {}
}
