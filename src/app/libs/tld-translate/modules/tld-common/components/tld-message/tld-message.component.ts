import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ITldTranslateMessage } from '../../models';

@Component({
  selector: 'tld-message',
  templateUrl: './tld-message.component.html',
  styleUrls: ['./tld-message.component.scss']
})
export class TldMessageComponent implements OnInit {

  constructor() { }

  @Input() message: ITldTranslateMessage;
  @Input() hideClose = false;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  get id() {
    return this.message?.params?.id || "";
  }
  get closeButtonId() {
    return this.message?.params?.closeButtonId || "";
  }

  className: string;
  readonly ClearLabelCode = "CLEAR_NOTIFICATION";

  ngOnInit(): void {
    if (!this.message) {
      return;
    }

    this.className = this.message.type.toLowerCase();
  }

  close() {
    if (this.message?.params?.parentId) {
      const parent = document.getElementById(this.message.params.parentId);
      if (parent) {
        parent.focus();
      }
    }

    this.onClose.emit();
  }
}
