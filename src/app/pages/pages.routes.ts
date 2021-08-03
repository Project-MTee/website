import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { TranslateComponent } from './translate/translate.component';

export const routes: Routes = [
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
];
