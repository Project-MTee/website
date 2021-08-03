import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLanguageService } from './shared/services/app-language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private readonly appLanguage: AppLanguageService) {
  }

  ngOnInit() {
    this.appLanguage.init();
  }
}
