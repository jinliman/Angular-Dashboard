import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';
import { ImageUploadModule } from 'angular2-image-upload';
import { SelectModule } from 'angular2-select';
import { ProgressBarModule } from 'ng2-progress-bar';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MomentModule } from 'angular2-moment';
import { InlineSVGModule } from 'ng-inline-svg';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { TreeModule } from 'angular-tree-component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { ReCaptchaModule } from 'angular2-recaptcha';
import { TabsModule } from "ng2-tabs";
import { QuillEditorModule } from 'ngx-quill-editor';


//import { MaterialModule } from '@angular/material';

//Custom Directive
import { EqualValidator } from './directives/equal-validator.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [EqualValidator],
  exports: [
  	RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    //MaterialModule,
    DragulaModule,
    ImageUploadModule,
    SelectModule,
    ProgressBarModule,
    Ng2SmartTableModule,
    EqualValidator,
    MomentModule,
    InlineSVGModule,
    Daterangepicker,
    TreeModule,
    Ng2Bs3ModalModule,
    AngularMultiSelectModule,
    ReCaptchaModule,
    TabsModule,
    QuillEditorModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
