import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [TranslateModule.forRoot()],
  exports: [TranslateModule]
})
export class I18NModule {
  static forRoot(configuredProviders?: Array<any>): ModuleWithProviders<I18NModule> {
    return {
      ngModule: I18NModule,
      providers: configuredProviders
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: I18NModule) {
    if (parentModule) {
      throw new Error('I18NModule already loaded. Import in root module only.');
    }
  }
}
