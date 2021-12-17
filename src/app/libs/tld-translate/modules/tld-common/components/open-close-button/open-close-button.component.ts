import { Component, Input, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'tld-open-close-button',
  templateUrl: './open-close-button.component.html',
  styleUrls: ['./open-close-button.component.scss']
})
export class TldOpenCloseButtonComponent {

  @ViewChild(MatButton) button: MatButton;

  private _isOpened;
  get isOpened() { return this._isOpened; }
  @Input() set isOpened(value: boolean) {
    if (this._isOpened && !value) {
      this.focus();
    }
    this._isOpened = value;
  };
  @Input() disabled: boolean;
  @Input() isIcon: boolean;
  @Input() ariaLabelCode: string;

  focus() {
    this.button.focus();
  }

}
