import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'tld-close-button',
  templateUrl: './close-button.component.html'
})
export class TldCloseButtonComponent{
  @Output() tldClick: EventEmitter<any> = new EventEmitter();
  @Input() ariaCode: string = "CLOSE_BUTTON";
  @ViewChild("clearButton") clearButton: MatButton;
  @Input() disabled: boolean;

  clicked() {
    this.tldClick.emit(null);
  }

}
