import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ITComponent } from './it.component';
import { DrlComponent } from './drl/drl.component';

import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationsComponent } from './applications/applications.component';
import { OrganizationComponent } from './organization/organization.component';
import { InfrastructureComponent } from './infrastructure/infrastructure.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ITComponent },
      { path: 'drl', component: DrlComponent },
      { path: 'applications', component: ApplicationsComponent },
      { path: 'organization', component: OrganizationComponent },
      { path: 'infrastructure', component: InfrastructureComponent },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [ITComponent, DrlComponent, ApplicationsComponent, OrganizationComponent, InfrastructureComponent],
  exports: [
    RouterModule
  ]
})
export class ITModule { }
