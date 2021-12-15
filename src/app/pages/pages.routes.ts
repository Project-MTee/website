import { Routes } from '@angular/router';
import { WebEmbeddedComponent } from 'tld-translate';
import { MainComponent } from '../layout/main/main.component';
import { AboutComponent } from './about/about.component';
import { DataProtectionConditionsComponent } from './data-protection-conditions/data-protection-conditions.component';
import { TranslateComponent } from './translate/translate.component';
import { WebTranslateComponent } from './web-translate/web-translate.component';


export const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    children: [
      {
        path: "",
        component: TranslateComponent
      },
      {
        path: "about",
        component: AboutComponent
      },
      {
        path: "data-protection-conditions",
        component: DataProtectionConditionsComponent
      },
    ]
  },
  {
    path: 'web-translate',
    component: WebTranslateComponent
  },
  {
    path: 'webtranslate/embedded',
    component: WebEmbeddedComponent
  }
];
