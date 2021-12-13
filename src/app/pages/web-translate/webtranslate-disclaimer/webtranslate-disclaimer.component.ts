import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-webtranslate-disclaimer',
  templateUrl: './webtranslate-disclaimer.component.html',
  styleUrls: ['./webtranslate-disclaimer.component.scss']
})
export class WebtranslateDisclaimerComponent implements OnInit {
  showText = false;
  @Output() readonly closeDisclaimer: EventEmitter<any> = new EventEmitter<any>();


  constructor( private readonly translate: TranslateService
    ) { }
  ngOnInit(): void { }

  close(): void {
    this.closeDisclaimer.emit();
  }
  showFullText(): void {
    this.showText = true;
  }

}
