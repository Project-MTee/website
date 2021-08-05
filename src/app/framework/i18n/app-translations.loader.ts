import { HttpClient } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

export function AppTranslationsLoader(http: HttpClient) {
  const loadDirectories = [
    { prefix: './assets/i18n/tld-translate/', suffix: '.json' },
    { prefix: './assets/i18n/', suffix: '.json' }
  ];
  return new MultiTranslateHttpLoader(http, loadDirectories);
}
