import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TldTranslateButtonService {

  private onClick = new Subject<any>();

  constructor() { }

  actionButtonClicked() {
    this.onClick.next();
  }

  getActionClick() {
    return this.onClick.asObservable();
  }
}
