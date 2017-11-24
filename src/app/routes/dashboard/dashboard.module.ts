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

import { SharedModule } from '../../shared/shared.module';
import { AnswerComponent } from './answer/answer.component';
import { SummaryComponent } from './summary/summary.component';
import { DashboardOwnerComponent } from './dashboard-owner/dashboard-owner.component';
import { DashboardMemberComponent } from './dashboard-member/dashboard-member.component';
import { DashboardDetailComponent } from './dashboard-detail/dashboard-detail.component';
import { ProjectNewComponent } from './project-new/project-new.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

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
      { path: 'summary', component: SummaryComponent },
      { path: 'assessment/:id', component: AssessmentComponent},
      { path: 'assessment/:id/answer', component: AnswerComponent},
      { path: 'project/new', component: ProjectNewComponent},
      { path: 'project/:id', component: DashboardDetailComponent},
      { path: 'user/profile', component: UserProfileComponent},
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
  declarations: [DashboardComponent, ProgressComponent, FilesComponent, HeatmapComponent, ReportComponent, ScoreComponent, TeamComponent, AssessmentComponent, AnswerComponent, SummaryComponent, DashboardOwnerComponent, DashboardMemberComponent, DashboardDetailComponent, ProjectNewComponent, UserProfileComponent],
  exports: [
  	RouterModule
  ]
})
export class DashboardModule { }
