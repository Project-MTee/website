import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IHighlightSelectedSentence } from '../../tld-text/models';

@Injectable({
  providedIn: 'root'
})
export class TldHighlightService {

  constructor() { }

  selectedTargetSentence: IHighlightSelectedSentence;

  private selectedTargetSentence$: Subject<{ previous: IHighlightSelectedSentence, next: IHighlightSelectedSentence}> = new Subject();

  onChangeSelectedTargetSentence() {
    return this.selectedTargetSentence$.asObservable();
  }

  changeSelectedTargetSentence(sentence: IHighlightSelectedSentence) {
    const observableObj = { previous: this.selectedTargetSentence, next: sentence };
    this.selectedTargetSentence = sentence;
    this.selectedTargetSentence$.next(observableObj);
  }
}
