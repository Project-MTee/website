import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { TranslateComponent } from './translate/translate.component';
import { WebEmbeddedComponent } from 'tld-translate';
import { WebTranslateComponent } from './web-translate/web-translate.component';
import { MainComponent } from '../layout/main/main.component';


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
        path: "terms",
        component: TermsComponent
      },
      {
        path: "privacy",
        component: PrivacyComponent
      }
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
