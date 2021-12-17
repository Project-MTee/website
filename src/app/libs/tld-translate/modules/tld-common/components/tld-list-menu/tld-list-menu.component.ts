import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'tld-list-menu',
  templateUrl: './tld-list-menu.component.html',
  styleUrls: ['./tld-list-menu.component.scss']
})
export class TldListMenuComponent {
  @ViewChild(MatMenu) menu: MatMenu;

  /** Title key. Should be set if element is not string. */
  @Input() titleKey: string;
  @Input() list: any[];
  @Input() selected: any;
  @Input() disabled: boolean;
  /** Open menu button aria label */
  @Input() ariaLabel: string;
  /** Which property of object should be emitted when element is selected. By default, object is returned. */
  @Input() valueKey: string;
  /** For testing purposes. Adds this to attributes for wrapper. */
  @Input() testId: string;
  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  select(element: any) {
    this.selectionChange.next(this.valueKey ? element?.[this.valueKey] : element);
  }

  onMenuOpen() {
    if (this.testId) {
      const panel = document.getElementById(this.menu.panelId);
      panel.setAttribute("data-test-id", this.testId);
    }
  }
}
