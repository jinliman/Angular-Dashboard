import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded } from './module-import-guard';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { AdminAuthGuard } from './services/admin.auth.guard';
import { DataService } from './services/data.service';

@NgModule({
  imports: [
  ],
  providers: [
  	AuthService,
  	AuthGuard,
    AdminAuthGuard,
    DataService
  ],
  declarations: [],
  exports: []
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
