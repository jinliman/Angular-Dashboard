import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { LayoutModule } from '../layout/layout.module';

import { AssetLayoutComponent } from './asset-layout.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [AssetLayoutComponent],
  exports: [
    AssetLayoutComponent
  ]
})
export class AssetLayoutModule { }
