import { Component, Input } from '@angular/core';
import { TldTranslateButtonService } from './tld-translate-button.service';

@Component({
  selector: 'tld-translate-button',
  templateUrl: './translate-button.component.html',
  styleUrls: ['./translate-button.component.scss']
})
export class TldTranslateButtonComponent {

  @Input() disabled: boolean;

  constructor(private service: TldTranslateButtonService) { }

  actionClick() {
    this.service.actionButtonClicked();
  }
 

}
