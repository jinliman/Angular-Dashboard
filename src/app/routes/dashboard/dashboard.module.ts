import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { FilesComponent } from './files/files.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { ReportComponent } from './report/report.component';
import { ScoreComponent } from './score/score.component';
import { TeamComponent } from './team/team.component';
import { AssessmentComponent } from './assessment/assessment.component';

import { SharedModule } from '../../shared/shared.module'

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'files', component: FilesComponent },
      { path: 'team', component: TeamComponent },
      { path: 'heatmap', component: HeatmapComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'score', component: ScoreComponent },
      { path: 'assessment/:id', component: AssessmentComponent },
      {
        path: 'assessments',
        children: [
          {  path: '', loadChildren: './assessments/assessments.module#AssessmentsModule'}
        ]
      },
      { path: '**', redirectTo: 'dashboard'}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [DashboardComponent, ProgressComponent, FilesComponent, HeatmapComponent, ReportComponent, ScoreComponent, TeamComponent, AssessmentComponent],
  exports: [
  	RouterModule
  ]
})
export class DashboardModule { }
