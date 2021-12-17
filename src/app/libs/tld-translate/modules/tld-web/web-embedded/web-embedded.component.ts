import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'tld-web-embedded',
  templateUrl: './web-embedded.component.html',
  styleUrls: ['./web-embedded.component.scss']
})
export class WebEmbeddedComponent implements OnInit, AfterViewInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.clientId = params.clientId;
      this.appId = params.appId;
      this.filterSystemsByAppId = params.filterSystemsByAppId;
      this.translationServiceUrl = params.translationServiceUrl;
      this.translatePagePath = params.framePath;
      if (params.allowSuggestions) {
        this.allowSuggestions = params.allowSuggestions;
      }
      if (params.hidePopup) {
        this.hidePopup = params.hidePopup;
      }
    });
  }

  clientId: string;
  appId: string;
  filterSystemsByAppId: boolean;
  translationServiceUrl: string;
  translatePagePath: string;  //  path to WebTranslationProxy
  allowSuggestions = false;
  hidePopup = false;

  ngOnInit(): void {
    this.addScript('./assets/webtranslate/default-font-size.js');
    this.addScript('./assets/webtranslate/translate-website.js');
  }

  ngAfterViewInit(): void {
    this.addClientConfigurationScrip();
    this.addServerConfigurationScrip();
    this.addScript('./assets/webtranslate/page-translate-widget.js');
  }

  addScript(url: string): void {
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }


  addClientConfigurationScrip(): void {
    const body = document.body as HTMLDivElement;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = '';
    script.innerHTML = `
    // Client side code for page translation widget.
    // It needs to be configured and put at the end of the page that needs translation.

    if (typeof (Tilde) === 'undefined')
        Tilde = {};

    Tilde.PageTranslateWidgetClientConfiguration = {
      TranslatePagePrefix: location.host + '/${this.translatePagePath}/',

        // Url of the place where CSS for translation widget is kept
        // if you wish to customize the standard letsmt style,
        // point this to your own css file
        cssLocation: './assets/webtranslate/widget.css',

        // client id for authorization
        clientId: "${this.clientId}",

        //api version
        apiVersion: "1",  // 0 - V1; 1 - V2

        // enable or disable original text popup
        hidePopup: ${this.hidePopup},

        // id of the <div> where to draw widget
        widgetContainerId: "PageTranslateWidget",

        // available translation systems (target languages)
        translationSystems: [],

        // source language of the page that needs to be translated
        language: "en",

        // translate widget UI to language that is chosen in target language dropdown
        translateUItoChosenLanguage: false,

        // translate widget administrative part to language that is chosen in target language dropdown
        translateAdminUItoChosenLanguage: false,

        uiLanguage: "${this.translate.currentLang}",

        // if page was translated and you click on a link
        // that goes to another page in the same site,
        // then translate the newly opened page also
        translateAfterNavigation: true,

        // true - language list is shown as links
        // false - language list is shown as dropdown list and "translate" button
        languageListAsLinks: false,

        showHeader: false,

        showTranslationSuggestionAdminPage: false,

        // after translation show a warning that page is machine translated at the top of the page
        showMachineTranslationWarningAfterTranslation: false,

        // show all available translation systems instead of just the ones configured in this file
        showAllTranslationSystems: false,

        // add some pixels to dropdown padding to make it look more similar on different browsers
        browserSpecificDropdownPadding: false,

        // name of icon set: "default", "white", "grey", "red"
        iconSet: "white",

        // Possible values: 1, 2, 3. Text for link "Restore original: Latvian" may be made shorter or longer
        // useful to adapt to small or large screens
        restoreOriginalLinkLength: 2,

        // enable or disable "Suggest translation" link in popup that shows original text of translated sentence
        suggestTranslation: ${this.allowSuggestions},

        // show message box when error happens?
        showMessageBoxOnError: false,

        // application identifier
        appId: "${this.appId}",

        // server will only return systems that are meant for given appId
        filterSystemsByAppId: false,

        // show help link
        enableHelp: false,

        // show feedback link
        enableFeedback: false,

        // allowed system statuses, by default only "running"
        allowedSystemStatuses: "running",

        // passed to translation service for logging.
        // "web-embedded" for widget that is embedded in html page,
        // "web" for widget that can load and translate any website
        widget: "web"
    };
    `;
    body.appendChild(script);
  }


  addServerConfigurationScrip(): void {
    const body = document.body as HTMLDivElement;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = '';
    script.innerHTML = `
    if (typeof Tilde === 'undefined') Tilde = {};

    Tilde.PageTranslateWidgetServerConfiguration = {
      translateServiceUrl: '${this.translationServiceUrl}',
    };
    `;
    body.appendChild(script);
  }

}
