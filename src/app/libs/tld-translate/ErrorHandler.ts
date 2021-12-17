import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { TldAlertService } from './modules/tld-common/services';

@Injectable()
export class TldTranslateErrorHandler implements ErrorHandler {
  constructor(private alerts: TldAlertService, private zone: NgZone) {
  }

  handleError(error:any) {
    this.zone.run(() => {
      this.alerts.unhandeledError(error);
    });
  }

}
