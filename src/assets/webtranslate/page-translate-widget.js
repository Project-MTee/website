﻿pageTranslateWidgetInit();

// init widget in non-global scope to minimizes risk of conflict with global variables
// of the page where widget is inserted
function pageTranslateWidgetInit() {
  if (typeof Tilde === 'undefined' || typeof Tilde.PageTranslateWidgetClientConfiguration === 'undefined') {
    throw { name: 'FatalError', message: 'Missing Tilde.PageTranslateWidgetClientConfiguration' };
  }

  var head = document.getElementsByTagName('head')[0];

  // load jquery
  if (!window.jQuery) {
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = Tilde.PageTranslateWidgetClientConfiguration.jQueryUrl;
    head.appendChild(script);
  }

  // load css
  link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.crossOrigin = 'anonymous';
  link.meadia = 'all';
  link.href = Tilde.PageTranslateWidgetClientConfiguration.cssLocation;
  head.appendChild(link);

  function waitUntilJobDone(test, success, timeout) {
    if (test()) {
      success();
      return;
    }

    // stop trying at some time
    if (timeout) {
      timeout -= 50;
      if (timeout <= 0) {
        return;
      }
    }
    window.setTimeout(function() {
      waitUntilJobDone(test, success, timeout);
    }, 50);
  }

  waitUntilJobDone(
    function() {
      return (
        typeof Tilde.PageTranslateWidgetServerConfiguration !== 'undefined' &&
        typeof jQuery !== 'undefined' &&
        typeof Tilde.PageTranslateWidget !== 'undefined'
      );
    },
    function() {
      if (!jQuery.support.cors && (navigator.userAgent.indexOf('MSIE 8') > -1 || navigator.userAgent.indexOf('MSIE 9') > -1)) {
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = Tilde.PageTranslateWidgetClientConfiguration.letsmtSite + '/Scripts/jquery.xdomainrequest.min.js';
        head.appendChild(script);

        waitUntilJobDone(
          function() {
            return typeof jQuery.xdomainrequest !== 'undefined';
          },
          function() {
            scriptsLoaded();
          },
          15000
        );
      } else {
        scriptsLoaded();
      }
    },
    30000
  );

  function scriptsLoaded() {
    // check jquery version and throw errors if something is wrong
    // those error messages don't have to be pretty,
    // since they are not intended for normal users
    // but for the web developers putting the widget into their page
    var major = 0,
      minor = 0,
      gotVersion = false;
    try {
      var jQueryVersion = jQuery.fn.jquery;
      var firstDot = jQueryVersion.indexOf('.');
      var major = parseInt(jQueryVersion.substring(0, firstDot), 10);
      var secondDot = jQueryVersion.indexOf('.', firstDot + 1);
      var minor = parseInt(jQueryVersion.substring(firstDot + 1, secondDot), 10);
      gotVersion = true;
    } catch (e) {
      throw new Error('Failed to check jQuery version.');
    }

    if (gotVersion && !((major == 1 && minor >= 5) || major > 1)) {
      throw new Error('jQuery version ' + jQueryVersion + ' is not supported by PageTranslateWidget, need to have at least jQuery 1.5.0.');
    }

    if (Tilde.PageTranslateWidgetClientConfiguration.widgetContainerId) {
      jQuery(document).ready(function() {
        Tilde.PageTranslateWidget = new Tilde.PageTranslateWidget(
          Tilde.PageTranslateWidgetClientConfiguration,
          Tilde.PageTranslateWidgetServerConfiguration
        );
        delete Tilde.PageTranslateWidgetClientConfiguration;
        delete Tilde.PageTranslateWidgetServerConfiguration;
      });
    }
  }
}

Tilde.PageTranslateWidget = function(clientConfiguration, serverConfiguration) {
  this.clientConfiguration = clientConfiguration;
  this.serverConfiguration = serverConfiguration;
  this.loading = true;
  var self = this;
  var termCorpusId = null;

  //default values for newly added config params, so that it does not break for config files generated a long time ago
  if (typeof clientConfiguration.enableHelp === 'undefined') {
    clientConfiguration.enableHelp = true;
  }
  if (typeof clientConfiguration.enableFeedback === 'undefined') {
    clientConfiguration.enableFeedback = true;
  }
  if (typeof clientConfiguration.allowedSystemStatuses === 'undefined') {
    clientConfiguration.allowedSystemStatuses = 'running';
  }

  var svgSupported =
    !!document.createElementNS && !!document.createElementNS({ svg: 'http://www.w3.org/2000/svg' }.svg, 'svg').createSVGRect;
  var windowsPhone = navigator.userAgent.indexOf('Windows Phone') > -1;

  var iconSets = {
    default: {
      widgetLoading: '/Content/images/loading_default.gif',
      popupLoading: '/Content/images/loading_default.gif',
      cancel: '/Content/images/delete.png',
      translate: '/Content/images/page-translate-widget/translate.png',
      mail: svgSupported
        ? '/Content/images/page-translate-widget/feedback_black.svg'
        : '/Content/images/page-translate-widget/feedback_black.png',
      help: svgSupported ? '/Content/images/page-translate-widget/help_black.svg' : '/Content/images/page-translate-widget/help_black.png',
      close: '/Content/images/remove.png'
    },
    white: {
      widgetLoading: '/Content/images/loading_white.gif',
      popupLoading: '/Content/images/loading_default.gif',
      cancel: svgSupported ? '/Content/images/cross.svg' : '/Content/images/page-translate-widget/cross.png',
      translate: '/Content/images/page-translate-widget/translate.png',
      mail: svgSupported
        ? '/Content/images/page-translate-widget/feedback_white.svg'
        : '/Content/images/page-translate-widget/feedback_white.png',
      help: svgSupported ? '/Content/images/page-translate-widget/help_white.svg' : '/Content/images/page-translate-widget/help_white.png',
      close: 'assets/webtranslate/remove.png'
    }
  };

  var iconSet = iconSets[clientConfiguration.iconSet];

  // TODO: could move localizations to a javascript file that is generated on serverside from resource files.
  // resx files are easier to maintain (copy paste to excel, give to translators, copy paste back)
  var localizations = {
    en: {
      accept: 'Accept',
      accepted: 'Accepted translation',
      browserNotSupported: 'Sorry, this browser version is not supported.',
      cancel: 'Cancel',
      caption: 'Translate',
      captionTranslated: 'Translated',
      captionTranslatedWithLogo: 'Translated with',
      captionWithLogo: 'Translate with',
      changeTranslation: 'Change the translation',
      close: 'Close',
      delete: 'Delete',
      disclaimer: 'Your translation suggestion will be checked and used to improve translation quality.',
      edit: 'Edit',
      en: 'English',
      feedback: 'Feedback',
      fr: 'French',
      goHome: 'Open machine translation homepage',
      help: 'Help',
      ieIntranet:
        'Internet Explorer uses <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">IE7 compatibility mode</a> for intranet sites.',
      loading: 'Loading',
      login: 'Sign in',
      logout: 'Sign out',
      lt: 'Lithuanian',
      lv: 'Latvian',
      machineTranslation: 'Machine translation',
      machineTranslationNotice: ' Page content is machine translated. (source) > (target) ',
      origin: 'Origin',
      originalText: 'Original',
      reallyDelete: 'Translation will be permanently deleted from the translation memory. Do you really want to delete it?',
      restoreOriginal: 'Restore original',
      restoreOriginalLong: 'Machine translated content, restore original',
      ru: 'Russian',
      save: 'Save',
      suggest: 'Suggest',
      suggestTranslation: 'Suggest a translation',
      suggestTranslationSuccess: 'Translation suggested.',
      suggestion: 'Suggestion',
      translate: 'Translate',
      translation: 'Translation',
      translationSuggestions: 'Translation suggestions',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    ru: {
      accept: 'Подтвердить',
      accepted: 'Подтвержденный перевод',
      browserNotSupported: 'К сожалению, данная версия браузера не поддерживается.',
      cancel: 'Отменить',
      caption: 'Перевести',
      captionTranslated: 'Переведено',
      captionTranslatedWithLogo: 'Переведено с помощью',
      captionWithLogo: 'Перевести с помощью',
      changeTranslation: 'Изменить перевод',
      close: 'Закрыть',
      delete: 'Удалить',
      disclaimer: 'Предложенный вами перевод будет проверен и использован для повышения качества перевода.',
      edit: 'Редактировать',
      en: 'Английский',
      feedback: 'Отзывы',
      fr: 'Французский',
      goHome: 'Открыть главную страницу машинного переводчика',
      help: 'Помощь',
      ieIntranet:
        'Для сайтов внутренней сети Internet Explorer используется <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">режим совместимость IE7.',
      loading: 'Загрузка',
      login: 'Войти в систему',
      logout: 'Выйти',
      lt: 'Литовский',
      lv: 'Латышский',
      machineTranslation: 'Машинный перевод',
      machineTranslationNotice: ' Сделан машинный перевод содержания страницы. (source) > (target) ',
      origin: 'Происхождение',
      originalText: 'Начальный текст',
      reallyDelete: 'Перевод будет удален из памяти перевода. Вы действительно хотите удалить?',
      restoreOriginal: 'Восстановить оригинал',
      restoreOriginalLong: 'Текст автоматически переведен, восстановить в оригинале',
      ru: 'Русский',
      save: 'Сохранить',
      suggest: 'Рекомендовать',
      suggestTranslation: 'Рекомендовать перевод',
      suggestTranslationSuccess: 'Перевод рекомендован.',
      suggestion: 'Рекомендация',
      translate: 'Перевести',
      translation: 'Перевод',
      translationSuggestions: 'Предлагаемые переводы',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    lv: {
      accept: 'Apstiprināt',
      accepted: 'Apstiprināts tulkojums',
      browserNotSupported: 'Diemžēl šī pārlūka versija netiek atbalstīta.',
      cancel: 'Atcelt',
      caption: 'Tulkot',
      captionTranslated: 'Tulkots',
      captionTranslatedWithLogo: 'Tulkots ar',
      captionWithLogo: 'Tulkot ar',
      changeTranslation: 'Mainīt tulkojumu',
      close: 'Aizvērt',
      delete: 'Dzēst',
      disclaimer: 'Jūsu tulkojuma ieteikums tiks pārbaudīts un izmantots tulkošanas kvalitātes uzlabošanai.',
      edit: 'Rediģēt',
      en: 'Angļu',
      feedback: 'Atsauksmes',
      fr: 'Franču',
      goHome: 'Atvērt mašīntulka sākumlapu',
      help: 'Palīdzība',
      ieIntranet:
        'Internet Explorer iekštīkla vietnēm izmanto <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">IE7 savietojamības režīmu</a>.',
      loading: 'Notiek ielāde',
      login: 'Pierakstīties',
      logout: 'Izrakstīties',
      lt: 'Lietuviešu',
      lv: 'Latviešu',
      machineTranslation: 'Mašīntulkojums',
      machineTranslationNotice: ' Lapas saturs ir mašīntulkots. (source) > (target) ',
      origin: 'Izcelsme',
      originalText: 'Sākotnējais teksts',
      reallyDelete: 'Tulkojums tiks izdzēsts no tulkošanas atmiņas. Vai tiešām vēlaties izdzēst?',
      restoreOriginal: 'Atjaunot oriģinālu',
      restoreOriginalLong: 'Mašīntulkots saturs, atjaunot oriģinālu',
      ru: 'Krievu',
      save: 'Saglabāt',
      suggest: 'Ieteikt',
      suggestTranslation: 'Ieteikt tulkojumu',
      suggestTranslationSuccess: 'Tulkojums ieteikts.',
      suggestion: 'Ieteikums',
      translate: 'Tulkot',
      translation: 'Tulkojums',
      translationSuggestions: 'Tulkojumu ieteikumi',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    lt: {
      accept: 'Priimti',
      accepted: 'Priimtas vertimas',
      browserNotSupported: 'Deja, ši naršyklės versija nepalaikoma.',
      cancel: 'Atšaukti',
      caption: 'Versti',
      captionTranslated: 'Išversta',
      captionTranslatedWithLogo: 'Išversta naudojant',
      captionWithLogo: 'Versti naudojant',
      changeTranslation: 'Keisti vertimą',
      close: 'Uždaryti',
      delete: 'Naikinti',
      disclaimer: 'Jūsų vertimo pasiūlymas bus patikrintas ir naudojamas vertimo kokybei gerinti.',
      edit: 'Redaguoti',
      en: 'Anglų',
      feedback: 'Atsiliepimas',
      fr: 'Prancūzų',
      goHome: 'Atidaryti mašininio vertimo pagrindinį puslapį',
      help: 'Žinynas',
      ieIntranet:
        'Naujausios „Internet Explorer“ versijos rodo <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">intraneto svetaines IE7 suderinamumo režimu.</a>',
      loading: 'Įkeliama',
      login: 'Prisijungti',
      logout: 'Atsijungti',
      lt: 'Lietuvių',
      lv: 'Latvių',
      machineTranslation: 'Mašininis vertimas',
      machineTranslationNotice: ' Puslapio turinys išverstas naudojant mašininį vertimą. (šaltinis) > (tikslas) ',
      origin: 'Kilmė',
      originalText: 'Originalas',
      reallyDelete: 'Vertimas bus visam laikui pašalintas iš vertimo atminties. Ar tikrai norite jį pašalinti?',
      restoreOriginal: 'Atkurti originalą',
      restoreOriginalLong: 'Mašininio vertimo rezultatas, atkurti originalą',
      ru: 'Rusų',
      save: 'Įrašyti',
      suggest: 'Siūlyti',
      suggestion: 'Siūlymas',
      suggestTranslation: 'Siūlyti vertimą',
      suggestTranslationSuccess: 'Vertimas pasiūlytas.',
      translate: 'Versti',
      translation: 'Vertimas',
      translationSuggestions: 'Vertimo pasiūlymai',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    fr: {
      browserNotSupported: "Désolé, cette version du navigateur n'est pas supporté.",
      close: 'Fermer',
      disclaimer: 'Your translation suggestion will be checked and used to improve translation quality.',
      en: 'Anglais',
      fr: 'Français',
      ieIntranet:
        'Affichage récent d\'Internet Explorer <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">intranet sites in IE7 compatibility mode (French translator didn\'t care to finish:D).</a>',
      loading: 'Chargement',
      lt: 'Lituanien',
      originalText: 'Original',
      restoreOriginal: 'Restituer original',
      restoreOriginalLong: 'Contenu traduit électroniquement, restituer original',
      suggest: 'Proposer',
      suggestTranslation: 'Proposer une traduction',
      suggestTranslationSuccess: 'Traduction proposée.',
      translate: 'Traduire',
      translation: 'Traduction',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    et: {
      accept: 'Aktsepteeri',
      accepted: 'Aktsepteeritud tõlge',
      browserNotSupported: 'Kahjuks ei toetata seda brauseriversiooni.',
      cancel: 'Tühista',
      caption: 'Tõlgi',
      captionTranslated: 'Tõlgitud',
      captionTranslatedWithLogo: 'Tõlkimiseks on kasutatud',
      captionWithLogo: 'Kasutage tõlkimiseks',
      changeTranslation: 'Muuda tõlget',
      close: 'Sule',
      delete: 'Kustuta',
      disclaimer: 'Teie tõlkesoovitust kontrollitakse ja kasutatakse tõlkekvaliteedi parandamiseks.',
      edit: 'Muuda',
      en: 'Inglise keel',
      feedback: 'Tagasiside',
      fr: 'Prantsuse keel',
      goHome: 'Ava masintõlke koduleht',
      help: 'Abi',
      ieIntranet:
        'Internet Explorer kasutab sisevõrgu saitide puhul <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">IE7 ühilduvusrežiimi</a>.',
      loading: 'Laadimine',
      login: 'Logi sisse',
      logout: 'Logi välja',
      lt: 'Leedu keel',
      lv: 'Läti keel',
      machineTranslation: 'Masintõlge',
      machineTranslationNotice: ' Lehe sisu on masintõlgitud. (lähtetekst) > (sihttekst) ',
      origin: 'Lähtekeel',
      originalText: 'Algtekst',
      reallyDelete: 'Tõlge kustutatakse tõlkemälust jäädavalt. Kas soovite selle kindlasti kustutada?',
      restoreOriginal: 'Taasta algtekst',
      restoreOriginalLong: 'Masintõlgitud sisu, taasta algtekst',
      ru: 'Vene keel',
      save: 'Salvesta',
      suggest: 'Soovita',
      suggestTranslation: 'Soovita tõlget',
      suggestTranslationSuccess: 'Tõlkesoovitus on esitatud.',
      suggestion: 'Soovitus',
      translate: 'Tõlgi',
      translation: 'Tõlge',
      translationSuggestions: 'Tõlkesoovitused',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    fi: {
      accept: 'Hyväksy',
      accepted: 'Hyväksytty käännös',
      browserNotSupported: 'Tätä selaimen versiota ei tueta.',
      cancel: 'Peruuta',
      caption: 'Käännä',
      captionTranslated: 'Käännetty',
      captionTranslatedWithLogo: 'Kääntäjän apuna',
      captionWithLogo: 'Käännösavuksi',
      changeTranslation: 'Muuta käännöstä',
      close: 'Sulje',
      delete: 'Poista',
      disclaimer: 'Käännösehdotus tarkistetaan ja sitä voidaan käyttää käännöksen tason parantamiseen.',
      edit: 'Muokkaa',
      en: 'Englanti',
      feedback: 'Palaute',
      fr: 'Ranska',
      goHome: 'Avaa konekäännöksen kotisivu',
      help: 'Ohje',
      ieIntranet:
        'Internet Exploter käyttää <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">IE7-yhteensopivuustilaa</a> kaikille intranetsivustoille.',
      loading: 'Ladataan',
      login: 'Kirjaudu',
      logout: 'Kirjaudu ulos',
      lt: 'Liettua',
      lv: 'Latvia',
      machineTranslation: 'Konekäännös',
      machineTranslationNotice: ' Sivun sisältö on käännetty koneellisesti. (lähde) > (kohde) ',
      origin: 'Alkuperä',
      originalText: 'Alkuperäinen',
      reallyDelete: 'Käännös poistetaan käännösmuistista pysyvästi. Haluatko varmasti poistaa sen?',
      restoreOriginal: 'Palauta alkuperäinen',
      restoreOriginalLong: 'Konekäännetty sisältö. Palauta alkuperäinen',
      ru: 'Venäjä',
      save: 'Tallenna',
      suggest: 'Ehdota',
      suggestTranslation: 'Ehdota käännöstä',
      suggestTranslationSuccess: 'Käännöstä on ehdotettu.',
      suggestion: 'Ehdotus',
      translate: 'Käännä',
      translation: 'Käännös',
      translationSuggestions: 'Käännösehdotukset',
      unknownError: 'Unfortunately translation service failed. Please try again later.'
    },
    sv: {
      close: 'Stäng',
      originalText: 'Original'
    },
    ro: {
      accept: 'Accept',
      accepted: 'Traducere acceptată',
      browserNotSupported: 'Ne cerem scuze, dar această versiune a browserului dumneavoastră nu este acceptată.',
      cancel: 'Anulează',
      caption: 'Tradu',
      captionTranslated: 'Tradus',
      captionTranslatedWithLogo: 'Tradus cu',
      captionWithLogo: 'Tradu cu',
      changeTranslation: 'Schimbă traducerea',
      close: 'Închide',
      delete: 'Șterge',
      disclaimer: 'Sugestia dumneavoastră de traducere va fi verificată și folosită pentru îmbunătățirea calității traducerii.',
      edit: 'Editează',
      en: 'Engleză',
      feedback: 'Feedback',
      fr: 'Franceză',
      goHome: 'Deschide pagina inițială a traducerii automate',
      help: 'Ajutor',
      ieIntranet:
        'Internet Explorer folosește <a href="http://blogs.msdn.com/b/ie/archive/2009/06/17/compatibility-view-and-smart-defaults.aspx">IE7 compatibility mode</a> pentru site-uri intranet.',
      loading: 'Se încarcă',
      login: 'Intră în cont',
      logout: 'Ieși din cont',
      lt: 'Lituaniană',
      lv: 'Letonă',
      machineTranslation: 'Traducere automată',
      machineTranslationNotice: ' Conținutul paginii este tradus automat. (sursă) > (țintă) ',
      origin: 'Origine',
      originalText: 'Original',
      reallyDelete: 'Traducerea va fi ștearsă definitiv din memoria de traducere. Sunteți sigur că doriți să o ștergeți?',
      restoreOriginal: 'Restaurează originalul',
      restoreOriginalLong: 'Conținut tradus automat, restaurează originalul',
      ru: 'Rusă',
      save: 'Salvează',
      suggest: 'Sugerează',
      suggestTranslation: 'Sugerează o traducere',
      suggestTranslationSuccess: 'Traducere sugerată.',
      suggestion: 'Sugestie',
      translate: 'Tradu',
      translation: 'Traducere',
      translationSuggestions: 'Sugestii de traducere',
      unknownError: 'Din păcate, serviciul de traducere a eșuat. Vă rugăm să încercați mai târziu.'
    }
  };

  for (var language in localizations) {
    localizations[language].captionWithLogo =
      '<span>' +
      localizations[language].captionWithLogo +
      '</span><a target="blank" class="letsmt-logo" href="' +
      clientConfiguration.letsmtSite +
      '/"><img alt="' +
      localizations[language].goHome +
      '" title="' +
      localizations[language].goHome +
      '" src="' +
      clientConfiguration.letsmtSite +
      serverConfiguration.logo +
      '" /></a>';

    localizations[language].captionTranslatedWithLogo =
      '<span>' +
      localizations[language].captionTranslatedWithLogo +
      '</span><a target="blank" class="letsmt-logo" href="' +
      clientConfiguration.letsmtSite +
      '/"><img alt="' +
      localizations[language].goHome +
      '" title="' +
      localizations[language].goHome +
      '" src="' +
      clientConfiguration.letsmtSite +
      serverConfiguration.logo +
      '" /></a>';
  }

  // default language for UI
  var currentSourceLanguage = clientConfiguration.language;

  var findLocalization = function(language) {
    return localizations[language] || localizations['en'];
  };

  // set to configured localization, if it can be found
  var initLocalization = function(language) {
    var translations = findLocalization(language);

    localization = translations;
    adminLocalization = translations;
  };

  if (clientConfiguration.uiLanguage) {
    initLocalization(clientConfiguration.uiLanguage);
  } else {
    initLocalization(clientConfiguration.language);
  }

  // draw widget, bind controls
  var widgetContainer = jQuery('#' + this.clientConfiguration.widgetContainerId);
  widgetContainer.addClass('letsmt-widget-container');

  if (clientConfiguration.showHeader) {
    if (clientConfiguration.enableFeedback) {
      var feedbackButton = jQuery('<a/>', {
        href: clientConfiguration.letsmtSite + '/Feedback',
        class: 'letsmt-icon',
        id: 'letsmt-feedback',
        target: 'top'
      });
      feedbackButton.append(
        jQuery('<img/>', {
          src: clientConfiguration.letsmtSite + iconSet.mail,
          alt: localization.feedback,
          title: localization.feedback
        })
      );
      widgetContainer.append(feedbackButton);
    }

    if (clientConfiguration.enableHelp) {
      var helpButton = jQuery('<a/>', {
        href: clientConfiguration.letsmtSite + '/Help',
        class: 'letsmt-icon',
        id: 'letsmt-help',
        target: 'top'
      });
      helpButton.append(
        jQuery('<img/>', {
          src: clientConfiguration.letsmtSite + iconSet.help,
          alt: localization.help,
          title: localization.help
        })
      );
      widgetContainer.append(helpButton);
    }

    var caption = jQuery('<div/>', {
      id: 'letsmt-caption',
      html: serverConfiguration.showWidgetLogo ? localization.captionWithLogo : localization.caption
    });
    widgetContainer.append(caption);
  }

  var widgetContent = jQuery('<div/>', { id: 'letsmt-widget-content' });
  widgetContainer.append(widgetContent);

  // check browser compatibility
  if (typeof JSON === 'undefined' || !jQuery.support.cors) {
    widgetContent.append(localization.browserNotSupported);

    // check if we are using Internet Explorer in intranet
    if (navigator.userAgent.indexOf('MSIE') > 0 && location.hostname.indexOf('.') == -1 && location.host.indexOf('localhost') == -1) {
      widgetContent.append('<br />' + localization.ieIntranet);
    }
    return;
  }

  // check JSON.stringify compatibility
  if (JSON.stringify([1]) != '[1]') {
    if (typeof console !== 'undefined') {
      console.warn('JSON.stringify serializes arrays as strings. Trying a workaround, but things may break.');
    }
    if (Array.prototype.toJSON !== 'undefined') {
      delete Array.prototype.toJSON;
    }
  }

  var selectedTranslationSystemId = null;
  var selectedTranslationSystem = null;

  var localize = function() {
    for (var i = 0; i < clientConfiguration.translationSystems.length; i++) {
      if (clientConfiguration.translationSystems[i].id == selectedTranslationSystemId) {
        selectedTranslationSystem = clientConfiguration.translationSystems[i];
        if (selectedTranslationSystem.sourceLanguage) {
          currentSourceLanguage = selectedTranslationSystem.sourceLanguage;
        }
      }
    }
    if (selectedTranslationSystem && selectedTranslationSystem.targetLanguage) {
      if (clientConfiguration.translateUItoChosenLanguage) {
        localization = findLocalization(selectedTranslationSystem.targetLanguage);
        var translateImage = jQuery('#letsmt-translate img');
        translateImage.attr('alt', localization.translate);
        translateImage.attr('title', localization.translate);

        if (clientConfiguration.enableFeedback) {
          var feedbackImage = jQuery('#letsmt-feedback img');
          feedbackImage.attr('alt', localization.feedback);
          feedbackImage.attr('title', localization.feedback);
        }

        if (clientConfiguration.enableHelp) {
          var helpImage = jQuery('#letsmt-help img');
          helpImage.attr('alt', localization.help);
          helpImage.attr('title', localization.help);
        }

        if (clientConfiguration.showHeader) {
          caption.html(serverConfiguration.showWidgetLogo ? localization.captionWithLogo : localization.caption);
        }

        jQuery('#letsmt-show-login').text(localization.login);
        jQuery('#letsmt-logout').text(localization.logout);
      }
      if (clientConfiguration.translateAdminUItoChosenLanguage) {
        adminLocalization = findLocalization(selectedTranslationSystem.targetLanguage);
      }
    }
  };

  var chooseLanguageDiv = jQuery('<div/>', { class: 'letsmt-choose-language' });
  widgetContent.append(chooseLanguageDiv);

  // could use jQuery cookie plugin instead, but that would make library loading more complicated
  var readCookie = function(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  var deleteCookie = function(name) {
    // delete both from "/" and from current path
    // to deal with old cookies that were set without path
    document.cookie = name + '=;expires=' + new Date().toUTCString();
    document.cookie = name + '=;path=/;expires=' + new Date().toUTCString();
  };

  var setCookie = function(name, value) {
    document.cookie = name + '=' + (value == null ? '' : value) + ';path=/';
  };

  var restoreButton = jQuery('<a/>', {
    text: localization.restoreOriginal + ': ' + localization[currentSourceLanguage],
    href: 'javascript:;',
    style: 'display:none',
    id: 'letsmt-restore',
    click: function() {
      self.restore();
    }
  });
  widgetContent.append(restoreButton);

  widgetContent.append(jQuery('<div/>', { style: 'clear:both' }));
  var progressContainer = jQuery('<div/>', { id: 'letsmt-progress', style: 'display:none' });
  widgetContent.append(progressContainer);

  var cancelButton = jQuery('<a/>', {
    id: 'letsmt-translate-cancel',
    href: 'javascript:;',
    click: function() {
      self.cancel();
    }
  });
  cancelButton.append(
    ///// jQuery('<img/>', { src: clientConfiguration.letsmtSite + iconSet.cancel, alt: localization.cancel, title: localization.cancel })
  );
  progressContainer.append(cancelButton);

  var translateProgress = jQuery('<span/>', { id: 'letsmt-translate-progress' });
  progressContainer.append(translateProgress);

  var progressBarOuter = jQuery('<div/>', { id: 'letsmt-progress-bar-outer' });
  var progressBarInner = jQuery('<div/>', { id: 'letsmt-progress-bar-inner' });
  progressBarOuter.append(progressBarInner);
  progressContainer.append(progressBarOuter);

  var showProgress = function() {
    progressContainer.show();
    translateProgress.text('');
    if (typeof self.onProgress !== 'undefined') {
      self.onProgress(0);
    }
  };

  var hideProgress = function() {
    progressContainer.hide();
    if (typeof self.onTranslationStop !== 'undefined') {
      self.onTranslationStop();
    }
  };

  var getAppId = function() {
    return clientConfiguration.appId;
  };

  var letsmt_getClient = function(options) {
    var serializeDataForGet = function(data) {
      var serializedData = '';
      for (var key in data) {
        if (serializedData != '') {
          serializedData += '&';
        }
        var encodedData = null;
        if (jQuery.isArray(data[key])) {
          encodedData = encodeURIComponent(JSON.stringify(data[key]));
        } else {
          encodedData = encodeURIComponent(data[key]);
        }
        serializedData += key + '=' + encodedData;
      }
      return serializedData;
    };

    var serializeDataForPost = function(data) {
      return JSON.stringify(data);
    };

    var ajaxCall = function(userSettings, methodSettings) {
      var defaultSettings = {
        method: 'GET',
        success: function() {},
        error: function() {},
        username: null,
        password: null,
        url: '',
        data: {},
        async: true,
        clientId: null,
        // caching is disabled by default,
        // it could be enabled for those ws methods where it is safe,
        // but i don't know of such methods
        cache: false,
        dataType: 'json'
      };
      var settings = {};
      for (var key in defaultSettings) {
        if (methodSettings && typeof methodSettings[key] != 'undefined') {
          settings[key] = methodSettings[key];
        } else if (userSettings && typeof userSettings[key] != 'undefined') {
          settings[key] = userSettings[key];
        } else {
          settings[key] = defaultSettings[key];
        }
      }

      var authorizationHeaders = {};
      if (readCookie('jwt')) {
        authorizationHeaders['Authorization'] = 'Bearer ' + readCookie('jwt');
      } else if (settings.clientId) {
        authorizationHeaders['client-id'] = settings.clientId;
      }

      return jQuery.ajax({
        type: settings.method,
        url: settings.url,
        dataType: settings.dataType,
        async: settings.async,
        data: settings.method == 'GET' ? serializeDataForGet(settings.data) : serializeDataForPost(settings.data),
        contentType: 'application/json',
        xhrFields: { withCredentials: true }, // allows crossdomain cookies (if browser supports)
        headers: authorizationHeaders,
        success: settings.success,
        error: settings.error,
        cache: settings.cache
      });
    };

    return {
      serviceCall: function(url, data, success, error, methodSettings) {
        // logout when auth cookies are expired
        // (hmm, old functionality, we are not expiring them in clientside anymore
        // but waiting when ticket expires in serverside)
        //if (authorized && !(readCookie("letsmt-ws-ticket"))) {
        //logout();
        //}
        return ajaxCall(
          {
            success: success,
            error: error,
            data: data,
            url: options.baseUrl + url,
            username: options.username,
            password: options.password,
            clientId: options.clientId
          },
          methodSettings
        );
      },

      serviceCallV2: function(url, textArray, success, error) {
        return jQuery.ajax({
          type: 'POST',
          url: url,
          dataType: 'json',
          async: true,
          data: serializeDataForPost({
            "srcLang": selectedTranslationSystem.sourceLanguage,
            "trgLang": selectedTranslationSystem.targetLanguage,
            "domain": selectedTranslationSystem.domain,
            "text": textArray,
            "textType": 2
          }),
          contentType: 'application/json',
          success: success,
          error: error,
          cache: false
        });
      }
    };
  };

  var letsMTApi;
  var LetsMTApi = function(client) {
    return {
      requests: [],
      aborting: false,
      abort: function() {
        this.aborting = true;
        for (var i = 0; i < this.requests.length; i++) {
          this.requests[i].abort();
        }
        this.requests = [];
        this.aborting = false;
      },

      /**
       * @params data {appID, uiLanguageID}
       * @params success, error callbacks
       */
      getSystemList: function(data, success, error) {
        client.serviceCall(
          '/GetSystemList',
          data,
          function(response) {
            success(response);
          },
          error
        );
      },
      /**
       * @params data {appID, language, text, options}
       * @params success, error callbacks
       */
      breakSentences: function(data, success, error) {
        client.serviceCall('/BreakSentences', data, success, error);
      },
      /**
       * @params data {appID, systemID, text, options}
       * @params success, error callbacks
       */
      translate: function(data, success, error) {
        client.serviceCall(
          '/Translate',
          data,
          function(response) {
            success(response);
          },
          error,
          { method: 'POST' }
        );
      },
      /**
       * @params data {appID, systemID, textArray, options}
       * @params success, error callbacks
       */
      translateArray: function(data, associatedData, success, error) {
        client.serviceCall(
          '/TranslateArray',
          data,
          function(response) {
            success(response, associatedData);
          },
          error,
          { method: 'POST' }
        );
      },
      /**
       * @params data {appID, systemID, textArray, options}
       * @params success, error callbacks
       */
      translateArrayEx: function(data, associatedData, success, error) {
        var self = this;
        var translateRequest = client.serviceCall(
          'TranslateArrayEx',
          data,
          function(response, status, request) {
            self.requests = jQuery.grep(self.requests, function() {
              return request != translateRequest;
            });
            success(response, associatedData);
          },
          function(request, status, errorMessage) {
            if (!self.aborting) {
              self.requests = jQuery.grep(self.requests, function(value) {
                return value != translateRequest;
              });
              error(request, status, errorMessage);
            }
          },
          { method: 'POST' }
        );
        self.requests.push(translateRequest);
      },

      translateV2: function(data, associatedData, success, error) {
        var self = this;
        var translateRequest = client.serviceCallV2(
          serverConfiguration.translateServiceUrl,
          data,
          function(response, status, request) {
            self.requests = jQuery.grep(self.requests, function() {
              return request != translateRequest;
            });
            success(response, associatedData);
          },
          function(request, status, errorMessage) {
            if (!self.aborting) {
              self.requests = jQuery.grep(self.requests, function(value) {
                return value != translateRequest;
              });
              error(request, status, errorMessage);
            }
          }
        );
        self.requests.push(translateRequest);
      },
      /**
       * @params data { ticket }
       * @params success, error callbacks
       */
      getUserInfo: function(data, success, error) {
        client.serviceCall(
          '/GetUserInfo',
          data,
          function(response) {
            success(response);
          },
          error
        );
      },
      /**
       * @params data {appID, systemID, text, translation, options
       * @params success, error callbacks
       */
      updateTranslation: function(data, success, error) {
        client.serviceCall(
          '/UpdateTranslation',
          data,
          function() {
            success();
          },
          error,
          { method: 'POST', dataType: 'text' }
        );
      },
      /**
       * @params data {appID, systemID, text, options
       * @params success, error callbacks
       */
      getTranslations: function(data, success, error) {
        client.serviceCall(
          '/GetTranslations',
          data,
          function(response) {
            success(response);
          },
          error
        );
      },
      /**
       * @params data {appID, id, options
       * @params success, error callbacks
       */
      removeTranslation: function(data, success, error) {
        client.serviceCall(
          '/RemoveTranslation',
          data,
          function() {
            success();
          },
          error,
          { method: 'POST', dataType: 'text' }
        );
      }
    };
  };

  // init LetsMT api
  letsMTApi = LetsMTApi(
    letsmt_getClient({
      baseUrl: serverConfiguration.translateServiceUrl,
      clientId: clientConfiguration.clientId,
      username: clientConfiguration.username,
      password: clientConfiguration.password
    })
  );

  var inlineElements = {
    A: null,
    ABBR: null,
    ACRONYM: null,
    EM: null,
    STRONG: null,
    B: null,
    I: null,
    S: null,
    STRIKE: null,
    U: null,
    SPAN: null,
    DEL: null,
    INS: null,
    SUB: null,
    SUP: null,
    CODE: null,
    SAMP: null,
    KBD: null,
    VAR: null,
    SMALL: null,
    MARK: null,
    RUBY: null,
    RT: null,
    RP: null,
    BDI: null,
    BDO: null
  };

  var skipElements = {
    APPLET: null,
    AREA: null,
    BASE: null,
    FRAME: null,
    FRAMESET: null,
    HR: null,
    IFRAME: null,
    IMG: null,
    INPUT: null,
    LINK: null,
    META: null,
    MAP: null,
    OBJECT: null,
    PARAM: null,
    SCRIPT: null,
    STYLE: null,
    TEXTAREA: null,
    EMBED: null,
    VIDEO: null,
    AUDIO: null,
    SOURCE: null,
    TRACK: null,
    CANVAS: null,
    SVG: null,
    MATH: null
  };

  var translatableFragments = [];

  var addTranslatableFragment = function(elements) {
    if (elements) {
      // remove whitespace from the end
      while (elements.length > 0 && !jQuery.trim(jQuery(elements[elements.length - 1]).text())) {
        elements.pop();
      }

      if (elements.length == 1) {
        if (elements[0].nodeType in { 3: null, 4: null }) {
          // pick container of a single textNode
          if (elements[0].parentNode.childNodes.length == 1) {
            translatableFragments.push([elements[0].parentNode]);
          } else {
            translatableFragments.push(elements);
          }
        } else {
          // pick last only child ( <p><b><i>test</i></b></p> -> <i>test</i> )
          var element = elements[0];
          while (element.childNodes.length == 1 && !(element.childNodes[0].nodeType in { 3: null, 4: null })) {
            element = element.childNodes[0];
          }
          translatableFragments.push([element]);
        }
      } else if (elements.length > 1) {
        translatableFragments.push(elements);
      }
    }
  };

  // returns either null or a reference to element that should be translated
  // fills translatableFragments
  var findTranslatableFragments = function(element) {
    if (element.hasAttribute && element.hasAttribute('translate') && element.getAttribute('translate') == 'no') {
      return null;
    }
    var jQueryElement = jQuery(element);
    if (jQueryElement.hasClass('do-not-translate') || jQueryElement.hasClass('notranslate')) {
      return null;
    }
    if (element.nodeName == 'IFRAME') {
      var contentDocument = null;
      try {
        contentDocument = element.contentDocument;
      } catch (ex) {
        if (typeof console !== 'undefined') {
          console.error(ex);
        }
        return null;
      }

      if (contentDocument && contentDocument.body) {
        findTranslatableFragments(contentDocument.body);

        // inject css for background color change when hovering over translated element
        // if original-text popup is hidden dont change text background color
        if (!element.contentWindow.letsmtCssInjected && !clientConfiguration.hidePopup) {
          // first find the style
          for (var sheet = document.styleSheets.length - 1; sheet >= 0; sheet--) {
            var rules = null;
            try {
              rules = document.styleSheets[sheet].cssRules;
            } catch (ex) {
              if (typeof console !== 'undefined') {
                console.error(ex);
              }
            }

            styles = '';
            if (rules) {
              for (var rule = 0; rule < rules.length; rule++) {
                if (rules[rule] && rules[rule].selectorText && rules[rule].selectorText.indexOf('.letsmt-translation:hover') > -1) {
                  styles += rules[rule].cssText + '\n';
                }
              }
            } else {
              // IE8 compatibility
              try {
                if (document.styleSheets[sheet].cssText.indexOf('.letsmt-translation:hover') > -1) {
                  styles = document.styleSheets[sheet].cssText;
                }
              } catch (ex) {
                if (typeof console !== 'undefined') {
                  console.error(ex);
                }
              }
            }

            if (styles.length > 0) {
              // inject the style into iframe
              var head = jQuery(contentDocument).find('head');
              if (head.length == 0) {
                head = jQuery('<head/>');
                jQuery(contentDocument).append(head);
              }
              var styleElement = jQuery('<style/>', { type: 'text/css' });
              head.append(styleElement);
              if (styleElement[0].styleSheet) {
                // IE8 compatibility
                styleElement[0].styleSheet.cssText = styles;
              } else {
                styleElement.text(styles);
              }

              element.contentWindow.letsmtCssInjected = true;
              //don't look into other stylesheets once needed styles are found
              break;
            }
          }
        }
      }
      return null;
    }
    if (element.attributes && element.attributes.length > 0) {
      if (element.hasAttribute('title')) {
        translatableFragments.push([element.attributes.getNamedItem('title')]);
      }
      if (element.hasAttribute('alt')) {
        translatableFragments.push([element.attributes.getNamedItem('alt')]);
      }
      if (element.nodeName == 'INPUT' && (element.getAttribute('type') == 'submit' || element.getAttribute('type') == 'button')) {
        if (element.hasAttribute('value')) {
          translatableFragments.push([element.attributes.getNamedItem('value')]);
        }
      }
    }
    if (element.nodeName in skipElements) {
      return null;
    }
    if (element.nodeType in { 3: null, 4: null }) {
      // text || cdata
      return element;
    }
    if (element.nodeType != 1) {
      // not element node
      return null;
    }
    if (jQueryElement.attr('id') == self.clientConfiguration.widgetContainerId) {
      return null;
    }
    if (element.childNodes.length == 0) {
      return element.nodeName in inlineElements ? element : null;
    }
    var goodChildren = [];
    for (var i = 0; i < element.childNodes.length; ++i) {
      var result = findTranslatableFragments(element.childNodes[i]);
      if (result) {
        // translatable element
        // first element must not be whitespace
        if (!goodChildren.length == 0 || jQuery.trim(jQuery(result).text())) {
          goodChildren.push(result);
        }
      } else {
        addTranslatableFragment(goodChildren);
        goodChildren = [];
      }
    }
    if (element.nodeName in inlineElements && goodChildren.length == element.childNodes.length) {
      // the whole element can be translated
      return element;
    }
    // else there are non-inline subelements
    addTranslatableFragment(goodChildren);
    return null;
  };

  var translating = false;
  var translated = false;

  this.translate = function(translationSystemId, termCorpusId) {
    if (!translating) {
      translating = true;
      if (typeof self.onTranslationStart !== 'undefined') {
        self.onTranslationStart();
      }

      self.termCorpusId = termCorpusId;

      if (translationSystemId) {
        selectedTranslationSystemId = translationSystemId;
        localize();
      }
      if (!clientConfiguration.languageListAsLinks) {
        jQuery('#letsmt-translation-system').attr('disabled', 'disabled');
      }

      self.restore(false, true); // there could be some leftovers if there was an error during translation

      if (clientConfiguration.translateAfterNavigation) {
        // remember translation language so that it can be reused after navigation to different page
        setCookie('letsmt-translation-system', selectedTranslationSystemId);
        setCookie('letsmt-term-corpus', termCorpusId);
      }

      chooseLanguageDiv.hide();
      showProgress();
      translatableFragments = [];
      findTranslatableFragments(document.body);
      translateFragments(translatableFragments);
    }
  };

  this.cancel = function(rememberPreviousTranslationSystem, suppressRestoreFinishedEvent) {
    if (translating) {
      translating = false;
      letsMTApi.abort();
      hideProgress();
      if (!clientConfiguration.languageListAsLinks) {
        jQuery('#letsmt-translation-system').removeAttr('disabled');
      }
    }

    if (originalTextPopup) {
      jQuery(originalTextPopup).remove();
    }
    if (updateTranslationPopupVisible) {
      hideUpdateTranslationPopup();
    }

    this.restore(rememberPreviousTranslationSystem, suppressRestoreFinishedEvent);
  };

  this.restore = function(rememberPreviousTranslationSystem, suppressRestoreFinishedEvent) {
    if (updateTranslationPopupVisible) return;

    restoreButton.hide();
    if (clientConfiguration.showMachineTranslationWarningAfterTranslation) {
      jQuery('#letsmt-top-strip').remove();
      jQuery('#letsmt-top-spacer').remove();
    }

    recursiveRestore(document);

    chooseLanguageDiv.show();

    if (clientConfiguration.showHeader) {
      caption.html(serverConfiguration.showWidgetLogo ? localization.captionWithLogo : localization.caption);
    }
    if (!rememberPreviousTranslationSystem && clientConfiguration.translateAfterNavigation) {
      deleteCookie('letsmt-translation-system');
      deleteCookie('letsmt-term-corpus');
    }

    if (typeof self.onRestoreFinished !== 'undefined' && !suppressRestoreFinishedEvent) {
      //&& !translated) {
      self.onRestoreFinished();
    }
    translated = false;
  };

  var recursiveRestore = function(currentDocument) {
    // restore attribute values
    var attrsToRemove = [];
    jQuery(currentDocument)
      .find('*')
      .each(function(index, element) {
        for (var i = 0; i < element.attributes.length; i++) {
          var attr = element.attributes.item(i);
          if (attr.name.indexOf('data-original-') == 0) {
            var attrName = attr.name.substring(14);
            attr.ownerElement.setAttribute(attrName, attr.value);
            attrsToRemove.push(attr);
          }
        }
        var jQueryElement = jQuery(element);
      });

    for (i = 0; i < attrsToRemove.length; i++) {
      attrsToRemove[i].ownerElement.removeAttribute(attrsToRemove[i].name);
    }

    //restore text between tags
    jQuery(currentDocument)
      .find('.letsmt-translation')
      .each(function(index, element) {
        var jQueryElement = jQuery(element);
        replaceHtml(element, jQueryElement.data('original'), nodeListToArray(element.childNodes));
        jQuery.removeData(jQueryElement, 'original');
        jQuery.removeData(jQueryElement, 'translation');
        jQueryElement.find('[data-letsmt-tag]').each(function(index, element) {
          jQuery(element).removeAttr('data-letsmt-tag');
        });

        jQueryElement.removeClass('letsmt-translation');
        if (element.hasAttribute('data-old-dir')) {
          if (jQueryElement.attr('data-old-dir')) {
            jQueryElement.attr('dir', jQueryElement.attr('data-old-dir'));
          } else {
            jQueryElement.removeAttr('dir');
          }
          jQueryElement.removeAttr('data-old-dir');
        }
        if (jQueryElement.attr('class') === '') {
          jQueryElement.removeAttr('class');
        }
        jQueryElement.unbind('mouseenter.letsmt-translation mouseleave.letsmt-translation');

        if (jQueryElement.data('isNewTag')) {
          // remove sentence span tag, so that tags are not duplicated when translating the same page multiple times
          jQueryElement.contents().insertBefore(jQueryElement);
          jQueryElement.remove();
        }
      });

    jQuery(currentDocument)
      .find('iframe')
      .each(function(index, element) {
        try {
          recursiveRestore(element.contentDocument);
        } catch (ex) {
          if (typeof console !== 'undefined') {
            console.error(ex);
          }
        }
      });
  };

  var generateGuid = function() {
    // got it off the internets, not really sure about randomness and collisions
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  var redirectToLoginPage = function() {
    var ticket = generateGuid();
    setCookie('letsmt-ws-ticket', ticket); // remember the ticket until we come back from login to this page
    setCookie('letsmt-redirected-to-login-page', 'true');
    window.location =
      serverConfiguration.loginUrl +
      '?clientId=' +
      encodeURIComponent(clientConfiguration.clientId) +
      '&ticket=' +
      encodeURIComponent(ticket) +
      '&returnUrl=' +
      encodeURIComponent(window.location);
  };

  var logout = function(logoutFromWebsiteAlso) {
    if (updateTranslationPopupVisible && clickedInUI) return;

    // clear current auth cookies
    deleteCookie('letsmt-ws-username');
    deleteCookie('letsmt-ws-ticket');

    /*jQuery("#letsmt-show-login").show();
        jQuery("#letsmt-authorized-user").hide();
        jQuery("#letsmt-logout").hide();
        authorized = false;*/

    // log out from translation website, so that it does not automatically log in
    // the next time when trying to log in from widget
    if (logoutFromWebsiteAlso) {
      window.location =
        serverConfiguration.logoutUrl +
        '?returnUrl=' +
        encodeURIComponent(window.location) +
        '&clientId=' +
        encodeURIComponent(clientConfiguration.clientId);
    }
  };

  var ajaxErrorHandler = function(xhr, status, error) {
    if (xhr.readyState == 0) {
      // this should happen when connection is broken because user navigates to another page
      // I really hope this does not swallow legitimate errors
      return;
    }

    var logoutAfterErrorMessage = false;

    if (
      xhr.status == 401 || // access denied
      xhr.status == 506 // error in XDomainRequest - real status cannot be known, but log off just in case this really was session timeout errror
    ) {
      if (updateTranslationPopupVisible) {
        hideUpdateTranslationPopup();
      }
      logoutAfterErrorMessage = true;
    }

    var errorMessage = null;
    if (error) {
      if (xhr.responseText) {
        try {
          var errorDetails = JSON.parse(xhr.responseText);
          if (errorDetails.ErrorMessage) {
            errorMessage = errorDetails.ErrorMessage;
          } else {
            errorMessage = errorDetails;
          }
        } catch (err) {
          // error message will be extracted in different way further along
        }
      }
      if (!errorMessage) {
        if (error.message) {
          errorMessage = error.message;
        } else {
          if (error == 'error') {
            errorMessage = localization.unknownError;
          } else {
            errorMessage = error;
          }
        }
      }
    } else {
      errorMessage = localization.unknownError;
    }

    hideProgress();
    translated = false;
    chooseLanguageDiv.show();

    if (!clientConfiguration.languageListAsLinks) {
      jQuery('#letsmt-translation-system').removeAttr('disabled');
    }

    if (translating && errorMessage == 'Session expired, log in again') {
      // restart translation without being logged in
      translating = false;
      logout();
      translate();
    } else {
      translating = false;
      deleteCookie('letsmt-translation-system');
      deleteCookie('letsmt-term-corpus');

      if (clientConfiguration.showMessageBoxOnError) {
        alert(errorMessage);
      }

      if (typeof self.onError !== 'undefined') {
        self.onError(errorMessage);
      }

      if (typeof console !== 'undefined') {
        console.error(errorMessage);
      }

      if (logoutAfterErrorMessage) {
        logout(true);
      }
    }
  };

  var authorized = readCookie('letsmt-ws-username') && readCookie('letsmt-ws-ticket') ? true : false;

  if (readCookie('letsmt-redirected-to-login-page')) {
    var ticket = readCookie('letsmt-ws-ticket');
    if (ticket) {
      // we came here from login page - let's see which user logged in
      letsMTApi.getUserInfo(
        { appID: getAppId() },
        function(userData) {
          // success
          var userDisplayName = userData.name;
          setCookie('letsmt-ws-username', userDisplayName);
          authorized = true;
          setCookie('letsmt-ws-ticket', ticket);
          jQuery('#letsmt-show-login').hide();
          jQuery('#letsmt-authorized-user')
            .text(userDisplayName)
            .show();
          jQuery('#letsmt-logout').show();
          self.autoTranslateIfNeeded();
        },
        ajaxErrorHandler
      );
    }
  }

  var probablyContainsTags = function(text) {
    // not really very good tag detector:)
    return text.indexOf('<') > -1;
  };

  var originalTextPopup = null;
  var selectedTranslation = null;
  var updateTranslationPopupVisible = false;

  var showUpdateTranslationPopup = function(translationSpan) {
    var original = translationSpan.data('original');
    var originalWithoutTags = jQuery.trim(removeTags(original));
    var translation = translationSpan.data('translation');
    updateTranslationPopupVisible = true;
    removeOriginalTextPopup();

    var popup = jQuery('<div/>', { id: 'letsmt-update-translation-popup' });
    popup.append(jQuery('<label/>', { text: authorized ? adminLocalization.originalText : localization.originalText }));
    popup.append(jQuery('<div/>', { id: 'letsmt-update-translation-original', text: originalWithoutTags }));
    var buttonRow = jQuery('<div/>', { class: 'letsmt-popup-button-row' });

    var activeTranslation = { changed: false, translation: null };

    var closeButton = jQuery('<a/>', {
      text: authorized ? adminLocalization.close : localization.close,
      href: 'javascript:;',
      click: function() {
        if (activeTranslation.changed) {
          if (!probablyContainsTags(original)) {
            // replace text with proposed translation only if there were no tags to break
            replaceHtml(translationSpan[0], activeTranslation.translation, nodeListToArray(translationSpan[0].childNodes));
            translationSpan.data('translation', activeTranslation.translation);
          }
        }
        hideUpdateTranslationPopup();
      }
    });
    buttonRow.append(closeButton);
    popup.append(buttonRow);
    jQuery(document.body).append(popup);

    jQuery(document).bind('keypress.closePopupWindow', function(event) {
      if (event.keyCode == 27) {
        // ESC key
        closeButton.trigger('click');
      }
    });

    if (authorized) {
      jQuery('<label/>', { text: adminLocalization.translation }).insertBefore(buttonRow);
      refreshTranslationList(originalWithoutTags, translation, popup, activeTranslation);
    } else {
      jQuery('<label/>', { for: 'letsmt-update-translation-translation', text: localization.translation }).insertBefore(buttonRow);
      var trimmedText = jQuery.trim(removeTags(translation));
      var translationTextarea = jQuery('<textarea/>', {
        id: 'letsmt-update-translation-translation',
        text: trimmedText,
        spellcheck: 'true',
        lang: selectedTranslationSystem.targetLanguage,
        maxlength: 5000
      });
      translationTextarea.insertBefore(buttonRow);
      jQuery('<div>', { text: localization.disclaimer }).insertBefore(buttonRow);

      // select text if there is only one word
      if (trimmedText.indexOf(' ') == -1) {
        translationTextarea.select();
      }

      buttonRow.prepend(
        jQuery('<a/>', {
          text: localization.suggest,
          href: 'javascript:;',
          click: function() {
            buttonRow.prepend(
              jQuery('<img/>', {
                src: clientConfiguration.letsmtSite + iconSet.popupLoading,
                alt: adminLocalization.loading,
                title: adminLocalization.loading,
                style: 'margin-bottom:-4px'
              })
            );
            var saveLink = jQuery(this);
            saveLink.css('pointer-events', 'none');
            var translationText = jQuery('#letsmt-update-translation-translation').val();
            var updateTranslationParams = {
              appID: getAppId(),
              systemID: selectedTranslationSystemId,
              text: originalWithoutTags,
              translation: translationText,
              options: 'suggestion'
            };

            letsMTApi.updateTranslation(
              updateTranslationParams,
              function() {
                if (!probablyContainsTags(original)) {
                  // replace text with proposed translation only if there were no tags to break
                  replaceHtml(translationSpan[0], translationText, nodeListToArray(translationSpan[0].childNodes));
                  translationSpan.data('translation', translationText);
                }
                hideUpdateTranslationPopup();
              },
              function(a, b, c) {
                buttonRow.find('img').remove();
                saveLink.css('pointer-events', '');
                ajaxErrorHandler(a, b, c);
              }
            );
          }
        })
      );

      if (!authorized) {
        fitTextareaHeight(translationTextarea);
      }

      positionUpdateTranslationPopup(popup);

      if (!authorized) {
        jQuery('#letsmt-update-translation-translation').focus();
      }
    }
  };

  var hideUpdateTranslationPopup = function() {
    jQuery('#letsmt-update-translation-popup').remove();
    updateTranslationPopupVisible = false;
    jQuery(document).unbind('keypress.closePopupWindow');
  };

  var fitTextareaHeight = function(textarea) {
    // make sure scroll height is calculated
    textarea.height(0);

    // then make it as large as srollbar suggests
    var height = textarea[0].scrollHeight;

    if (
      navigator.userAgent.indexOf('Trident') > 0 ||
      navigator.userAgent.indexOf('MSIE') > 0 ||
      navigator.userAgent.indexOf('Chrome') > 0
    ) {
      // add broder height for IE and Chrome
      height += textarea.outerHeight() - textarea.innerHeight();
    } else {
      // add border&padding for Firefox and all other
      // (but maybe all other should be treated as Chrome&IE, not sure yet)
      // this is currently default option because it makes textarea larger,
      // which is less bad than smaller
      height += textarea.outerHeight() - textarea.height();
    }
    textarea.css('height', height + 'px');
  };

  var refreshTranslationList = function(original, translation, popup, activeTranslation) {
    lockUpdateTranslationUI(popup);
    var getTransationsParams = {
      appID: getAppId(),
      systemID: selectedTranslationSystemId,
      text: original,
      options: ''
    };

    letsMTApi.getTranslations(
      getTransationsParams,
      function(translations) {
        jQuery('#letsmt-update-translation-translations').remove();
        var scrollPanel = jQuery('<div/>', { id: 'letsmt-update-translation-translations' });

        if (
          translations &&
          translations.length > 0 &&
          ((translations[0].Accepted && (translations[0].FromMyDomain || !translations[0].Origin)) || translations[0].Type == 'Machine')
        ) {
          translations[0].IsUsedByTranslationEngine = true;
          activeTranslation.translation = translations[0].Text;
        }

        for (var i = 0; i < translations.length; i++) {
          scrollPanel.append(createTranslationRow(translations[i], original, translation, popup, activeTranslation));
        }

        scrollPanel.insertBefore(popup.find('.letsmt-popup-button-row'));

        positionUpdateTranslationPopup(popup);
        popup.find('.letsmt-popup-button-row img').remove();
      },
      function(xhr, status, error) {
        // don't leave popup broken if error happens while trying to show it
        positionUpdateTranslationPopup(popup);
        ajaxErrorHandler(xhr, status, error);
        popup.find('.letsmt-popup-button-row img').remove();
      }
    );
  };

  var lockUpdateTranslationUI = function(popup) {
    popup.find('#letsmt-update-translation-translations a').css('pointer-events', 'none');
    if (popup.find('.letsmt-popup-button-row img').length == 0) {
      popup.find('.letsmt-popup-button-row').prepend(
        jQuery('<img/>', {
          src: clientConfiguration.letsmtSite + iconSet.popupLoading,
          alt: adminLocalization.loading,
          title: adminLocalization.loading,
          style: 'margin-bottom:-4px'
        })
      );
    }
  };

  var createTranslationRow = function(translationData, original, translation, popup, activeTranslation) {
    var row = jQuery('<div/>', { class: 'letsmt-update-translation-list-row' });
    if (translationData.IsUsedByTranslationEngine && translationData.Accepted) {
      row.addClass('letsmt-update-translation-list-accepted');
    }

    // text
    var textContainer = jQuery('<td/>', { class: 'letsmt-update-translation-list-text' });
    textContainer.append(jQuery('<div/>', { text: translationData.Text }));

    // buttons
    var buttons = jQuery('<td/>', { class: 'letsmt-update-translation-list-buttons', rowspan: '2' });

    //accept
    if (!row.hasClass('letsmt-update-translation-list-accepted')) {
      buttons.append(
        jQuery('<a/>', {
          text: adminLocalization.accept,
          href: 'javascript:;',
          click: function() {
            saveTranslation(row, translationData, original, translation, popup, false, activeTranslation);
          }
        })
      );
    }

    //edit
    buttons.append(
      jQuery('<a/>', {
        text: adminLocalization.edit,
        href: 'javascript:;',
        class: 'letsmt-translation-list-edit-button',
        click: function() {
          if (textContainer.is(':visible')) {
            // sanity check, should not be here if already in edit mode
            if (translationData.CanEdit) {
              // edit this row
              switchToEditMode(row, translationData);
            } else {
              // don't allow more than one copy
              row.find('.letsmt-translation-list-edit-button').hide();

              // copy row, then edit it
              var newTranslationData = {
                Text: translationData.Text,
                Accepted: false,
                Type: 'Suggestion',
                FromMyDomain: true
              };
              var newRow = createTranslationRow(newTranslationData, original, translation, popup, activeTranslation);
              newRow.insertAfter(row);
              switchToEditMode(newRow, newTranslationData);

              positionUpdateTranslationPopup(popup);
            }
          }
        }
      })
    );

    //save
    if (!translationData.Accepted || row.hasClass('letsmt-update-translation-list-accepted')) {
      buttons.append(
        jQuery('<a/>', {
          text: adminLocalization.save,
          href: 'javascript:;',
          class: 'letsmt-translation-list-save-button',
          click: function() {
            saveTranslation(row, translationData, original, translation, popup, true, activeTranslation);
          },
          style: 'display:none;'
        })
      );
    }

    //cancel
    if (!translationData.Accepted || row.hasClass('letsmt-update-translation-list-accepted')) {
      buttons.append(
        jQuery('<a/>', {
          text: adminLocalization.cancel,
          href: 'javascript:;',
          class: 'letsmt-translation-list-cancel-button',
          click: function() {
            refreshTranslationList(original, translation, popup, activeTranslation);
          },
          style: 'display:none;'
        })
      );
    }

    //delete
    if (translationData.Type != 'Machine' && translationData.Id && translationData.CanEdit) {
      buttons.append(
        jQuery('<a/>', {
          text: adminLocalization['delete'],
          href: 'javascript:;',
          click: function() {
            if (confirm(adminLocalization.reallyDelete)) {
              lockUpdateTranslationUI(popup);
              var removeTranslationParams = {
                appID: getAppId(),
                systemID: selectedTranslationSystemId,
                text: original,
                translation: translationData.Text,
                options: ''
              };

              letsMTApi.removeTranslation(
                removeTranslationParams,
                function() {
                  activeTranslation.changed = true;
                  refreshTranslationList(original, translation, popup, activeTranslation);
                },
                function(a, b, c) {
                  ajaxErrorHandler(a, b, c);
                  refreshTranslationList(original, translation, popup, activeTranslation);
                }
              );
            }
          }
        })
      );
    }

    // metadata
    var metadataContainer = jQuery('<td/>', { class: 'letsmt-update-translation-list-metadata' });

    // type
    if (translationData.Accepted) {
      metadataContainer.append(adminLocalization.accepted);
    } else if (translationData.Type && translationData.Type == 'Machine') {
      metadataContainer.append(adminLocalization.machineTranslation);
    } else {
      metadataContainer.append(adminLocalization.suggestion);
    }

    // origin
    if (translationData.Origin) {
      metadataContainer.append('. ');
      metadataContainer.append(adminLocalization.origin + ': ');
      metadataContainer.append(translationData.Origin);
    }

    var layoutTable = jQuery('<table/>');
    row.append(layoutTable);
    var tr1 = jQuery('<tr/>');
    layoutTable.append(tr1);
    tr1.append(textContainer);
    tr1.append(buttons);

    var tr2 = jQuery('<tr/>');
    layoutTable.append(tr2);
    tr2.append(metadataContainer);

    return row;
  };

  var saveTranslation = function(row, translationData, original, translation, popup, preserveSuggestion, activeTranslation) {
    lockUpdateTranslationUI(popup);
    activeTranslation.changed = true;

    var translatedText = translationData.Text;
    var textarea = row.find('textarea');
    if (textarea && textarea.length > 0) {
      // todo: add text validation here for matching tags
      // or, on the other hand, could add it on the server
      translatedText = textarea.val();
    }

    var options = translationData.Id ? 'id=' + translationData.Id : '';
    if (preserveSuggestion && !translationData.Accepted) {
      options += (options ? ',' : '') + 'suggestion';
    }

    var updateTranslationParams = {
      appID: getAppId(),
      systemID: selectedTranslationSystemId,
      text: original,
      translation: translatedText,
      options: options
    };

    letsMTApi.updateTranslation(
      updateTranslationParams,
      function() {
        refreshTranslationList(original, translation, popup, activeTranslation);
      },
      function(a, b, c) {
        ajaxErrorHandler(a, b, c);
        refreshTranslationList(original, translation, popup, activeTranslation);
      }
    );
  };

  var switchToEditMode = function(row, translationData) {
    // exchange buttons
    row.find('.letsmt-translation-list-edit-button').hide();
    row.find('.letsmt-translation-list-save-button').show();
    row.find('.letsmt-translation-list-cancel-button').show();

    var textContainer = row.find('.letsmt-update-translation-list-text>div');

    textContainer.hide();
    var editArea = jQuery('<textarea/>', {
      text: translationData.Text,
      spellcheck: 'true',
      lang: selectedTranslationSystem.targetLanguage
    });
    editArea.insertBefore(textContainer);
    fitTextareaHeight(editArea);
    editArea.focus(); //also scrolls the textarea into view
  };

  var positionUpdateTranslationPopup = function(popup) {
    var scrollPanel = popup.find('#letsmt-update-translation-translations');
    var elementHeight = 0;
    var popupElements = popup.children();
    for (var i = 0; i < popupElements.length; i++) {
      elementHeight += jQuery(popupElements[i]).outerHeight(true);
    }

    var windowTopBottomMargin = 26;

    if (scrollPanel && popup.outerHeight(true) > jQuery(window).height() - windowTopBottomMargin) {
      scrollPanel.css(
        'max-height',
        jQuery(window).height() - // window height
        popup.outerHeight(true) +
        popup.height() - // minus popup padding
        elementHeight +
        scrollPanel.outerHeight(true) - // minus popup content except the scroll panel
        windowTopBottomMargin + // leave some empty space at window top and bottom
          'px'
      );
    }

    var top = (jQuery(window).height() - popup.outerHeight()) / 2;
    if (top < 0) {
      top = 0;
    }
    var left = (jQuery(window).width() - popup.outerWidth()) / 2;
    if (left < 0) {
      left = 0;
    }

    popup.css('top', top + 'px');
    popup.css('left', left + 'px');
  };

  var calculateIframeOffset = function(currentDocument, contentOffset) {
    var offset = { top: 0, left: 0 };
    var currentWindow = currentDocument.defaultView || currentDocument.parentWindow;
    if (currentWindow == window || typeof currentWindow.parent == 'undefined') {
      return offset;
    }

    var parentWindow = currentWindow.parent;
    jQuery(parentWindow.document)
      .find('iframe')
      .each(function(index, iframe) {
        if (iframe.contentWindow == currentWindow) {
          var iFrameOffset = jQuery(iframe).offset();
          var borderLeft = parseInt(
            jQuery(iframe)
              .css('border-left-width')
              .replace('px', ''),
            10
          );
          var borderTop = parseInt(
            jQuery(iframe)
              .css('border-top-width')
              .replace('px', ''),
            10
          );
          if (borderLeft) {
            iFrameOffset.left += borderLeft;
          }
          if (borderTop) {
            iFrameOffset.top += borderTop;
          }
          var scrollOffset = { top: jQuery(currentWindow).scrollTop(), left: jQuery(currentWindow).scrollLeft() };
          offset = calculateIframeOffset(parentWindow.document, {
            left: iFrameOffset.left + (scrollOffset.left > contentOffset.left ? 0 : contentOffset.left),
            top: iFrameOffset.top + (scrollOffset.top > contentOffset.top ? 0 : contentOffset.top)
          });
          offset.top += iFrameOffset.top - (scrollOffset.top > contentOffset.top ? contentOffset.top : scrollOffset.top);
          offset.left += iFrameOffset.left - (scrollOffset.left > contentOffset.left ? contentOffset.left : scrollOffset.left);
          return false; //should break the loop
        }
      });
    return offset;
  };

  var removeTags = function(html) {
    var container = jQuery('<div></div>');
    container.html(html);
    return container.text();
  };

  var showOriginalTextPopup = function() {
    if (updateTranslationPopupVisible) return;

    var translationSpan = jQuery(this); // in event handler "this" is the dom element which raised the event

    var timeout = setTimeout(function() {
      translationSpan.data('timeout', null);
      removeOriginalTextPopup();

      var originalTextWithoutTags = jQuery.trim(removeTags(translationSpan.data('original')));

      var popup = jQuery('<div/>', {
        class: 'letsmt-original-text-popup'
      });
      popup.append(jQuery('<label/>', { text: authorized ? adminLocalization.originalText : localization.originalText }));
      var closeLink = jQuery('<a/>', { href: 'javascript:;', id: 'letsmt-original-text-popup-close', click: removeOriginalTextPopup });
      closeLink.append(
        jQuery('<img/>', { src: iconSet.close, alt: localization.close, title: localization.close })
      );

      popup.append(closeLink);
      popup.append(jQuery('<div/>', { text: originalTextWithoutTags }));

      if (clientConfiguration.suggestTranslation) {
        popup.append(
          jQuery('<a/>', {
            href: 'javascript:;',
            click: function() {
              showUpdateTranslationPopup(translationSpan);
            },
            text: authorized ? adminLocalization.changeTranslation : localization.suggestTranslation
          })
        );
      }

      var containerWidth = translationSpan.parent().width();
      var contentWidth = translationSpan.width();

      var calculatedWidth = contentWidth / containerWidth > 0.9 ? containerWidth : contentWidth;
      popup.css({ width: calculatedWidth });
      jQuery(document.body).append(popup);

      var calculatedLeft = translationSpan.offset().left;
      if (translationSpan.children().length > 0) {
        // deal with floated child elements
        // find first child that is not whitespace and not text
        var child = translationSpan[0].childNodes[0];
        while (child && !jQuery.trim(jQuery(child).text()) && child.nodeType == 3) {
          child = child.nextSibling;
        }

        // jquery 3 on chrome crashes when getting offset for text nodes
        if (child && child.nodeType != 3) {
          var firstChildLeft = jQuery(child).offset().left;
          if (
            firstChildLeft > 0 && //sanity check
            firstChildLeft < jQuery(document.body).width() && //sanity check
            (firstChildLeft < calculatedLeft || // probably float left
              firstChildLeft - calculatedLeft > 50)
          ) {
            // probably float right
            calculatedLeft = firstChildLeft;
          }
        }
      }
      var calculatedTop = translationSpan.offset().top;
      var parentWindowOffset = calculateIframeOffset(translationSpan[0].ownerDocument, { top: calculatedTop, left: calculatedLeft });

      calculatedTop += parentWindowOffset.top - popup.outerHeight() - 8;
      if (calculatedTop < 0) {
        // not enough space at the top to show popup, so move it at the bottom of the selected text
        calculatedTop += popup.outerHeight() + translationSpan.outerHeight() + 16;
      }

      calculatedLeft += parentWindowOffset.left;

      popup.css({ top: calculatedTop, left: calculatedLeft });

      originalTextPopup = popup;
      selectedTranslation = translationSpan;
      popup.hover(
        function() {
          jQuery(this).stop(true);
          jQuery(this).fadeTo(0, 100);
        },
        function() {
          hideOriginalTextPopup.apply(selectedTranslation[0]);
        }
      );
    }, 1500);
    translationSpan.data('timeout', timeout);
  };

  var removeOriginalTextPopup = function() {
    if (originalTextPopup) {
      originalTextPopup.stop();
      originalTextPopup.remove();
      originalTextPopup = null;
      selectedTranslation = null;
    }
  };

  var hideOriginalTextPopup = function() {
    var timeout = jQuery(this).data('timeout');
    if (timeout) {
      clearTimeout(timeout);
    }

    if (selectedTranslation && selectedTranslation[0] == this) {
      var popup = originalTextPopup;
      popup.fadeOut(500, null, function() {
        jQuery(popup).remove();
        if (popup == originalTextPopup) {
          originalTextPopup = null;
          selectedTranslation = null;
        }
      });
    }
  };

  // escapes &gt; &amp; and stuff like that
  var htmlEncode = function(s) {
    var el = document.createElement('div');
    el.innerText = el.textContent = s;
    s = el.innerHTML
      .replace(/&nbsp;/g, ' ') // &nbsp; is not handled well by translation engine, remove it until it's fixed
      .replace(/<br>/g, '\n') // Chrome & IE creates <br> for whitespace newlines
      .replace(/\s+/g, ' '); // remove excessive whitespace: " \n  \n  " -> " "

    return s;
  };

  // strips attributes from tags and gives (locally) unique number to each tag
  // source: test <a href="http://something" id="somethin"><b>Yes</b> we <b>can</b></a> test
  // target: test <a1><b2>Yes</b2> we <b3>can</b3></a1> test
  var stripAndMarkTags = function(domElements, elementCounter) {
    var result = '';
    var firstIteration = false;
    if (!elementCounter) {
      elementCounter = { counter: 0 }; //create counter as object, so that it can be passed further "by reference" not value
      firstIteration = true;
    }
    for (var i = 0; i < domElements.length; i++) {
      var domElement = domElements[i];
      if (domElement.nodeType in { 3: null, 4: null }) {
        if (domElement.nodeValue.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/)) {
          // text node contains html tags, meaning that these tags were not parsed by dom
          // either it is an error, like wrong formatting (wasting time trying to translate that)
          // or it is programmer page that shows html examples (translating tag names would be bad anyway)
          // so, tags in plain txt are skipped
        } else {
          result += htmlEncode(domElement.nodeValue);
        }
      } else {
        elementCounter.counter++;
        var currentCount = elementCounter.counter;
        var elementName = domElement.localName || domElement.nodeName;
        elementName = elementName.toLowerCase() + currentCount;

        if (domElement.childNodes.length > 0) {
          result += '<' + elementName + '>';
          result += stripAndMarkTags(domElement.childNodes, elementCounter);
          result += '</' + elementName + '>';
        } else {
          result += '<' + elementName + '/>';
        }
        domElement.setAttribute('data-letsmt-tag', elementName);
      }
    }

    if (firstIteration) {
      result = jQuery.trim(result);
    }

    return result;
  };

  // replace self closed tags with open ones
  // Example: <a id="yes"/> --> <a id="yes"></a>
  var expandSelfClosedTags = function(html) {
    return html.replace(/<([a-zA-Z0-9]*)([^>]*?)\/>/g, function(match, tagName, attributes) {
      return '<' + tagName + attributes + '></' + tagName + '>';
    });
  };

  // parse string to HTML DOM; using this function instead of jquery,
  // because jQuery.parseHTML is supported only from version 1.8
  var parseHtml = function(html) {
    var fragment = document.createDocumentFragment();
    var div = fragment.appendChild(document.createElement('div'));
    //browser thinks that self-closed tags are errors that must be corrected
    //and parses <span1/><a2></a2> as <span1><a2></a2></span1>
    //which is seriously breaking stuff
    //need to replace self-closed tags with opening and closing tags before parsing
    html = expandSelfClosedTags(html);
    div.innerHTML = html;

    // hack for IE8 which normally does not parse unrecognized tags
    var couldNotParse = false;
    for (var i = 0; i < div.childNodes.length; i++) {
      if (div.childNodes[i].nodeName && div.childNodes[i].nodeName.length > 0 && div.childNodes[i].nodeName[0] == '/') {
        fragment.createElement(div.childNodes[i].nodeName.substring(1).toLowerCase());
        couldNotParse = true;
      }
    }
    if (couldNotParse) {
      div.innerHTML = html;
    }

    return div.childNodes;
  };

  var validateHTML = function(html) {
    var fragment = document.createDocumentFragment();
    var div = fragment.appendChild(document.createElement('div'));
    div.innerHTML = html;

    // hack for IE8 which normally does not parse unrecognized tags
    var couldNotParse = false;
    for (var i = 0; i < div.childNodes.length; i++) {
      if (div.childNodes[i].nodeName && div.childNodes[i].nodeName.length > 0 && div.childNodes[i].nodeName[0] == '/') {
        fragment.createElement(div.childNodes[i].nodeName.substring(1).toLowerCase());
        couldNotParse = true;
      }
    }
    if (couldNotParse) {
      div.innerHTML = html;
    }

    return div.innerHTML === html;
  };

  // Replaces html content with content that is derived from stripAndMarkTags()
  // Preserves tags so that not to damage any javascript events attached to them, changes only text
  var replaceHtml = function(parentNode, html, reusableTagList) {
    if (typeof html == 'string') {
      html = parseHtml(html);
    }
    var translatedNode = html[0];
    var lastAddedNode = null;
    while (translatedNode) {
      if (translatedNode.nodeType in { 3: null, 4: null }) {
        // add text
        var newNode = translatedNode.cloneNode();
        if (lastAddedNode) {
          if (newNode != lastAddedNode.nextSibling) {
            parentNode.insertBefore(newNode, lastAddedNode.nextSibling);
          }
        } else {
          if (parentNode.childNodes.length == 0 || newNode !== parentNode.childNodes[0]) {
            parentNode.insertBefore(newNode, parentNode.childNodes.length > 0 ? parentNode.childNodes[0] : null);
          }
        }
        lastAddedNode = newNode;
      } else {
        // find original tag
        var nodeName = translatedNode.localName || translatedNode.nodeName;
        nodeName = nodeName.toLowerCase();

        var originalNode = jQuery(reusableTagList).filter("[data-letsmt-tag='" + nodeName + "']");
        if (originalNode.length > 0) {
          originalNode = originalNode[0];
        } else {
          originalNode = null;
        }
        // move original tag to the correct position
        if (originalNode) {
          if (lastAddedNode) {
            if (originalNode != lastAddedNode.nextSibling) {
              parentNode.insertBefore(originalNode, lastAddedNode.nextSibling);
            }
          } else {
            if (parentNode.childNodes.length == 0 || originalNode !== parentNode.childNodes[0]) {
              parentNode.insertBefore(originalNode, parentNode.childNodes.length > 0 ? parentNode.childNodes[0] : null);
            }
          }
          lastAddedNode = originalNode;
          reusableTagList.splice(jQuery.inArray(originalNode, reusableTagList), 1);

          // process child nodes
          if (translatedNode.childNodes.length > 0) {
            replaceHtml(originalNode, translatedNode.childNodes, nodeListToArray(originalNode.childNodes));
          } else {
            while (originalNode.childNodes.length > 0) {
              originalNode.removeChild(originalNode.childNodes[0]);
            }
          }
        }
      }
      translatedNode = translatedNode.nextSibling;
    }

    // remove leftover nodes (should only be text nodes, if not, we have a problem)
    if (lastAddedNode) {
      while (lastAddedNode.nextSibling) {
        if (lastAddedNode.nextSibling.nodeType in { 3: null, 4: null }) {
          parentNode.removeChild(lastAddedNode.nextSibling);
        } else {
          lastAddedNode = lastAddedNode.nextSibling;
        }
      }
    }
    var textNodesToRemove = [];
    for (var i = 0; i < reusableTagList.length; i++) {
      if (reusableTagList[i].nodeType in { 3: null, 4: null }) {
        textNodesToRemove.push(reusableTagList[i]);
      }
    }
    while (textNodesToRemove.length > 0) {
      var nodeToRemove = textNodesToRemove.pop();
      if (nodeToRemove.parentNode) {
        nodeToRemove.parentNode.removeChild(nodeToRemove);
      }
      reusableTagList.splice(jQuery.inArray(nodeToRemove, reusableTagList), 1);
    }
  };

  var translateFragments = function(domElementsToTranslate) {
    // strip out translatable text from dom elements
    var textsToTranslate = [];
    var badFragmentIndexes = [];
    var totalTextlength = 0;

    for (var i = 0; i < domElementsToTranslate.length; i++) {
      var fragment = domElementsToTranslate[i];

      var textToTranslate = '';
      if (fragment.length == 1) {
        var element = fragment[0];
        if (element.constructor.name == 'Attr') {
          if (element.specified && element.value) {
            textToTranslate = element.value;
          }
        } else {
          var jQueryElement = jQuery(element);
          if (element.nodeType in { 3: null, 4: null }) {
            textToTranslate = stripAndMarkTags([element]);
          } else {
            textToTranslate = stripAndMarkTags(element.childNodes);
          }
        }
      } else {
        textToTranslate = stripAndMarkTags(fragment);
      }
      if (textToTranslate == '') {
        badFragmentIndexes.push(i - badFragmentIndexes.length);
      } else {
        textsToTranslate.push(textToTranslate);
      }
      totalTextlength += textToTranslate.length;
    }

    for (var i = 0; i < badFragmentIndexes.length; i++) {
      domElementsToTranslate.splice(badFragmentIndexes[i], 1);
    }

    // divide translatable texts in batches
    var batchTextsToTranslate = [];
    var batchSizeInSymbols = 0;
    var processedSizeInSymbols = 0;
    var batchSizeInPhrases = 0;
    var batchElements = [];
    var batches = [];
    var maxBatchSizeInSymbols = 1000;
    var maxBatchSizeInPhrases = 10;

    for (var i = 0; i < domElementsToTranslate.length; i++) {
      if (batchSizeInPhrases == 0) {
        // first batches will be smaller than the last ones
        // so that translations in the beginning of the page appear on screen asap
        var logarithmSteepness = 300; // how fast will start using the maximum batch size
        var batchSizeCoeficient =
          Math.log(2 + (logarithmSteepness * processedSizeInSymbols) / totalTextlength) / Math.log(logarithmSteepness);
      }

      batchSizeInPhrases++;
      batchSizeInSymbols += textsToTranslate[i].length;
      processedSizeInSymbols += textsToTranslate[i].length;
      batchTextsToTranslate.push(textsToTranslate[i]);
      batchElements.push(domElementsToTranslate[i]);

      if (
        batchSizeInSymbols >= maxBatchSizeInSymbols * batchSizeCoeficient ||
        batchSizeInPhrases >= maxBatchSizeInPhrases ||
        i == domElementsToTranslate.length - 1
      ) {
        batches.push({ textsToTranslate: batchTextsToTranslate, elements: batchElements });

        batchSizeInSymbols = 0;
        batchSizeInPhrases = 0;
        batchTextsToTranslate = [];
        batchElements = [];
      }
    }
    if (batches && batches.length > 0) {
      sendBatchToServerAndProcessResults(batches, 0, finishedTranslating);
    } else {
      finishedTranslating();
    }
  };

  var getLanguageName = function(languageCode) {
    return localization[languageCode] ? localization[languageCode] : languageCode;
  };

  var finishedTranslating = function() {
    switch (clientConfiguration.restoreOriginalLinkLength) {
      case 1:
        restoreButton.text(localization.restoreOriginal);
        break;
      case 3:
        restoreButton.text(
          localization.restoreOriginalLong +
            ': ' +
            getLanguageName(selectedTranslationSystem.sourceLanguage ? selectedTranslationSystem.sourceLanguage : currentSourceLanguage)
        );
        break;
      case 2:
      default:
        restoreButton.text(
          localization.restoreOriginal +
            ': ' +
            getLanguageName(selectedTranslationSystem.sourceLanguage ? selectedTranslationSystem.sourceLanguage : currentSourceLanguage)
        );
    }

    if (clientConfiguration.showHeader) {
      caption.html(serverConfiguration.showWidgetLogo ? localization.captionTraqnslatedWithLogo : localization.captionTranslated);
    }

    //show top block
    if (clientConfiguration.showMachineTranslationWarningAfterTranslation) {
      var topStrip = jQuery('<div />', { id: 'letsmt-top-strip' });

      var homeLink = jQuery('<a/>', {
        href: clientConfiguration.letsmtSite + '/',
        target: 'blank',
        class: 'letsmt-logo'
      });
      homeLink.append(
        jQuery('<img/>', {
          alt: localization.goHome,
          title: localization.goHome,
          src: clientConfiguration.letsmtSite + serverConfiguration.logo
        })
      );
      topStrip.append(homeLink);

      topStrip.append(
        localization.machineTranslationNotice
          .replace(
            '(source)',
            selectedTranslationSystem.sourceLanguage
              ? localization[selectedTranslationSystem.sourceLanguage]
              : localization[currentSourceLanguage]
          )
          .replace(
            '(target)',
            localization[selectedTranslationSystem.targetLanguage]
              ? localization[selectedTranslationSystem.targetLanguage]
              : selectedTranslationSystem.name
          )
      );
      topStrip.append(
        jQuery('<a/>', {
          href: 'javascript:;',
          click: function() {
            self.restore();
          },
          text:
            localization.restoreOriginal +
            ': ' +
            getLanguageName(selectedTranslationSystem.sourceLanguage ? selectedTranslationSystem.sourceLanguage : currentSourceLanguage)
        })
      );

      var closeButton = jQuery('<a/>', {
        href: 'javascript:;',
        id: 'letsmt-top-strip-close',
        click: function() {
          jQuery('#letsmt-top-strip').remove();
          jQuery('#letsmt-top-spacer').remove();
        }
      });

      closeButton.append(
        jQuery('<img/>', {
          title: localization.close,
          alt: localization.close,
          src: clientConfiguration.letsmtSite + iconSet.close
        })
      );

      topStrip.append(closeButton);

      if (authorized && clientConfiguration.showTranslationSuggestionAdminPage) {
        topStrip.append(
          jQuery('<a></a>', {
            id: 'letsmt-translation-suggestions',
            target: '_blank',
            href: serverConfiguration.translationSuggestionAdministationUrl,
            text: localization.translationSuggestions
          })
        );
      }

      var loginDiv = jQuery('<div/>', { id: 'letsmt-authorization' });

      loginDiv.append(
        jQuery('<a/>', {
          href: 'javascript:;',
          click: function() {
            redirectToLoginPage();
          },
          text: localization.login,
          id: 'letsmt-show-login',
          style: authorized ? 'display:none' : ''
        })
      );
      loginDiv.append(' ');
      loginDiv.append(
        jQuery('<span/>', {
          style: authorized ? '' : 'display:none',
          id: 'letsmt-authorized-user',
          text: readCookie('letsmt-ws-username')
        })
      );
      loginDiv.append(' ');
      loginDiv.append(
        jQuery('<a/>', {
          href: 'javascript:;',
          click: function() {
            logout(true);
          },
          text: localization.logout,
          id: 'letsmt-logout',
          style: authorized ? '' : 'display:none'
        })
      );

      topStrip.append(loginDiv);

      topStrip.insertBefore(jQuery(document).find('body>*:first-child'));

      jQuery('<div/>', { id: 'letsmt-top-spacer' }).insertBefore(jQuery(document).find('body>*:first-child'));
    }

    if (!clientConfiguration.languageListAsLinks) {
      jQuery('#letsmt-translation-system').removeAttr('disabled');
    }

    translated = true;
    translating = false;

    hideProgress();
    restoreButton.show();

    if (typeof self.onTranslated !== 'undefined') {
      self.onTranslated();
    }
  };

  var sendBatchToServerAndProcessResults = function(batches, index, finishedCallback) {
    if (!translating) {
      return;
    }
    var percent = Math.round((100 * index) / batches.length) + '%';
    translateProgress.text(percent);

    if (typeof self.onProgress !== 'undefined') {
      self.onProgress(percent);
    }

    progressBarInner.css('width', percent);

    if(clientConfiguration.apiVersion==0){ // V1
      var translateArrayParams = {
        appID: getAppId(),
        systemID: selectedTranslationSystemId,
        textArray: batches[index].textsToTranslate,
        options: 'tagged,markSentences,widget=' + (clientConfiguration.widget ? clientConfiguration.widget : 'web-embedded')
      };

      if (self.termCorpusId) {
        translateArrayParams['options'] += ',termCorpusId=' + self.termCorpusId;
      }

      letsMTApi.translateArrayEx(
        translateArrayParams,
        batches[index],
        function(translations, associatedData) {
          if (!translating) {
            return;
          }
          for (var translationCounter = 0; translationCounter < translations.length; translationCounter++) {
            var elements = associatedData.elements[translationCounter];
            var translation = translations[translationCounter].translation;
            var htmlToTranslate = associatedData.textsToTranslate[translationCounter];
            var originalSentences = [];
            var translationSentences = [];

            if (
              translations[translationCounter].originalSentenceRanges.length == 0 ||
              translations[translationCounter].translationSentenceRanges.length == 0
            ) {
              originalSentences.push(htmlToTranslate);
              translationSentences.push(translation);
            } else {
              var htmlToTranslateGraphemes = graphemeSplitter.splitGraphemes(htmlToTranslate);
              var translationGraphemes = graphemeSplitter.splitGraphemes(translation);
              var originalSentence = '';
              var translationSentence = '';
              if (translations[translationCounter].originalSentenceRanges.length < translations[translationCounter].countSentences) {
                if (console) {
                  console.warn('Original sentence count mismatch.', translations[translationCounter]);
                  translations[translationCounter].countSentences = translations[translationCounter].originalSentenceRanges.length;
                }
              }
              if (translations[translationCounter].translationSentenceRanges.length < translations[translationCounter].countSentences) {
                if (console) {
                  console.warn('Translation sentence count mismatch.', translations[translationCounter]);
                  translations[translationCounter].countSentences = translations[translationCounter].translationSentenceRanges.length;
                }
              }
              for (var sentenceCounter = 0; sentenceCounter < translations[translationCounter].countSentences; sentenceCounter++) {
                originalSentence += htmlToTranslateGraphemes
                  .slice(
                    translations[translationCounter].originalSentenceRanges[sentenceCounter][0],
                    translations[translationCounter].originalSentenceRanges[sentenceCounter][0] +
                      translations[translationCounter].originalSentenceRanges[sentenceCounter][1]
                  )
                  .join('');

                translationSentence += translationGraphemes
                  .slice(
                    translations[translationCounter].translationSentenceRanges[sentenceCounter][0],
                    translations[translationCounter].translationSentenceRanges[sentenceCounter][0] +
                      translations[translationCounter].translationSentenceRanges[sentenceCounter][1]
                  )
                  .join('');

                // if html markup is not valid inside the sentence,
                // it will be joined with the next sentence until the markup is ok
                if (validateHTML(originalSentence)) {
                  originalSentences.push(jQuery.trim(originalSentence));
                  translationSentences.push(jQuery.trim(translationSentence));
                  originalSentence = '';
                  translationSentence = '';
                }
              }
              if (originalSentence != '') {
                originalSentences.push(jQuery.trim(originalSentence));
                translationSentences.push(jQuery.trim(translationSentence));
              }
            }

            replaceHtmlWithTranslation(originalSentences, translationSentences, elements);
          }

          if (batches.length > index + 1) {
            sendBatchToServerAndProcessResults(batches, index + 1, finishedCallback);
          } else {
            if (finishedCallback) {
              finishedCallback();
            }
          }
        },
        ajaxErrorHandler
      );
    }
    else if(clientConfiguration.apiVersion==1){ // V2
      letsMTApi.translateV2(
        batches[index].textsToTranslate,
        batches[index],
        function(translations, associatedData) {
          if (!selectedTranslationSystem.domain) {
            // set new system
            selectedTranslationSystem = clientConfiguration.translationSystems.find((sys) => {
              return sys.sourceLanguage == selectedTranslationSystem.sourceLanguage
                && sys.targetLanguage == selectedTranslationSystem.targetLanguage
                && sys.domain == translations.domain
            });
            // notify language switcher
            self.onSystemChange(selectedTranslationSystem.id, true, true);
          }
          if (!translating) {
            return;
          }
          for (var translationCounter = 0; translationCounter < translations.translations.length; translationCounter++) {
            var elements = associatedData.elements[translationCounter];
            var translation = translations.translations[translationCounter].translation;
            var htmlToTranslate = associatedData.textsToTranslate[translationCounter];
            var originalSentences = [];
            var translationSentences = [];
            originalSentences.push(htmlToTranslate);
            translationSentences.push(translation);
            replaceHtmlWithTranslation(originalSentences, translationSentences, elements);
          }

          if (batches.length > index + 1) {
            sendBatchToServerAndProcessResults(batches, index + 1, finishedCallback);
          } else {
            if (finishedCallback) {
              finishedCallback();
            }
          }
        },
        ajaxErrorHandler
      );
    }

  };

  var nodeListToArray = function(nodeList) {
    var arr = [];
    for (var i = 0, n; (n = nodeList[i]); ++i) arr.push(n);
    return arr;
  };

  var replaceHtmlWithTranslation = function(originalSentences, translationSentences, elements) {
    if (elements.length == 1 && elements[0].constructor.name == 'Attr') {
      jQuery(elements[0].ownerElement).attr('data-original-' + elements[0].name, elements[0].value);
      elements[0].value = translationSentences.join(' ');
    } else {
      var reusableNodes = elements;

      var span = null;
      for (var sentenceCounter = 0; sentenceCounter < originalSentences.length; sentenceCounter++) {
        if (span == null) {
          if (elements.length == 1 && !(elements[0].nodeType in { 3: null, 4: null })) {
            // we have a single paragraph, it's content should be replaced, not the paragraph tags
            reusableNodes = nodeListToArray(elements[0].childNodes);

            if (originalSentences.length == 1) {
              // we have only one sentence, which means that paragraph does not have to be divided in spans
              span = jQuery(elements[0]);
              span.addClass('letsmt-translation');
            } else {
              // insert first sentence span inside paragraph tag
              span = jQuery('<span/>', { class: 'letsmt-translation' });
              jQuery(elements[0]).append(span);
              span.data('isNewTag', true);
            }
          } else {
            if (originalSentences.length == 1 && elements[0].parentNode) {
              var childNodesOfParent = elements[0].parentNode.childNodes;
              var parentChildrenCount = childNodesOfParent.length;
              if (
                childNodesOfParent[parentChildrenCount - 1].nodeType == 3 &&
                childNodesOfParent[parentChildrenCount - 1].nodeValue.trim() == ''
              ) {
                parentChildrenCount--;
              }
              if (childNodesOfParent[0].nodeType == 3 && childNodesOfParent[0].nodeValue.trim() == '') {
                parentChildrenCount--;
              }
              if (parentChildrenCount == elements.length) {
                // we have only one sentence, which means that paragraph does not have to be divided in spans
                span = jQuery(elements[0].parentNode);
                span.addClass('letsmt-translation');
              }
            }
          }
          if (span == null) {
            // insert first sentence span before translatable content
            span = jQuery('<span/>', { class: 'letsmt-translation' });
            span.insertBefore(jQuery(elements[0]));
            span.data('isNewTag', true);
          }
        } else {
          // span for the next sentence comes after span for the previous sentence
          newSpan = jQuery('<span/>', { class: 'letsmt-translation' });
          newSpan.insertAfter(span);
          span.after(' ');
          span = newSpan;
          span.data('isNewTag', true);
        }

        if (jQuery.inArray(selectedTranslationSystem.targetLanguage, ['ar', 'fa', 'ur', 'he', 'yi']) >= 0) {
          if (!span[0].hasAttribute('data-old-dir')) {
            if (span[0].hasAttribute('dir')) {
              span.attr('data-old-dir', span.attr('dir'));
            } else {
              span.attr('data-old-dir', '');
              span.attr('dir', 'rtl');
            }
          }
        }

        replaceHtml(span[0], translationSentences[sentenceCounter], reusableNodes);

        if (windowsPhone) {
          // simulates mouse hover on windows phone touch
          span.attr('aria-haspopup', 'true');
        }

        span.data('original', originalSentences[sentenceCounter]);
        span.data('translation', translationSentences[sentenceCounter]);
        if (!clientConfiguration.hidePopup) {
          span.bind('mouseenter.letsmt-translation', showOriginalTextPopup);
          span.bind('mouseleave.letsmt-translation', hideOriginalTextPopup);
        }
      }
    }
  };

  this.autoTranslateIfNeeded = function() {
    // automatically translate if navigated here from other page and was previously translated
    if (clientConfiguration.translateAfterNavigation && !translating) {
      var previousSystem = readCookie('letsmt-translation-system');
      if (previousSystem) {
        if (!clientConfiguration.languageListAsLinks && previousSystem != selectedTranslationSystemId) {
          jQuery('#letsmt-translation-system').val(previousSystem);
        }

        termCorpus = readCookie('letsmt-term-corpus');

        self.translate(previousSystem, termCorpus);
      }
    }
  };

  var drawLanguageList = function() {
    chooseLanguageDiv.empty();
    if (clientConfiguration.languageListAsLinks) {
      var bindLanguageLink = function(link, systemId) {
        link.click(function() {
          self.translate(systemId);
        });
      };

      for (var i = 0; i < clientConfiguration.translationSystems.length; i++) {
        var link = jQuery('<a/>', {
          href: 'javascript:;',
          text: clientConfiguration.translationSystems[i].name
        });
        bindLanguageLink(link, clientConfiguration.translationSystems[i].id);
        chooseLanguageDiv.append(link);
        chooseLanguageDiv.append(' ');
      }
    } else {
      var translateButton = jQuery('<a/>', {
        id: 'letsmt-translate',
        href: 'javascript:;',
        click: function() {
          if (translating) {
            self.cancel();
          } else {
            self.onTranslateClick();
          }
        }
      });

      translateButton.append(
        jQuery('<img/>', {
          title: localization.translate,
          alt: localization.translate,
          ///// src: clientConfiguration.letsmtSite + iconSet.translate
        })
      );

      chooseLanguageDiv.append(translateButton);

      var translationSystemContainer = jQuery('<div>', { id: 'letsmt-translation-system-container' });
      var translationSystem = jQuery('<select/>', {
        id: 'letsmt-translation-system',
        change: function(event) {
          selectedTranslationSystemId = jQuery(event.target).val();
          localize();
          if (typeof self.onSystemChange !== 'undefined') {
            self.onSystemChange(selectedTranslationSystemId, true, self.systemChangedAutomagically);
          }
          self.systemChangedAutomagically = false;
        }
      });

      if (clientConfiguration.browserSpecificDropdownPadding) {
        if (
          navigator.userAgent.indexOf('Gecko') > -1 &&
          navigator.userAgent.indexOf('Windows') > -1 &&
          navigator.userAgent.indexOf('like Gecko') == -1
        ) {
          translationSystem.css('padding', '3px 3px 3px 1px');
        } else if (navigator.userAgent.indexOf('Trident') > -1) {
          translationSystem.css('padding-top', '2px');
        }
      }
      jQuery(clientConfiguration.translationSystems).each(function(index, item) {
        translationSystem.append(jQuery('<option/>', { value: item.id }).text(item.name));
      });
      translationSystemContainer.append(translationSystem);
      chooseLanguageDiv.append(translationSystemContainer);
    }

    if (!clientConfiguration.languageListAsLinks) {
      // localize UI to language chosen in dropdown
      translationSystem.trigger('change');
    }

    if (readCookie('letsmt-redirected-to-login-page')) {
      deleteCookie('letsmt-redirected-to-login-page');
    } else {
      self.autoTranslateIfNeeded();
    }
    self.loading = false;
  };

  this.onTranslateClick = function() {
    this.translate();
  };

  this.setSourceLanguage = function(sourceLanguage) {
    if (
      currentSourceLanguage != sourceLanguage ||
      sourceLanguage == null ||
      (selectedTranslationSystem && selectedTranslationSystem.sourceLanguage != sourceLanguage)
    ) {
      // if language changes, don't autotranslate
      deleteCookie('letsmt-translation-system');
      deleteCookie('letsmt-term-corpus');

      // check if we have a system for this language
      var haveSystemForLanguage = false;
      for (var i = 0; i < clientConfiguration.translationSystems.length; i++) {
        if (clientConfiguration.translationSystems[i].sourceLanguage == sourceLanguage) {
          haveSystemForLanguage = true;
          break;
        }
      }

      if (haveSystemForLanguage) {
        currentSourceLanguage = sourceLanguage;

        clientConfiguration.translationSystems = clientConfiguration.translationSystems.sort(function(a, b) {
          // but put systems with the selected sourceLanguage at the top
          if (a.sourceLanguage == sourceLanguage) {
            if (b.sourceLanguage == sourceLanguage) {
              return sortByOrderThenByTitle(a, b);
            } else {
              return -1;
            }
          } else {
            if (b.sourceLanguage == sourceLanguage) {
              return 1;
            } else {
              return sortByOrderThenByTitle(a, b);
            }
          }
        });
      } else {
        //use default source language
        currentSourceLanguage = clientConfiguration.language;
        clientConfiguration.translationSystems = clientConfiguration.translationSystems.sort(sortByOrderThenByTitle);
      }

      if (!clientConfiguration.uiLanguage) {
        initLocalization(sourceLanguage);
      }

      this.systemChangedAutomagically = true;
      drawLanguageList();
      return true;
    }
    return false;
  };

  var systemChangedAutomagically = false;

  this.changeSystem = function(systemId) {
    const chageSyst = () => {
      selectedTranslationSystemId = systemId;
      localize();
      if (typeof self.onSystemChange !== 'undefined') {
        self.onSystemChange(selectedTranslationSystemId, true, self.systemChangedAutomagically);
      }
      self.systemChangedAutomagically = false;
    };

    var changed = false;
    var system = null;

    if (selectedTranslationSystem && selectedTranslationSystem.id != systemId) {
      // check if system exists
      for (var i = 0; i < clientConfiguration.translationSystems.length; i++) {
        if (clientConfiguration.translationSystems[i].id == systemId) {
          system = clientConfiguration.translationSystems[i];
          break;
        }
      }

      if (system) {
        // if system changes, don't autotranslate when navigating to different page
        deleteCookie('letsmt-translation-system');
        deleteCookie('letsmt-term-corpus');

        if (!clientConfiguration.languageListAsLinks) {
          // simulate translation system change through UI
          var translationSystemSelector = jQuery('#letsmt-translation-system');
          translationSystemSelector.val(systemId);
          changed = true;
          translationSystemSelector.trigger('change');
          chageSyst();
        }
      }
    }

    if (!changed) {
      if (selectedTranslationSystem && selectedTranslationSystem.id == systemId) {
        if (typeof self.onWarning !== 'undefined') {
          self.onWarning('System already selected.');
        }
      } else {
        if (typeof self.onWarning !== 'undefined') {
          self.onWarning("Ain't got such system.");
        }
      }
      // send notice that nothing is changed
      if (typeof self.onSystemChange !== 'undefined') {
        self.onSystemChange(selectedTranslationSystemId, false, false);
      }
    }
  };

  var sortByOrderThenByTitle = function(a, b) {
    if (typeof a.order !== 'undefined' && a.order !== null && !isNaN(parseInt(a.order, 10))) {
      if (typeof b.order !== 'undefined' && b.order !== null && !isNaN(parseInt(b.order, 10))) {
        return parseInt(a.order, 10) > parseInt(b.order, 10) ? 1 : -1;
      } else {
        return -1;
      }
    } else {
      if (typeof b.order !== 'undefined' && b.order !== null && !isNaN(parseInt(b.order, 10))) {
        return 1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    }
  };

  if (clientConfiguration.showAllTranslationSystems) {
    chooseLanguageDiv.append(
      jQuery('<img/>', {
        src: clientConfiguration.letsmtSite + iconSet.widgetLoading,
        alt: localization.loading,
        title: localization.loading,
        class: 'letsmt-language-list-loading'
      })
    );

    // todo: load translation system list from server
    // and override clientConfiguration.translationSystems
    var getSystemListParams = {
      appID: getAppId(),
      uiLanguageID: clientConfiguration.uiLanguage,
      options: 'public' + (clientConfiguration.filterSystemsByAppId ? ',filter' : '')
    };
    letsMTApi.getSystemList(
      getSystemListParams,
      function(data) {
        clientConfiguration.translationSystems = [];
        for (var systemCounter = 0; systemCounter < data.System.length; systemCounter++) {
          var system = data.System[systemCounter];
          var status = null;
          var srclang = null;
          var trglang = null;
          var title = system.Title.Text;
          var order = null;
          for (var metadataCounter = 0; metadataCounter < system.Metadata.length; metadataCounter++) {
            var metadata = system.Metadata[metadataCounter];
            switch (metadata.Key) {
              case 'status':
                status = metadata.Value;
                break;
              case 'srclang':
                srclang = metadata.Value;
                break;
              case 'trglang':
                trglang = metadata.Value;
                break;
              case 'order':
                order = metadata.Value;
              default:
                break;
            }
          }
          if (status && clientConfiguration.allowedSystemStatuses.indexOf(status) > -1) {
            clientConfiguration.translationSystems.push({
              id: system.ID,
              sourceLanguage: srclang,
              targetLanguage: trglang,
              name: title,
              order: order
            });
          }
        }
        currentSourceLanguage = null;
        self.setSourceLanguage(null);
      },
      function(param1, param2, param3) {
        chooseLanguageDiv.empty();
        this.loading = false;
        ajaxErrorHandler(param1, param2, param3);
      }
    );
  } else {
    drawLanguageList();
  }

  this.setTranslationSystemList = function(list) {
    this.clientConfiguration.translationSystems = list;
    currentSourceLanguage = null;
    self.setSourceLanguage(null);
  };

  /*
    Breaks a Javascript string into individual user-perceived "characters"
    called extended grapheme clusters by implementing the Unicode UAX-29 standard, version 10.0.0

    Usage:
    var splitter = new GraphemeSplitter();
    //returns an array of strings, one string for each grapheme cluster
    var graphemes = splitter.splitGraphemes(string);

    */
  function GraphemeSplitter() {
    var CR = 0,
      LF = 1,
      Control = 2,
      Extend = 3,
      Regional_Indicator = 4,
      SpacingMark = 5,
      L = 6,
      V = 7,
      T = 8,
      LV = 9,
      LVT = 10,
      Other = 11,
      Prepend = 12,
      E_Base = 13,
      E_Modifier = 14,
      ZWJ = 15,
      Glue_After_Zwj = 16,
      E_Base_GAZ = 17;

    // BreakTypes
    var NotBreak = 0,
      BreakStart = 1,
      Break = 2,
      BreakLastRegional = 3,
      BreakPenultimateRegional = 4;

    function isSurrogate(str, pos) {
      return (
        0xd800 <= str.charCodeAt(pos) &&
        str.charCodeAt(pos) <= 0xdbff &&
        0xdc00 <= str.charCodeAt(pos + 1) &&
        str.charCodeAt(pos + 1) <= 0xdfff
      );
    }

    // Private function, gets a Unicode code point from a JavaScript UTF-16 string
    // handling surrogate pairs appropriately
    function codePointAt(str, idx) {
      if (idx === undefined) {
        idx = 0;
      }
      var code = str.charCodeAt(idx);

      // if a high surrogate
      if (0xd800 <= code && code <= 0xdbff && idx < str.length - 1) {
        var hi = code;
        var low = str.charCodeAt(idx + 1);
        if (0xdc00 <= low && low <= 0xdfff) {
          return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
        }
        return hi;
      }

      // if a low surrogate
      if (0xdc00 <= code && code <= 0xdfff && idx >= 1) {
        var hi = str.charCodeAt(idx - 1);
        var low = code;
        if (0xd800 <= hi && hi <= 0xdbff) {
          return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
        }
        return low;
      }

      //just return the char if an unmatched surrogate half or a
      //single-char codepoint
      return code;
    }

    // Private function, returns whether a break is allowed between the
    // two given grapheme breaking classes
    function shouldBreak(start, mid, end) {
      var all = [start].concat(mid).concat([end]);
      var previous = all[all.length - 2];
      var next = end;

      // Lookahead termintor for:
      // GB10. (E_Base | EBG) Extend* ?	E_Modifier
      var eModifierIndex = all.lastIndexOf(E_Modifier);
      if (
        eModifierIndex > 1 &&
        all.slice(1, eModifierIndex).every(function(c) {
          return c == Extend;
        }) &&
        [Extend, E_Base, E_Base_GAZ].indexOf(start) == -1
      ) {
        return Break;
      }

      // Lookahead termintor for:
      // GB12. ^ (RI RI)* RI	?	RI
      // GB13. [^RI] (RI RI)* RI	?	RI
      var rIIndex = all.lastIndexOf(Regional_Indicator);
      if (
        rIIndex > 0 &&
        all.slice(1, rIIndex).every(function(c) {
          return c == Regional_Indicator;
        }) &&
        [Prepend, Regional_Indicator].indexOf(previous) == -1
      ) {
        if (
          all.filter(function(c) {
            return c == Regional_Indicator;
          }).length %
            2 ==
          1
        ) {
          return BreakLastRegional;
        } else {
          return BreakPenultimateRegional;
        }
      }

      // GB3. CR X LF
      if (previous == CR && next == LF) {
        return NotBreak;
      }
      // GB4. (Control|CR|LF) ÷
      else if (previous == Control || previous == CR || previous == LF) {
        if (
          next == E_Modifier &&
          mid.every(function(c) {
            return c == Extend;
          })
        ) {
          return Break;
        } else {
          return BreakStart;
        }
      }
      // GB5. ÷ (Control|CR|LF)
      else if (next == Control || next == CR || next == LF) {
        return BreakStart;
      }
      // GB6. L X (L|V|LV|LVT)
      else if (previous == L && (next == L || next == V || next == LV || next == LVT)) {
        return NotBreak;
      }
      // GB7. (LV|V) X (V|T)
      else if ((previous == LV || previous == V) && (next == V || next == T)) {
        return NotBreak;
      }
      // GB8. (LVT|T) X (T)
      else if ((previous == LVT || previous == T) && next == T) {
        return NotBreak;
      }
      // GB9. X (Extend|ZWJ)
      else if (next == Extend || next == ZWJ) {
        return NotBreak;
      }
      // GB9a. X SpacingMark
      else if (next == SpacingMark) {
        return NotBreak;
      }
      // GB9b. Prepend X
      else if (previous == Prepend) {
        return NotBreak;
      }

      // GB10. (E_Base | EBG) Extend* ?	E_Modifier
      var previousNonExtendIndex = all.indexOf(Extend) != -1 ? all.lastIndexOf(Extend) - 1 : all.length - 2;
      if (
        [E_Base, E_Base_GAZ].indexOf(all[previousNonExtendIndex]) != -1 &&
        all.slice(previousNonExtendIndex + 1, -1).every(function(c) {
          return c == Extend;
        }) &&
        next == E_Modifier
      ) {
        return NotBreak;
      }

      // GB11. ZWJ ? (Glue_After_Zwj | EBG)
      if (previous == ZWJ && [Glue_After_Zwj, E_Base_GAZ].indexOf(next) != -1) {
        return NotBreak;
      }

      // GB12. ^ (RI RI)* RI ? RI
      // GB13. [^RI] (RI RI)* RI ? RI
      if (mid.indexOf(Regional_Indicator) != -1) {
        return Break;
      }
      if (previous == Regional_Indicator && next == Regional_Indicator) {
        return NotBreak;
      }

      // GB999. Any ? Any
      return BreakStart;
    }

    // Returns the next grapheme break in the string after the given index
    this.nextBreak = function(string, index) {
      if (index === undefined) {
        index = 0;
      }
      if (index < 0) {
        return 0;
      }
      if (index >= string.length - 1) {
        return string.length;
      }
      var prev = getGraphemeBreakProperty(codePointAt(string, index));
      var mid = [];
      for (var i = index + 1; i < string.length; i++) {
        // check for already processed low surrogates
        if (isSurrogate(string, i - 1)) {
          continue;
        }

        var next = getGraphemeBreakProperty(codePointAt(string, i));
        if (shouldBreak(prev, mid, next)) {
          return i;
        }

        mid.push(next);
      }
      return string.length;
    };

    // Breaks the given string into an array of grapheme cluster strings
    this.splitGraphemes = function(str) {
      var res = [];
      var index = 0;
      var brk;
      while ((brk = this.nextBreak(str, index)) < str.length) {
        res.push(str.slice(index, brk));
        index = brk;
      }
      if (index < str.length) {
        res.push(str.slice(index));
      }
      return res;
    };

    // Returns the number of grapheme clusters there are in the given string
    this.countGraphemes = function(str) {
      var count = 0;
      var index = 0;
      var brk;
      while ((brk = this.nextBreak(str, index)) < str.length) {
        index = brk;
        count++;
      }
      if (index < str.length) {
        count++;
      }
      return count;
    };

    //given a Unicode code point, determines this symbol's grapheme break property
    function getGraphemeBreakProperty(code) {
      //grapheme break property for Unicode 10.0.0,
      //taken from http://www.unicode.org/Public/10.0.0/ucd/auxiliary/GraphemeBreakProperty.txt
      //and adapted to JavaScript rules

      if (
        (0x0600 <= code && code <= 0x0605) || // Cf   [6] ARABIC NUMBER SIGN..ARABIC NUMBER MARK ABOVE
        0x06dd == code || // Cf       ARABIC END OF AYAH
        0x070f == code || // Cf       SYRIAC ABBREVIATION MARK
        0x08e2 == code || // Cf       ARABIC DISPUTED END OF AYAH
        0x0d4e == code || // Lo       MALAYALAM LETTER DOT REPH
        0x110bd == code || // Cf       KAITHI NUMBER SIGN
        (0x111c2 <= code && code <= 0x111c3) || // Lo   [2] SHARADA SIGN JIHVAMULIYA..SHARADA SIGN UPADHMANIYA
        0x11a3a == code || // Lo       ZANABAZAR SQUARE CLUSTER-INITIAL LETTER RA
        (0x11a86 <= code && code <= 0x11a89) || // Lo   [4] SOYOMBO CLUSTER-INITIAL LETTER RA..SOYOMBO CLUSTER-INITIAL LETTER SA
        0x11d46 == code // Lo       MASARAM GONDI REPHA
      ) {
        return Prepend;
      }
      if (
        0x000d == code // Cc       <control-000D>
      ) {
        return CR;
      }

      if (
        0x000a == code // Cc       <control-000A>
      ) {
        return LF;
      }

      if (
        (0x0000 <= code && code <= 0x0009) || // Cc  [10] <control-0000>..<control-0009>
        (0x000b <= code && code <= 0x000c) || // Cc   [2] <control-000B>..<control-000C>
        (0x000e <= code && code <= 0x001f) || // Cc  [18] <control-000E>..<control-001F>
        (0x007f <= code && code <= 0x009f) || // Cc  [33] <control-007F>..<control-009F>
        0x00ad == code || // Cf       SOFT HYPHEN
        0x061c == code || // Cf       ARABIC LETTER MARK
        0x180e == code || // Cf       MONGOLIAN VOWEL SEPARATOR
        0x200b == code || // Cf       ZERO WIDTH SPACE
        (0x200e <= code && code <= 0x200f) || // Cf   [2] LEFT-TO-RIGHT MARK..RIGHT-TO-LEFT MARK
        0x2028 == code || // Zl       LINE SEPARATOR
        0x2029 == code || // Zp       PARAGRAPH SEPARATOR
        (0x202a <= code && code <= 0x202e) || // Cf   [5] LEFT-TO-RIGHT EMBEDDING..RIGHT-TO-LEFT OVERRIDE
        (0x2060 <= code && code <= 0x2064) || // Cf   [5] WORD JOINER..INVISIBLE PLUS
        0x2065 == code || // Cn       <reserved-2065>
        (0x2066 <= code && code <= 0x206f) || // Cf  [10] LEFT-TO-RIGHT ISOLATE..NOMINAL DIGIT SHAPES
        (0xd800 <= code && code <= 0xdfff) || // Cs [2048] <surrogate-D800>..<surrogate-DFFF>
        0xfeff == code || // Cf       ZERO WIDTH NO-BREAK SPACE
        (0xfff0 <= code && code <= 0xfff8) || // Cn   [9] <reserved-FFF0>..<reserved-FFF8>
        (0xfff9 <= code && code <= 0xfffb) || // Cf   [3] INTERLINEAR ANNOTATION ANCHOR..INTERLINEAR ANNOTATION TERMINATOR
        (0x1bca0 <= code && code <= 0x1bca3) || // Cf   [4] SHORTHAND FORMAT LETTER OVERLAP..SHORTHAND FORMAT UP STEP
        (0x1d173 <= code && code <= 0x1d17a) || // Cf   [8] MUSICAL SYMBOL BEGIN BEAM..MUSICAL SYMBOL END PHRASE
        0xe0000 == code || // Cn       <reserved-E0000>
        0xe0001 == code || // Cf       LANGUAGE TAG
        (0xe0002 <= code && code <= 0xe001f) || // Cn  [30] <reserved-E0002>..<reserved-E001F>
        (0xe0080 <= code && code <= 0xe00ff) || // Cn [128] <reserved-E0080>..<reserved-E00FF>
        (0xe01f0 <= code && code <= 0xe0fff) // Cn [3600] <reserved-E01F0>..<reserved-E0FFF>
      ) {
        return Control;
      }

      if (
        (0x0300 <= code && code <= 0x036f) || // Mn [112] COMBINING GRAVE ACCENT..COMBINING LATIN SMALL LETTER X
        (0x0483 <= code && code <= 0x0487) || // Mn   [5] COMBINING CYRILLIC TITLO..COMBINING CYRILLIC POKRYTIE
        (0x0488 <= code && code <= 0x0489) || // Me   [2] COMBINING CYRILLIC HUNDRED THOUSANDS SIGN..COMBINING CYRILLIC MILLIONS SIGN
        (0x0591 <= code && code <= 0x05bd) || // Mn  [45] HEBREW ACCENT ETNAHTA..HEBREW POINT METEG
        0x05bf == code || // Mn       HEBREW POINT RAFE
        (0x05c1 <= code && code <= 0x05c2) || // Mn   [2] HEBREW POINT SHIN DOT..HEBREW POINT SIN DOT
        (0x05c4 <= code && code <= 0x05c5) || // Mn   [2] HEBREW MARK UPPER DOT..HEBREW MARK LOWER DOT
        0x05c7 == code || // Mn       HEBREW POINT QAMATS QATAN
        (0x0610 <= code && code <= 0x061a) || // Mn  [11] ARABIC SIGN SALLALLAHOU ALAYHE WASSALLAM..ARABIC SMALL KASRA
        (0x064b <= code && code <= 0x065f) || // Mn  [21] ARABIC FATHATAN..ARABIC WAVY HAMZA BELOW
        0x0670 == code || // Mn       ARABIC LETTER SUPERSCRIPT ALEF
        (0x06d6 <= code && code <= 0x06dc) || // Mn   [7] ARABIC SMALL HIGH LIGATURE SAD WITH LAM WITH ALEF MAKSURA..ARABIC SMALL HIGH SEEN
        (0x06df <= code && code <= 0x06e4) || // Mn   [6] ARABIC SMALL HIGH ROUNDED ZERO..ARABIC SMALL HIGH MADDA
        (0x06e7 <= code && code <= 0x06e8) || // Mn   [2] ARABIC SMALL HIGH YEH..ARABIC SMALL HIGH NOON
        (0x06ea <= code && code <= 0x06ed) || // Mn   [4] ARABIC EMPTY CENTRE LOW STOP..ARABIC SMALL LOW MEEM
        0x0711 == code || // Mn       SYRIAC LETTER SUPERSCRIPT ALAPH
        (0x0730 <= code && code <= 0x074a) || // Mn  [27] SYRIAC PTHAHA ABOVE..SYRIAC BARREKH
        (0x07a6 <= code && code <= 0x07b0) || // Mn  [11] THAANA ABAFILI..THAANA SUKUN
        (0x07eb <= code && code <= 0x07f3) || // Mn   [9] NKO COMBINING SHORT HIGH TONE..NKO COMBINING DOUBLE DOT ABOVE
        (0x0816 <= code && code <= 0x0819) || // Mn   [4] SAMARITAN MARK IN..SAMARITAN MARK DAGESH
        (0x081b <= code && code <= 0x0823) || // Mn   [9] SAMARITAN MARK EPENTHETIC YUT..SAMARITAN VOWEL SIGN A
        (0x0825 <= code && code <= 0x0827) || // Mn   [3] SAMARITAN VOWEL SIGN SHORT A..SAMARITAN VOWEL SIGN U
        (0x0829 <= code && code <= 0x082d) || // Mn   [5] SAMARITAN VOWEL SIGN LONG I..SAMARITAN MARK NEQUDAA
        (0x0859 <= code && code <= 0x085b) || // Mn   [3] MANDAIC AFFRICATION MARK..MANDAIC GEMINATION MARK
        (0x08d4 <= code && code <= 0x08e1) || // Mn  [14] ARABIC SMALL HIGH WORD AR-RUB..ARABIC SMALL HIGH SIGN SAFHA
        (0x08e3 <= code && code <= 0x0902) || // Mn  [32] ARABIC TURNED DAMMA BELOW..DEVANAGARI SIGN ANUSVARA
        0x093a == code || // Mn       DEVANAGARI VOWEL SIGN OE
        0x093c == code || // Mn       DEVANAGARI SIGN NUKTA
        (0x0941 <= code && code <= 0x0948) || // Mn   [8] DEVANAGARI VOWEL SIGN U..DEVANAGARI VOWEL SIGN AI
        0x094d == code || // Mn       DEVANAGARI SIGN VIRAMA
        (0x0951 <= code && code <= 0x0957) || // Mn   [7] DEVANAGARI STRESS SIGN UDATTA..DEVANAGARI VOWEL SIGN UUE
        (0x0962 <= code && code <= 0x0963) || // Mn   [2] DEVANAGARI VOWEL SIGN VOCALIC L..DEVANAGARI VOWEL SIGN VOCALIC LL
        0x0981 == code || // Mn       BENGALI SIGN CANDRABINDU
        0x09bc == code || // Mn       BENGALI SIGN NUKTA
        0x09be == code || // Mc       BENGALI VOWEL SIGN AA
        (0x09c1 <= code && code <= 0x09c4) || // Mn   [4] BENGALI VOWEL SIGN U..BENGALI VOWEL SIGN VOCALIC RR
        0x09cd == code || // Mn       BENGALI SIGN VIRAMA
        0x09d7 == code || // Mc       BENGALI AU LENGTH MARK
        (0x09e2 <= code && code <= 0x09e3) || // Mn   [2] BENGALI VOWEL SIGN VOCALIC L..BENGALI VOWEL SIGN VOCALIC LL
        (0x0a01 <= code && code <= 0x0a02) || // Mn   [2] GURMUKHI SIGN ADAK BINDI..GURMUKHI SIGN BINDI
        0x0a3c == code || // Mn       GURMUKHI SIGN NUKTA
        (0x0a41 <= code && code <= 0x0a42) || // Mn   [2] GURMUKHI VOWEL SIGN U..GURMUKHI VOWEL SIGN UU
        (0x0a47 <= code && code <= 0x0a48) || // Mn   [2] GURMUKHI VOWEL SIGN EE..GURMUKHI VOWEL SIGN AI
        (0x0a4b <= code && code <= 0x0a4d) || // Mn   [3] GURMUKHI VOWEL SIGN OO..GURMUKHI SIGN VIRAMA
        0x0a51 == code || // Mn       GURMUKHI SIGN UDAAT
        (0x0a70 <= code && code <= 0x0a71) || // Mn   [2] GURMUKHI TIPPI..GURMUKHI ADDAK
        0x0a75 == code || // Mn       GURMUKHI SIGN YAKASH
        (0x0a81 <= code && code <= 0x0a82) || // Mn   [2] GUJARATI SIGN CANDRABINDU..GUJARATI SIGN ANUSVARA
        0x0abc == code || // Mn       GUJARATI SIGN NUKTA
        (0x0ac1 <= code && code <= 0x0ac5) || // Mn   [5] GUJARATI VOWEL SIGN U..GUJARATI VOWEL SIGN CANDRA E
        (0x0ac7 <= code && code <= 0x0ac8) || // Mn   [2] GUJARATI VOWEL SIGN E..GUJARATI VOWEL SIGN AI
        0x0acd == code || // Mn       GUJARATI SIGN VIRAMA
        (0x0ae2 <= code && code <= 0x0ae3) || // Mn   [2] GUJARATI VOWEL SIGN VOCALIC L..GUJARATI VOWEL SIGN VOCALIC LL
        (0x0afa <= code && code <= 0x0aff) || // Mn   [6] GUJARATI SIGN SUKUN..GUJARATI SIGN TWO-CIRCLE NUKTA ABOVE
        0x0b01 == code || // Mn       ORIYA SIGN CANDRABINDU
        0x0b3c == code || // Mn       ORIYA SIGN NUKTA
        0x0b3e == code || // Mc       ORIYA VOWEL SIGN AA
        0x0b3f == code || // Mn       ORIYA VOWEL SIGN I
        (0x0b41 <= code && code <= 0x0b44) || // Mn   [4] ORIYA VOWEL SIGN U..ORIYA VOWEL SIGN VOCALIC RR
        0x0b4d == code || // Mn       ORIYA SIGN VIRAMA
        0x0b56 == code || // Mn       ORIYA AI LENGTH MARK
        0x0b57 == code || // Mc       ORIYA AU LENGTH MARK
        (0x0b62 <= code && code <= 0x0b63) || // Mn   [2] ORIYA VOWEL SIGN VOCALIC L..ORIYA VOWEL SIGN VOCALIC LL
        0x0b82 == code || // Mn       TAMIL SIGN ANUSVARA
        0x0bbe == code || // Mc       TAMIL VOWEL SIGN AA
        0x0bc0 == code || // Mn       TAMIL VOWEL SIGN II
        0x0bcd == code || // Mn       TAMIL SIGN VIRAMA
        0x0bd7 == code || // Mc       TAMIL AU LENGTH MARK
        0x0c00 == code || // Mn       TELUGU SIGN COMBINING CANDRABINDU ABOVE
        (0x0c3e <= code && code <= 0x0c40) || // Mn   [3] TELUGU VOWEL SIGN AA..TELUGU VOWEL SIGN II
        (0x0c46 <= code && code <= 0x0c48) || // Mn   [3] TELUGU VOWEL SIGN E..TELUGU VOWEL SIGN AI
        (0x0c4a <= code && code <= 0x0c4d) || // Mn   [4] TELUGU VOWEL SIGN O..TELUGU SIGN VIRAMA
        (0x0c55 <= code && code <= 0x0c56) || // Mn   [2] TELUGU LENGTH MARK..TELUGU AI LENGTH MARK
        (0x0c62 <= code && code <= 0x0c63) || // Mn   [2] TELUGU VOWEL SIGN VOCALIC L..TELUGU VOWEL SIGN VOCALIC LL
        0x0c81 == code || // Mn       KANNADA SIGN CANDRABINDU
        0x0cbc == code || // Mn       KANNADA SIGN NUKTA
        0x0cbf == code || // Mn       KANNADA VOWEL SIGN I
        0x0cc2 == code || // Mc       KANNADA VOWEL SIGN UU
        0x0cc6 == code || // Mn       KANNADA VOWEL SIGN E
        (0x0ccc <= code && code <= 0x0ccd) || // Mn   [2] KANNADA VOWEL SIGN AU..KANNADA SIGN VIRAMA
        (0x0cd5 <= code && code <= 0x0cd6) || // Mc   [2] KANNADA LENGTH MARK..KANNADA AI LENGTH MARK
        (0x0ce2 <= code && code <= 0x0ce3) || // Mn   [2] KANNADA VOWEL SIGN VOCALIC L..KANNADA VOWEL SIGN VOCALIC LL
        (0x0d00 <= code && code <= 0x0d01) || // Mn   [2] MALAYALAM SIGN COMBINING ANUSVARA ABOVE..MALAYALAM SIGN CANDRABINDU
        (0x0d3b <= code && code <= 0x0d3c) || // Mn   [2] MALAYALAM SIGN VERTICAL BAR VIRAMA..MALAYALAM SIGN CIRCULAR VIRAMA
        0x0d3e == code || // Mc       MALAYALAM VOWEL SIGN AA
        (0x0d41 <= code && code <= 0x0d44) || // Mn   [4] MALAYALAM VOWEL SIGN U..MALAYALAM VOWEL SIGN VOCALIC RR
        0x0d4d == code || // Mn       MALAYALAM SIGN VIRAMA
        0x0d57 == code || // Mc       MALAYALAM AU LENGTH MARK
        (0x0d62 <= code && code <= 0x0d63) || // Mn   [2] MALAYALAM VOWEL SIGN VOCALIC L..MALAYALAM VOWEL SIGN VOCALIC LL
        0x0dca == code || // Mn       SINHALA SIGN AL-LAKUNA
        0x0dcf == code || // Mc       SINHALA VOWEL SIGN AELA-PILLA
        (0x0dd2 <= code && code <= 0x0dd4) || // Mn   [3] SINHALA VOWEL SIGN KETTI IS-PILLA..SINHALA VOWEL SIGN KETTI PAA-PILLA
        0x0dd6 == code || // Mn       SINHALA VOWEL SIGN DIGA PAA-PILLA
        0x0ddf == code || // Mc       SINHALA VOWEL SIGN GAYANUKITTA
        0x0e31 == code || // Mn       THAI CHARACTER MAI HAN-AKAT
        (0x0e34 <= code && code <= 0x0e3a) || // Mn   [7] THAI CHARACTER SARA I..THAI CHARACTER PHINTHU
        (0x0e47 <= code && code <= 0x0e4e) || // Mn   [8] THAI CHARACTER MAITAIKHU..THAI CHARACTER YAMAKKAN
        0x0eb1 == code || // Mn       LAO VOWEL SIGN MAI KAN
        (0x0eb4 <= code && code <= 0x0eb9) || // Mn   [6] LAO VOWEL SIGN I..LAO VOWEL SIGN UU
        (0x0ebb <= code && code <= 0x0ebc) || // Mn   [2] LAO VOWEL SIGN MAI KON..LAO SEMIVOWEL SIGN LO
        (0x0ec8 <= code && code <= 0x0ecd) || // Mn   [6] LAO TONE MAI EK..LAO NIGGAHITA
        (0x0f18 <= code && code <= 0x0f19) || // Mn   [2] TIBETAN ASTROLOGICAL SIGN -KHYUD PA..TIBETAN ASTROLOGICAL SIGN SDONG TSHUGS
        0x0f35 == code || // Mn       TIBETAN MARK NGAS BZUNG NYI ZLA
        0x0f37 == code || // Mn       TIBETAN MARK NGAS BZUNG SGOR RTAGS
        0x0f39 == code || // Mn       TIBETAN MARK TSA -PHRU
        (0x0f71 <= code && code <= 0x0f7e) || // Mn  [14] TIBETAN VOWEL SIGN AA..TIBETAN SIGN RJES SU NGA RO
        (0x0f80 <= code && code <= 0x0f84) || // Mn   [5] TIBETAN VOWEL SIGN REVERSED I..TIBETAN MARK HALANTA
        (0x0f86 <= code && code <= 0x0f87) || // Mn   [2] TIBETAN SIGN LCI RTAGS..TIBETAN SIGN YANG RTAGS
        (0x0f8d <= code && code <= 0x0f97) || // Mn  [11] TIBETAN SUBJOINED SIGN LCE TSA CAN..TIBETAN SUBJOINED LETTER JA
        (0x0f99 <= code && code <= 0x0fbc) || // Mn  [36] TIBETAN SUBJOINED LETTER NYA..TIBETAN SUBJOINED LETTER FIXED-FORM RA
        0x0fc6 == code || // Mn       TIBETAN SYMBOL PADMA GDAN
        (0x102d <= code && code <= 0x1030) || // Mn   [4] MYANMAR VOWEL SIGN I..MYANMAR VOWEL SIGN UU
        (0x1032 <= code && code <= 0x1037) || // Mn   [6] MYANMAR VOWEL SIGN AI..MYANMAR SIGN DOT BELOW
        (0x1039 <= code && code <= 0x103a) || // Mn   [2] MYANMAR SIGN VIRAMA..MYANMAR SIGN ASAT
        (0x103d <= code && code <= 0x103e) || // Mn   [2] MYANMAR CONSONANT SIGN MEDIAL WA..MYANMAR CONSONANT SIGN MEDIAL HA
        (0x1058 <= code && code <= 0x1059) || // Mn   [2] MYANMAR VOWEL SIGN VOCALIC L..MYANMAR VOWEL SIGN VOCALIC LL
        (0x105e <= code && code <= 0x1060) || // Mn   [3] MYANMAR CONSONANT SIGN MON MEDIAL NA..MYANMAR CONSONANT SIGN MON MEDIAL LA
        (0x1071 <= code && code <= 0x1074) || // Mn   [4] MYANMAR VOWEL SIGN GEBA KAREN I..MYANMAR VOWEL SIGN KAYAH EE
        0x1082 == code || // Mn       MYANMAR CONSONANT SIGN SHAN MEDIAL WA
        (0x1085 <= code && code <= 0x1086) || // Mn   [2] MYANMAR VOWEL SIGN SHAN E ABOVE..MYANMAR VOWEL SIGN SHAN FINAL Y
        0x108d == code || // Mn       MYANMAR SIGN SHAN COUNCIL EMPHATIC TONE
        0x109d == code || // Mn       MYANMAR VOWEL SIGN AITON AI
        (0x135d <= code && code <= 0x135f) || // Mn   [3] ETHIOPIC COMBINING GEMINATION AND VOWEL LENGTH MARK..ETHIOPIC COMBINING GEMINATION MARK
        (0x1712 <= code && code <= 0x1714) || // Mn   [3] TAGALOG VOWEL SIGN I..TAGALOG SIGN VIRAMA
        (0x1732 <= code && code <= 0x1734) || // Mn   [3] HANUNOO VOWEL SIGN I..HANUNOO SIGN PAMUDPOD
        (0x1752 <= code && code <= 0x1753) || // Mn   [2] BUHID VOWEL SIGN I..BUHID VOWEL SIGN U
        (0x1772 <= code && code <= 0x1773) || // Mn   [2] TAGBANWA VOWEL SIGN I..TAGBANWA VOWEL SIGN U
        (0x17b4 <= code && code <= 0x17b5) || // Mn   [2] KHMER VOWEL INHERENT AQ..KHMER VOWEL INHERENT AA
        (0x17b7 <= code && code <= 0x17bd) || // Mn   [7] KHMER VOWEL SIGN I..KHMER VOWEL SIGN UA
        0x17c6 == code || // Mn       KHMER SIGN NIKAHIT
        (0x17c9 <= code && code <= 0x17d3) || // Mn  [11] KHMER SIGN MUUSIKATOAN..KHMER SIGN BATHAMASAT
        0x17dd == code || // Mn       KHMER SIGN ATTHACAN
        (0x180b <= code && code <= 0x180d) || // Mn   [3] MONGOLIAN FREE VARIATION SELECTOR ONE..MONGOLIAN FREE VARIATION SELECTOR THREE
        (0x1885 <= code && code <= 0x1886) || // Mn   [2] MONGOLIAN LETTER ALI GALI BALUDA..MONGOLIAN LETTER ALI GALI THREE BALUDA
        0x18a9 == code || // Mn       MONGOLIAN LETTER ALI GALI DAGALGA
        (0x1920 <= code && code <= 0x1922) || // Mn   [3] LIMBU VOWEL SIGN A..LIMBU VOWEL SIGN U
        (0x1927 <= code && code <= 0x1928) || // Mn   [2] LIMBU VOWEL SIGN E..LIMBU VOWEL SIGN O
        0x1932 == code || // Mn       LIMBU SMALL LETTER ANUSVARA
        (0x1939 <= code && code <= 0x193b) || // Mn   [3] LIMBU SIGN MUKPHRENG..LIMBU SIGN SA-I
        (0x1a17 <= code && code <= 0x1a18) || // Mn   [2] BUGINESE VOWEL SIGN I..BUGINESE VOWEL SIGN U
        0x1a1b == code || // Mn       BUGINESE VOWEL SIGN AE
        0x1a56 == code || // Mn       TAI THAM CONSONANT SIGN MEDIAL LA
        (0x1a58 <= code && code <= 0x1a5e) || // Mn   [7] TAI THAM SIGN MAI KANG LAI..TAI THAM CONSONANT SIGN SA
        0x1a60 == code || // Mn       TAI THAM SIGN SAKOT
        0x1a62 == code || // Mn       TAI THAM VOWEL SIGN MAI SAT
        (0x1a65 <= code && code <= 0x1a6c) || // Mn   [8] TAI THAM VOWEL SIGN I..TAI THAM VOWEL SIGN OA BELOW
        (0x1a73 <= code && code <= 0x1a7c) || // Mn  [10] TAI THAM VOWEL SIGN OA ABOVE..TAI THAM SIGN KHUEN-LUE KARAN
        0x1a7f == code || // Mn       TAI THAM COMBINING CRYPTOGRAMMIC DOT
        (0x1ab0 <= code && code <= 0x1abd) || // Mn  [14] COMBINING DOUBLED CIRCUMFLEX ACCENT..COMBINING PARENTHESES BELOW
        0x1abe == code || // Me       COMBINING PARENTHESES OVERLAY
        (0x1b00 <= code && code <= 0x1b03) || // Mn   [4] BALINESE SIGN ULU RICEM..BALINESE SIGN SURANG
        0x1b34 == code || // Mn       BALINESE SIGN REREKAN
        (0x1b36 <= code && code <= 0x1b3a) || // Mn   [5] BALINESE VOWEL SIGN ULU..BALINESE VOWEL SIGN RA REPA
        0x1b3c == code || // Mn       BALINESE VOWEL SIGN LA LENGA
        0x1b42 == code || // Mn       BALINESE VOWEL SIGN PEPET
        (0x1b6b <= code && code <= 0x1b73) || // Mn   [9] BALINESE MUSICAL SYMBOL COMBINING TEGEH..BALINESE MUSICAL SYMBOL COMBINING GONG
        (0x1b80 <= code && code <= 0x1b81) || // Mn   [2] SUNDANESE SIGN PANYECEK..SUNDANESE SIGN PANGLAYAR
        (0x1ba2 <= code && code <= 0x1ba5) || // Mn   [4] SUNDANESE CONSONANT SIGN PANYAKRA..SUNDANESE VOWEL SIGN PANYUKU
        (0x1ba8 <= code && code <= 0x1ba9) || // Mn   [2] SUNDANESE VOWEL SIGN PAMEPET..SUNDANESE VOWEL SIGN PANEULEUNG
        (0x1bab <= code && code <= 0x1bad) || // Mn   [3] SUNDANESE SIGN VIRAMA..SUNDANESE CONSONANT SIGN PASANGAN WA
        0x1be6 == code || // Mn       BATAK SIGN TOMPI
        (0x1be8 <= code && code <= 0x1be9) || // Mn   [2] BATAK VOWEL SIGN PAKPAK E..BATAK VOWEL SIGN EE
        0x1bed == code || // Mn       BATAK VOWEL SIGN KARO O
        (0x1bef <= code && code <= 0x1bf1) || // Mn   [3] BATAK VOWEL SIGN U FOR SIMALUNGUN SA..BATAK CONSONANT SIGN H
        (0x1c2c <= code && code <= 0x1c33) || // Mn   [8] LEPCHA VOWEL SIGN E..LEPCHA CONSONANT SIGN T
        (0x1c36 <= code && code <= 0x1c37) || // Mn   [2] LEPCHA SIGN RAN..LEPCHA SIGN NUKTA
        (0x1cd0 <= code && code <= 0x1cd2) || // Mn   [3] VEDIC TONE KARSHANA..VEDIC TONE PRENKHA
        (0x1cd4 <= code && code <= 0x1ce0) || // Mn  [13] VEDIC SIGN YAJURVEDIC MIDLINE SVARITA..VEDIC TONE RIGVEDIC KASHMIRI INDEPENDENT SVARITA
        (0x1ce2 <= code && code <= 0x1ce8) || // Mn   [7] VEDIC SIGN VISARGA SVARITA..VEDIC SIGN VISARGA ANUDATTA WITH TAIL
        0x1ced == code || // Mn       VEDIC SIGN TIRYAK
        0x1cf4 == code || // Mn       VEDIC TONE CANDRA ABOVE
        (0x1cf8 <= code && code <= 0x1cf9) || // Mn   [2] VEDIC TONE RING ABOVE..VEDIC TONE DOUBLE RING ABOVE
        (0x1dc0 <= code && code <= 0x1df9) || // Mn  [58] COMBINING DOTTED GRAVE ACCENT..COMBINING WIDE INVERTED BRIDGE BELOW
        (0x1dfb <= code && code <= 0x1dff) || // Mn   [5] COMBINING DELETION MARK..COMBINING RIGHT ARROWHEAD AND DOWN ARROWHEAD BELOW
        0x200c == code || // Cf       ZERO WIDTH NON-JOINER
        (0x20d0 <= code && code <= 0x20dc) || // Mn  [13] COMBINING LEFT HARPOON ABOVE..COMBINING FOUR DOTS ABOVE
        (0x20dd <= code && code <= 0x20e0) || // Me   [4] COMBINING ENCLOSING CIRCLE..COMBINING ENCLOSING CIRCLE BACKSLASH
        0x20e1 == code || // Mn       COMBINING LEFT RIGHT ARROW ABOVE
        (0x20e2 <= code && code <= 0x20e4) || // Me   [3] COMBINING ENCLOSING SCREEN..COMBINING ENCLOSING UPWARD POINTING TRIANGLE
        (0x20e5 <= code && code <= 0x20f0) || // Mn  [12] COMBINING REVERSE SOLIDUS OVERLAY..COMBINING ASTERISK ABOVE
        (0x2cef <= code && code <= 0x2cf1) || // Mn   [3] COPTIC COMBINING NI ABOVE..COPTIC COMBINING SPIRITUS LENIS
        0x2d7f == code || // Mn       TIFINAGH CONSONANT JOINER
        (0x2de0 <= code && code <= 0x2dff) || // Mn  [32] COMBINING CYRILLIC LETTER BE..COMBINING CYRILLIC LETTER IOTIFIED BIG YUS
        (0x302a <= code && code <= 0x302d) || // Mn   [4] IDEOGRAPHIC LEVEL TONE MARK..IDEOGRAPHIC ENTERING TONE MARK
        (0x302e <= code && code <= 0x302f) || // Mc   [2] HANGUL SINGLE DOT TONE MARK..HANGUL DOUBLE DOT TONE MARK
        (0x3099 <= code && code <= 0x309a) || // Mn   [2] COMBINING KATAKANA-HIRAGANA VOICED SOUND MARK..COMBINING KATAKANA-HIRAGANA SEMI-VOICED SOUND MARK
        0xa66f == code || // Mn       COMBINING CYRILLIC VZMET
        (0xa670 <= code && code <= 0xa672) || // Me   [3] COMBINING CYRILLIC TEN MILLIONS SIGN..COMBINING CYRILLIC THOUSAND MILLIONS SIGN
        (0xa674 <= code && code <= 0xa67d) || // Mn  [10] COMBINING CYRILLIC LETTER UKRAINIAN IE..COMBINING CYRILLIC PAYEROK
        (0xa69e <= code && code <= 0xa69f) || // Mn   [2] COMBINING CYRILLIC LETTER EF..COMBINING CYRILLIC LETTER IOTIFIED E
        (0xa6f0 <= code && code <= 0xa6f1) || // Mn   [2] BAMUM COMBINING MARK KOQNDON..BAMUM COMBINING MARK TUKWENTIS
        0xa802 == code || // Mn       SYLOTI NAGRI SIGN DVISVARA
        0xa806 == code || // Mn       SYLOTI NAGRI SIGN HASANTA
        0xa80b == code || // Mn       SYLOTI NAGRI SIGN ANUSVARA
        (0xa825 <= code && code <= 0xa826) || // Mn   [2] SYLOTI NAGRI VOWEL SIGN U..SYLOTI NAGRI VOWEL SIGN E
        (0xa8c4 <= code && code <= 0xa8c5) || // Mn   [2] SAURASHTRA SIGN VIRAMA..SAURASHTRA SIGN CANDRABINDU
        (0xa8e0 <= code && code <= 0xa8f1) || // Mn  [18] COMBINING DEVANAGARI DIGIT ZERO..COMBINING DEVANAGARI SIGN AVAGRAHA
        (0xa926 <= code && code <= 0xa92d) || // Mn   [8] KAYAH LI VOWEL UE..KAYAH LI TONE CALYA PLOPHU
        (0xa947 <= code && code <= 0xa951) || // Mn  [11] REJANG VOWEL SIGN I..REJANG CONSONANT SIGN R
        (0xa980 <= code && code <= 0xa982) || // Mn   [3] JAVANESE SIGN PANYANGGA..JAVANESE SIGN LAYAR
        0xa9b3 == code || // Mn       JAVANESE SIGN CECAK TELU
        (0xa9b6 <= code && code <= 0xa9b9) || // Mn   [4] JAVANESE VOWEL SIGN WULU..JAVANESE VOWEL SIGN SUKU MENDUT
        0xa9bc == code || // Mn       JAVANESE VOWEL SIGN PEPET
        0xa9e5 == code || // Mn       MYANMAR SIGN SHAN SAW
        (0xaa29 <= code && code <= 0xaa2e) || // Mn   [6] CHAM VOWEL SIGN AA..CHAM VOWEL SIGN OE
        (0xaa31 <= code && code <= 0xaa32) || // Mn   [2] CHAM VOWEL SIGN AU..CHAM VOWEL SIGN UE
        (0xaa35 <= code && code <= 0xaa36) || // Mn   [2] CHAM CONSONANT SIGN LA..CHAM CONSONANT SIGN WA
        0xaa43 == code || // Mn       CHAM CONSONANT SIGN FINAL NG
        0xaa4c == code || // Mn       CHAM CONSONANT SIGN FINAL M
        0xaa7c == code || // Mn       MYANMAR SIGN TAI LAING TONE-2
        0xaab0 == code || // Mn       TAI VIET MAI KANG
        (0xaab2 <= code && code <= 0xaab4) || // Mn   [3] TAI VIET VOWEL I..TAI VIET VOWEL U
        (0xaab7 <= code && code <= 0xaab8) || // Mn   [2] TAI VIET MAI KHIT..TAI VIET VOWEL IA
        (0xaabe <= code && code <= 0xaabf) || // Mn   [2] TAI VIET VOWEL AM..TAI VIET TONE MAI EK
        0xaac1 == code || // Mn       TAI VIET TONE MAI THO
        (0xaaec <= code && code <= 0xaaed) || // Mn   [2] MEETEI MAYEK VOWEL SIGN UU..MEETEI MAYEK VOWEL SIGN AAI
        0xaaf6 == code || // Mn       MEETEI MAYEK VIRAMA
        0xabe5 == code || // Mn       MEETEI MAYEK VOWEL SIGN ANAP
        0xabe8 == code || // Mn       MEETEI MAYEK VOWEL SIGN UNAP
        0xabed == code || // Mn       MEETEI MAYEK APUN IYEK
        0xfb1e == code || // Mn       HEBREW POINT JUDEO-SPANISH VARIKA
        (0xfe00 <= code && code <= 0xfe0f) || // Mn  [16] VARIATION SELECTOR-1..VARIATION SELECTOR-16
        (0xfe20 <= code && code <= 0xfe2f) || // Mn  [16] COMBINING LIGATURE LEFT HALF..COMBINING CYRILLIC TITLO RIGHT HALF
        (0xff9e <= code && code <= 0xff9f) || // Lm   [2] HALFWIDTH KATAKANA VOICED SOUND MARK..HALFWIDTH KATAKANA SEMI-VOICED SOUND MARK
        0x101fd == code || // Mn       PHAISTOS DISC SIGN COMBINING OBLIQUE STROKE
        0x102e0 == code || // Mn       COPTIC EPACT THOUSANDS MARK
        (0x10376 <= code && code <= 0x1037a) || // Mn   [5] COMBINING OLD PERMIC LETTER AN..COMBINING OLD PERMIC LETTER SII
        (0x10a01 <= code && code <= 0x10a03) || // Mn   [3] KHAROSHTHI VOWEL SIGN I..KHAROSHTHI VOWEL SIGN VOCALIC R
        (0x10a05 <= code && code <= 0x10a06) || // Mn   [2] KHAROSHTHI VOWEL SIGN E..KHAROSHTHI VOWEL SIGN O
        (0x10a0c <= code && code <= 0x10a0f) || // Mn   [4] KHAROSHTHI VOWEL LENGTH MARK..KHAROSHTHI SIGN VISARGA
        (0x10a38 <= code && code <= 0x10a3a) || // Mn   [3] KHAROSHTHI SIGN BAR ABOVE..KHAROSHTHI SIGN DOT BELOW
        0x10a3f == code || // Mn       KHAROSHTHI VIRAMA
        (0x10ae5 <= code && code <= 0x10ae6) || // Mn   [2] MANICHAEAN ABBREVIATION MARK ABOVE..MANICHAEAN ABBREVIATION MARK BELOW
        0x11001 == code || // Mn       BRAHMI SIGN ANUSVARA
        (0x11038 <= code && code <= 0x11046) || // Mn  [15] BRAHMI VOWEL SIGN AA..BRAHMI VIRAMA
        (0x1107f <= code && code <= 0x11081) || // Mn   [3] BRAHMI NUMBER JOINER..KAITHI SIGN ANUSVARA
        (0x110b3 <= code && code <= 0x110b6) || // Mn   [4] KAITHI VOWEL SIGN U..KAITHI VOWEL SIGN AI
        (0x110b9 <= code && code <= 0x110ba) || // Mn   [2] KAITHI SIGN VIRAMA..KAITHI SIGN NUKTA
        (0x11100 <= code && code <= 0x11102) || // Mn   [3] CHAKMA SIGN CANDRABINDU..CHAKMA SIGN VISARGA
        (0x11127 <= code && code <= 0x1112b) || // Mn   [5] CHAKMA VOWEL SIGN A..CHAKMA VOWEL SIGN UU
        (0x1112d <= code && code <= 0x11134) || // Mn   [8] CHAKMA VOWEL SIGN AI..CHAKMA MAAYYAA
        0x11173 == code || // Mn       MAHAJANI SIGN NUKTA
        (0x11180 <= code && code <= 0x11181) || // Mn   [2] SHARADA SIGN CANDRABINDU..SHARADA SIGN ANUSVARA
        (0x111b6 <= code && code <= 0x111be) || // Mn   [9] SHARADA VOWEL SIGN U..SHARADA VOWEL SIGN O
        (0x111ca <= code && code <= 0x111cc) || // Mn   [3] SHARADA SIGN NUKTA..SHARADA EXTRA SHORT VOWEL MARK
        (0x1122f <= code && code <= 0x11231) || // Mn   [3] KHOJKI VOWEL SIGN U..KHOJKI VOWEL SIGN AI
        0x11234 == code || // Mn       KHOJKI SIGN ANUSVARA
        (0x11236 <= code && code <= 0x11237) || // Mn   [2] KHOJKI SIGN NUKTA..KHOJKI SIGN SHADDA
        0x1123e == code || // Mn       KHOJKI SIGN SUKUN
        0x112df == code || // Mn       KHUDAWADI SIGN ANUSVARA
        (0x112e3 <= code && code <= 0x112ea) || // Mn   [8] KHUDAWADI VOWEL SIGN U..KHUDAWADI SIGN VIRAMA
        (0x11300 <= code && code <= 0x11301) || // Mn   [2] GRANTHA SIGN COMBINING ANUSVARA ABOVE..GRANTHA SIGN CANDRABINDU
        0x1133c == code || // Mn       GRANTHA SIGN NUKTA
        0x1133e == code || // Mc       GRANTHA VOWEL SIGN AA
        0x11340 == code || // Mn       GRANTHA VOWEL SIGN II
        0x11357 == code || // Mc       GRANTHA AU LENGTH MARK
        (0x11366 <= code && code <= 0x1136c) || // Mn   [7] COMBINING GRANTHA DIGIT ZERO..COMBINING GRANTHA DIGIT SIX
        (0x11370 <= code && code <= 0x11374) || // Mn   [5] COMBINING GRANTHA LETTER A..COMBINING GRANTHA LETTER PA
        (0x11438 <= code && code <= 0x1143f) || // Mn   [8] NEWA VOWEL SIGN U..NEWA VOWEL SIGN AI
        (0x11442 <= code && code <= 0x11444) || // Mn   [3] NEWA SIGN VIRAMA..NEWA SIGN ANUSVARA
        0x11446 == code || // Mn       NEWA SIGN NUKTA
        0x114b0 == code || // Mc       TIRHUTA VOWEL SIGN AA
        (0x114b3 <= code && code <= 0x114b8) || // Mn   [6] TIRHUTA VOWEL SIGN U..TIRHUTA VOWEL SIGN VOCALIC LL
        0x114ba == code || // Mn       TIRHUTA VOWEL SIGN SHORT E
        0x114bd == code || // Mc       TIRHUTA VOWEL SIGN SHORT O
        (0x114bf <= code && code <= 0x114c0) || // Mn   [2] TIRHUTA SIGN CANDRABINDU..TIRHUTA SIGN ANUSVARA
        (0x114c2 <= code && code <= 0x114c3) || // Mn   [2] TIRHUTA SIGN VIRAMA..TIRHUTA SIGN NUKTA
        0x115af == code || // Mc       SIDDHAM VOWEL SIGN AA
        (0x115b2 <= code && code <= 0x115b5) || // Mn   [4] SIDDHAM VOWEL SIGN U..SIDDHAM VOWEL SIGN VOCALIC RR
        (0x115bc <= code && code <= 0x115bd) || // Mn   [2] SIDDHAM SIGN CANDRABINDU..SIDDHAM SIGN ANUSVARA
        (0x115bf <= code && code <= 0x115c0) || // Mn   [2] SIDDHAM SIGN VIRAMA..SIDDHAM SIGN NUKTA
        (0x115dc <= code && code <= 0x115dd) || // Mn   [2] SIDDHAM VOWEL SIGN ALTERNATE U..SIDDHAM VOWEL SIGN ALTERNATE UU
        (0x11633 <= code && code <= 0x1163a) || // Mn   [8] MODI VOWEL SIGN U..MODI VOWEL SIGN AI
        0x1163d == code || // Mn       MODI SIGN ANUSVARA
        (0x1163f <= code && code <= 0x11640) || // Mn   [2] MODI SIGN VIRAMA..MODI SIGN ARDHACANDRA
        0x116ab == code || // Mn       TAKRI SIGN ANUSVARA
        0x116ad == code || // Mn       TAKRI VOWEL SIGN AA
        (0x116b0 <= code && code <= 0x116b5) || // Mn   [6] TAKRI VOWEL SIGN U..TAKRI VOWEL SIGN AU
        0x116b7 == code || // Mn       TAKRI SIGN NUKTA
        (0x1171d <= code && code <= 0x1171f) || // Mn   [3] AHOM CONSONANT SIGN MEDIAL LA..AHOM CONSONANT SIGN MEDIAL LIGATING RA
        (0x11722 <= code && code <= 0x11725) || // Mn   [4] AHOM VOWEL SIGN I..AHOM VOWEL SIGN UU
        (0x11727 <= code && code <= 0x1172b) || // Mn   [5] AHOM VOWEL SIGN AW..AHOM SIGN KILLER
        (0x11a01 <= code && code <= 0x11a06) || // Mn   [6] ZANABAZAR SQUARE VOWEL SIGN I..ZANABAZAR SQUARE VOWEL SIGN O
        (0x11a09 <= code && code <= 0x11a0a) || // Mn   [2] ZANABAZAR SQUARE VOWEL SIGN REVERSED I..ZANABAZAR SQUARE VOWEL LENGTH MARK
        (0x11a33 <= code && code <= 0x11a38) || // Mn   [6] ZANABAZAR SQUARE FINAL CONSONANT MARK..ZANABAZAR SQUARE SIGN ANUSVARA
        (0x11a3b <= code && code <= 0x11a3e) || // Mn   [4] ZANABAZAR SQUARE CLUSTER-FINAL LETTER YA..ZANABAZAR SQUARE CLUSTER-FINAL LETTER VA
        0x11a47 == code || // Mn       ZANABAZAR SQUARE SUBJOINER
        (0x11a51 <= code && code <= 0x11a56) || // Mn   [6] SOYOMBO VOWEL SIGN I..SOYOMBO VOWEL SIGN OE
        (0x11a59 <= code && code <= 0x11a5b) || // Mn   [3] SOYOMBO VOWEL SIGN VOCALIC R..SOYOMBO VOWEL LENGTH MARK
        (0x11a8a <= code && code <= 0x11a96) || // Mn  [13] SOYOMBO FINAL CONSONANT SIGN G..SOYOMBO SIGN ANUSVARA
        (0x11a98 <= code && code <= 0x11a99) || // Mn   [2] SOYOMBO GEMINATION MARK..SOYOMBO SUBJOINER
        (0x11c30 <= code && code <= 0x11c36) || // Mn   [7] BHAIKSUKI VOWEL SIGN I..BHAIKSUKI VOWEL SIGN VOCALIC L
        (0x11c38 <= code && code <= 0x11c3d) || // Mn   [6] BHAIKSUKI VOWEL SIGN E..BHAIKSUKI SIGN ANUSVARA
        0x11c3f == code || // Mn       BHAIKSUKI SIGN VIRAMA
        (0x11c92 <= code && code <= 0x11ca7) || // Mn  [22] MARCHEN SUBJOINED LETTER KA..MARCHEN SUBJOINED LETTER ZA
        (0x11caa <= code && code <= 0x11cb0) || // Mn   [7] MARCHEN SUBJOINED LETTER RA..MARCHEN VOWEL SIGN AA
        (0x11cb2 <= code && code <= 0x11cb3) || // Mn   [2] MARCHEN VOWEL SIGN U..MARCHEN VOWEL SIGN E
        (0x11cb5 <= code && code <= 0x11cb6) || // Mn   [2] MARCHEN SIGN ANUSVARA..MARCHEN SIGN CANDRABINDU
        (0x11d31 <= code && code <= 0x11d36) || // Mn   [6] MASARAM GONDI VOWEL SIGN AA..MASARAM GONDI VOWEL SIGN VOCALIC R
        0x11d3a == code || // Mn       MASARAM GONDI VOWEL SIGN E
        (0x11d3c <= code && code <= 0x11d3d) || // Mn   [2] MASARAM GONDI VOWEL SIGN AI..MASARAM GONDI VOWEL SIGN O
        (0x11d3f <= code && code <= 0x11d45) || // Mn   [7] MASARAM GONDI VOWEL SIGN AU..MASARAM GONDI VIRAMA
        0x11d47 == code || // Mn       MASARAM GONDI RA-KARA
        (0x16af0 <= code && code <= 0x16af4) || // Mn   [5] BASSA VAH COMBINING HIGH TONE..BASSA VAH COMBINING HIGH-LOW TONE
        (0x16b30 <= code && code <= 0x16b36) || // Mn   [7] PAHAWH HMONG MARK CIM TUB..PAHAWH HMONG MARK CIM TAUM
        (0x16f8f <= code && code <= 0x16f92) || // Mn   [4] MIAO TONE RIGHT..MIAO TONE BELOW
        (0x1bc9d <= code && code <= 0x1bc9e) || // Mn   [2] DUPLOYAN THICK LETTER SELECTOR..DUPLOYAN DOUBLE MARK
        0x1d165 == code || // Mc       MUSICAL SYMBOL COMBINING STEM
        (0x1d167 <= code && code <= 0x1d169) || // Mn   [3] MUSICAL SYMBOL COMBINING TREMOLO-1..MUSICAL SYMBOL COMBINING TREMOLO-3
        (0x1d16e <= code && code <= 0x1d172) || // Mc   [5] MUSICAL SYMBOL COMBINING FLAG-1..MUSICAL SYMBOL COMBINING FLAG-5
        (0x1d17b <= code && code <= 0x1d182) || // Mn   [8] MUSICAL SYMBOL COMBINING ACCENT..MUSICAL SYMBOL COMBINING LOURE
        (0x1d185 <= code && code <= 0x1d18b) || // Mn   [7] MUSICAL SYMBOL COMBINING DOIT..MUSICAL SYMBOL COMBINING TRIPLE TONGUE
        (0x1d1aa <= code && code <= 0x1d1ad) || // Mn   [4] MUSICAL SYMBOL COMBINING DOWN BOW..MUSICAL SYMBOL COMBINING SNAP PIZZICATO
        (0x1d242 <= code && code <= 0x1d244) || // Mn   [3] COMBINING GREEK MUSICAL TRISEME..COMBINING GREEK MUSICAL PENTASEME
        (0x1da00 <= code && code <= 0x1da36) || // Mn  [55] SIGNWRITING HEAD RIM..SIGNWRITING AIR SUCKING IN
        (0x1da3b <= code && code <= 0x1da6c) || // Mn  [50] SIGNWRITING MOUTH CLOSED NEUTRAL..SIGNWRITING EXCITEMENT
        0x1da75 == code || // Mn       SIGNWRITING UPPER BODY TILTING FROM HIP JOINTS
        0x1da84 == code || // Mn       SIGNWRITING LOCATION HEAD NECK
        (0x1da9b <= code && code <= 0x1da9f) || // Mn   [5] SIGNWRITING FILL MODIFIER-2..SIGNWRITING FILL MODIFIER-6
        (0x1daa1 <= code && code <= 0x1daaf) || // Mn  [15] SIGNWRITING ROTATION MODIFIER-2..SIGNWRITING ROTATION MODIFIER-16
        (0x1e000 <= code && code <= 0x1e006) || // Mn   [7] COMBINING GLAGOLITIC LETTER AZU..COMBINING GLAGOLITIC LETTER ZHIVETE
        (0x1e008 <= code && code <= 0x1e018) || // Mn  [17] COMBINING GLAGOLITIC LETTER ZEMLJA..COMBINING GLAGOLITIC LETTER HERU
        (0x1e01b <= code && code <= 0x1e021) || // Mn   [7] COMBINING GLAGOLITIC LETTER SHTA..COMBINING GLAGOLITIC LETTER YATI
        (0x1e023 <= code && code <= 0x1e024) || // Mn   [2] COMBINING GLAGOLITIC LETTER YU..COMBINING GLAGOLITIC LETTER SMALL YUS
        (0x1e026 <= code && code <= 0x1e02a) || // Mn   [5] COMBINING GLAGOLITIC LETTER YO..COMBINING GLAGOLITIC LETTER FITA
        (0x1e8d0 <= code && code <= 0x1e8d6) || // Mn   [7] MENDE KIKAKUI COMBINING NUMBER TEENS..MENDE KIKAKUI COMBINING NUMBER MILLIONS
        (0x1e944 <= code && code <= 0x1e94a) || // Mn   [7] ADLAM ALIF LENGTHENER..ADLAM NUKTA
        (0xe0020 <= code && code <= 0xe007f) || // Cf  [96] TAG SPACE..CANCEL TAG
        (0xe0100 <= code && code <= 0xe01ef) // Mn [240] VARIATION SELECTOR-17..VARIATION SELECTOR-256
      ) {
        return Extend;
      }

      if (
        0x1f1e6 <= code &&
        code <= 0x1f1ff // So  [26] REGIONAL INDICATOR SYMBOL LETTER A..REGIONAL INDICATOR SYMBOL LETTER Z
      ) {
        return Regional_Indicator;
      }

      if (
        0x0903 == code || // Mc       DEVANAGARI SIGN VISARGA
        0x093b == code || // Mc       DEVANAGARI VOWEL SIGN OOE
        (0x093e <= code && code <= 0x0940) || // Mc   [3] DEVANAGARI VOWEL SIGN AA..DEVANAGARI VOWEL SIGN II
        (0x0949 <= code && code <= 0x094c) || // Mc   [4] DEVANAGARI VOWEL SIGN CANDRA O..DEVANAGARI VOWEL SIGN AU
        (0x094e <= code && code <= 0x094f) || // Mc   [2] DEVANAGARI VOWEL SIGN PRISHTHAMATRA E..DEVANAGARI VOWEL SIGN AW
        (0x0982 <= code && code <= 0x0983) || // Mc   [2] BENGALI SIGN ANUSVARA..BENGALI SIGN VISARGA
        (0x09bf <= code && code <= 0x09c0) || // Mc   [2] BENGALI VOWEL SIGN I..BENGALI VOWEL SIGN II
        (0x09c7 <= code && code <= 0x09c8) || // Mc   [2] BENGALI VOWEL SIGN E..BENGALI VOWEL SIGN AI
        (0x09cb <= code && code <= 0x09cc) || // Mc   [2] BENGALI VOWEL SIGN O..BENGALI VOWEL SIGN AU
        0x0a03 == code || // Mc       GURMUKHI SIGN VISARGA
        (0x0a3e <= code && code <= 0x0a40) || // Mc   [3] GURMUKHI VOWEL SIGN AA..GURMUKHI VOWEL SIGN II
        0x0a83 == code || // Mc       GUJARATI SIGN VISARGA
        (0x0abe <= code && code <= 0x0ac0) || // Mc   [3] GUJARATI VOWEL SIGN AA..GUJARATI VOWEL SIGN II
        0x0ac9 == code || // Mc       GUJARATI VOWEL SIGN CANDRA O
        (0x0acb <= code && code <= 0x0acc) || // Mc   [2] GUJARATI VOWEL SIGN O..GUJARATI VOWEL SIGN AU
        (0x0b02 <= code && code <= 0x0b03) || // Mc   [2] ORIYA SIGN ANUSVARA..ORIYA SIGN VISARGA
        0x0b40 == code || // Mc       ORIYA VOWEL SIGN II
        (0x0b47 <= code && code <= 0x0b48) || // Mc   [2] ORIYA VOWEL SIGN E..ORIYA VOWEL SIGN AI
        (0x0b4b <= code && code <= 0x0b4c) || // Mc   [2] ORIYA VOWEL SIGN O..ORIYA VOWEL SIGN AU
        0x0bbf == code || // Mc       TAMIL VOWEL SIGN I
        (0x0bc1 <= code && code <= 0x0bc2) || // Mc   [2] TAMIL VOWEL SIGN U..TAMIL VOWEL SIGN UU
        (0x0bc6 <= code && code <= 0x0bc8) || // Mc   [3] TAMIL VOWEL SIGN E..TAMIL VOWEL SIGN AI
        (0x0bca <= code && code <= 0x0bcc) || // Mc   [3] TAMIL VOWEL SIGN O..TAMIL VOWEL SIGN AU
        (0x0c01 <= code && code <= 0x0c03) || // Mc   [3] TELUGU SIGN CANDRABINDU..TELUGU SIGN VISARGA
        (0x0c41 <= code && code <= 0x0c44) || // Mc   [4] TELUGU VOWEL SIGN U..TELUGU VOWEL SIGN VOCALIC RR
        (0x0c82 <= code && code <= 0x0c83) || // Mc   [2] KANNADA SIGN ANUSVARA..KANNADA SIGN VISARGA
        0x0cbe == code || // Mc       KANNADA VOWEL SIGN AA
        (0x0cc0 <= code && code <= 0x0cc1) || // Mc   [2] KANNADA VOWEL SIGN II..KANNADA VOWEL SIGN U
        (0x0cc3 <= code && code <= 0x0cc4) || // Mc   [2] KANNADA VOWEL SIGN VOCALIC R..KANNADA VOWEL SIGN VOCALIC RR
        (0x0cc7 <= code && code <= 0x0cc8) || // Mc   [2] KANNADA VOWEL SIGN EE..KANNADA VOWEL SIGN AI
        (0x0cca <= code && code <= 0x0ccb) || // Mc   [2] KANNADA VOWEL SIGN O..KANNADA VOWEL SIGN OO
        (0x0d02 <= code && code <= 0x0d03) || // Mc   [2] MALAYALAM SIGN ANUSVARA..MALAYALAM SIGN VISARGA
        (0x0d3f <= code && code <= 0x0d40) || // Mc   [2] MALAYALAM VOWEL SIGN I..MALAYALAM VOWEL SIGN II
        (0x0d46 <= code && code <= 0x0d48) || // Mc   [3] MALAYALAM VOWEL SIGN E..MALAYALAM VOWEL SIGN AI
        (0x0d4a <= code && code <= 0x0d4c) || // Mc   [3] MALAYALAM VOWEL SIGN O..MALAYALAM VOWEL SIGN AU
        (0x0d82 <= code && code <= 0x0d83) || // Mc   [2] SINHALA SIGN ANUSVARAYA..SINHALA SIGN VISARGAYA
        (0x0dd0 <= code && code <= 0x0dd1) || // Mc   [2] SINHALA VOWEL SIGN KETTI AEDA-PILLA..SINHALA VOWEL SIGN DIGA AEDA-PILLA
        (0x0dd8 <= code && code <= 0x0dde) || // Mc   [7] SINHALA VOWEL SIGN GAETTA-PILLA..SINHALA VOWEL SIGN KOMBUVA HAA GAYANUKITTA
        (0x0df2 <= code && code <= 0x0df3) || // Mc   [2] SINHALA VOWEL SIGN DIGA GAETTA-PILLA..SINHALA VOWEL SIGN DIGA GAYANUKITTA
        0x0e33 == code || // Lo       THAI CHARACTER SARA AM
        0x0eb3 == code || // Lo       LAO VOWEL SIGN AM
        (0x0f3e <= code && code <= 0x0f3f) || // Mc   [2] TIBETAN SIGN YAR TSHES..TIBETAN SIGN MAR TSHES
        0x0f7f == code || // Mc       TIBETAN SIGN RNAM BCAD
        0x1031 == code || // Mc       MYANMAR VOWEL SIGN E
        (0x103b <= code && code <= 0x103c) || // Mc   [2] MYANMAR CONSONANT SIGN MEDIAL YA..MYANMAR CONSONANT SIGN MEDIAL RA
        (0x1056 <= code && code <= 0x1057) || // Mc   [2] MYANMAR VOWEL SIGN VOCALIC R..MYANMAR VOWEL SIGN VOCALIC RR
        0x1084 == code || // Mc       MYANMAR VOWEL SIGN SHAN E
        0x17b6 == code || // Mc       KHMER VOWEL SIGN AA
        (0x17be <= code && code <= 0x17c5) || // Mc   [8] KHMER VOWEL SIGN OE..KHMER VOWEL SIGN AU
        (0x17c7 <= code && code <= 0x17c8) || // Mc   [2] KHMER SIGN REAHMUK..KHMER SIGN YUUKALEAPINTU
        (0x1923 <= code && code <= 0x1926) || // Mc   [4] LIMBU VOWEL SIGN EE..LIMBU VOWEL SIGN AU
        (0x1929 <= code && code <= 0x192b) || // Mc   [3] LIMBU SUBJOINED LETTER YA..LIMBU SUBJOINED LETTER WA
        (0x1930 <= code && code <= 0x1931) || // Mc   [2] LIMBU SMALL LETTER KA..LIMBU SMALL LETTER NGA
        (0x1933 <= code && code <= 0x1938) || // Mc   [6] LIMBU SMALL LETTER TA..LIMBU SMALL LETTER LA
        (0x1a19 <= code && code <= 0x1a1a) || // Mc   [2] BUGINESE VOWEL SIGN E..BUGINESE VOWEL SIGN O
        0x1a55 == code || // Mc       TAI THAM CONSONANT SIGN MEDIAL RA
        0x1a57 == code || // Mc       TAI THAM CONSONANT SIGN LA TANG LAI
        (0x1a6d <= code && code <= 0x1a72) || // Mc   [6] TAI THAM VOWEL SIGN OY..TAI THAM VOWEL SIGN THAM AI
        0x1b04 == code || // Mc       BALINESE SIGN BISAH
        0x1b35 == code || // Mc       BALINESE VOWEL SIGN TEDUNG
        0x1b3b == code || // Mc       BALINESE VOWEL SIGN RA REPA TEDUNG
        (0x1b3d <= code && code <= 0x1b41) || // Mc   [5] BALINESE VOWEL SIGN LA LENGA TEDUNG..BALINESE VOWEL SIGN TALING REPA TEDUNG
        (0x1b43 <= code && code <= 0x1b44) || // Mc   [2] BALINESE VOWEL SIGN PEPET TEDUNG..BALINESE ADEG ADEG
        0x1b82 == code || // Mc       SUNDANESE SIGN PANGWISAD
        0x1ba1 == code || // Mc       SUNDANESE CONSONANT SIGN PAMINGKAL
        (0x1ba6 <= code && code <= 0x1ba7) || // Mc   [2] SUNDANESE VOWEL SIGN PANAELAENG..SUNDANESE VOWEL SIGN PANOLONG
        0x1baa == code || // Mc       SUNDANESE SIGN PAMAAEH
        0x1be7 == code || // Mc       BATAK VOWEL SIGN E
        (0x1bea <= code && code <= 0x1bec) || // Mc   [3] BATAK VOWEL SIGN I..BATAK VOWEL SIGN O
        0x1bee == code || // Mc       BATAK VOWEL SIGN U
        (0x1bf2 <= code && code <= 0x1bf3) || // Mc   [2] BATAK PANGOLAT..BATAK PANONGONAN
        (0x1c24 <= code && code <= 0x1c2b) || // Mc   [8] LEPCHA SUBJOINED LETTER YA..LEPCHA VOWEL SIGN UU
        (0x1c34 <= code && code <= 0x1c35) || // Mc   [2] LEPCHA CONSONANT SIGN NYIN-DO..LEPCHA CONSONANT SIGN KANG
        0x1ce1 == code || // Mc       VEDIC TONE ATHARVAVEDIC INDEPENDENT SVARITA
        (0x1cf2 <= code && code <= 0x1cf3) || // Mc   [2] VEDIC SIGN ARDHAVISARGA..VEDIC SIGN ROTATED ARDHAVISARGA
        0x1cf7 == code || // Mc       VEDIC SIGN ATIKRAMA
        (0xa823 <= code && code <= 0xa824) || // Mc   [2] SYLOTI NAGRI VOWEL SIGN A..SYLOTI NAGRI VOWEL SIGN I
        0xa827 == code || // Mc       SYLOTI NAGRI VOWEL SIGN OO
        (0xa880 <= code && code <= 0xa881) || // Mc   [2] SAURASHTRA SIGN ANUSVARA..SAURASHTRA SIGN VISARGA
        (0xa8b4 <= code && code <= 0xa8c3) || // Mc  [16] SAURASHTRA CONSONANT SIGN HAARU..SAURASHTRA VOWEL SIGN AU
        (0xa952 <= code && code <= 0xa953) || // Mc   [2] REJANG CONSONANT SIGN H..REJANG VIRAMA
        0xa983 == code || // Mc       JAVANESE SIGN WIGNYAN
        (0xa9b4 <= code && code <= 0xa9b5) || // Mc   [2] JAVANESE VOWEL SIGN TARUNG..JAVANESE VOWEL SIGN TOLONG
        (0xa9ba <= code && code <= 0xa9bb) || // Mc   [2] JAVANESE VOWEL SIGN TALING..JAVANESE VOWEL SIGN DIRGA MURE
        (0xa9bd <= code && code <= 0xa9c0) || // Mc   [4] JAVANESE CONSONANT SIGN KERET..JAVANESE PANGKON
        (0xaa2f <= code && code <= 0xaa30) || // Mc   [2] CHAM VOWEL SIGN O..CHAM VOWEL SIGN AI
        (0xaa33 <= code && code <= 0xaa34) || // Mc   [2] CHAM CONSONANT SIGN YA..CHAM CONSONANT SIGN RA
        0xaa4d == code || // Mc       CHAM CONSONANT SIGN FINAL H
        0xaaeb == code || // Mc       MEETEI MAYEK VOWEL SIGN II
        (0xaaee <= code && code <= 0xaaef) || // Mc   [2] MEETEI MAYEK VOWEL SIGN AU..MEETEI MAYEK VOWEL SIGN AAU
        0xaaf5 == code || // Mc       MEETEI MAYEK VOWEL SIGN VISARGA
        (0xabe3 <= code && code <= 0xabe4) || // Mc   [2] MEETEI MAYEK VOWEL SIGN ONAP..MEETEI MAYEK VOWEL SIGN INAP
        (0xabe6 <= code && code <= 0xabe7) || // Mc   [2] MEETEI MAYEK VOWEL SIGN YENAP..MEETEI MAYEK VOWEL SIGN SOUNAP
        (0xabe9 <= code && code <= 0xabea) || // Mc   [2] MEETEI MAYEK VOWEL SIGN CHEINAP..MEETEI MAYEK VOWEL SIGN NUNG
        0xabec == code || // Mc       MEETEI MAYEK LUM IYEK
        0x11000 == code || // Mc       BRAHMI SIGN CANDRABINDU
        0x11002 == code || // Mc       BRAHMI SIGN VISARGA
        0x11082 == code || // Mc       KAITHI SIGN VISARGA
        (0x110b0 <= code && code <= 0x110b2) || // Mc   [3] KAITHI VOWEL SIGN AA..KAITHI VOWEL SIGN II
        (0x110b7 <= code && code <= 0x110b8) || // Mc   [2] KAITHI VOWEL SIGN O..KAITHI VOWEL SIGN AU
        0x1112c == code || // Mc       CHAKMA VOWEL SIGN E
        0x11182 == code || // Mc       SHARADA SIGN VISARGA
        (0x111b3 <= code && code <= 0x111b5) || // Mc   [3] SHARADA VOWEL SIGN AA..SHARADA VOWEL SIGN II
        (0x111bf <= code && code <= 0x111c0) || // Mc   [2] SHARADA VOWEL SIGN AU..SHARADA SIGN VIRAMA
        (0x1122c <= code && code <= 0x1122e) || // Mc   [3] KHOJKI VOWEL SIGN AA..KHOJKI VOWEL SIGN II
        (0x11232 <= code && code <= 0x11233) || // Mc   [2] KHOJKI VOWEL SIGN O..KHOJKI VOWEL SIGN AU
        0x11235 == code || // Mc       KHOJKI SIGN VIRAMA
        (0x112e0 <= code && code <= 0x112e2) || // Mc   [3] KHUDAWADI VOWEL SIGN AA..KHUDAWADI VOWEL SIGN II
        (0x11302 <= code && code <= 0x11303) || // Mc   [2] GRANTHA SIGN ANUSVARA..GRANTHA SIGN VISARGA
        0x1133f == code || // Mc       GRANTHA VOWEL SIGN I
        (0x11341 <= code && code <= 0x11344) || // Mc   [4] GRANTHA VOWEL SIGN U..GRANTHA VOWEL SIGN VOCALIC RR
        (0x11347 <= code && code <= 0x11348) || // Mc   [2] GRANTHA VOWEL SIGN EE..GRANTHA VOWEL SIGN AI
        (0x1134b <= code && code <= 0x1134d) || // Mc   [3] GRANTHA VOWEL SIGN OO..GRANTHA SIGN VIRAMA
        (0x11362 <= code && code <= 0x11363) || // Mc   [2] GRANTHA VOWEL SIGN VOCALIC L..GRANTHA VOWEL SIGN VOCALIC LL
        (0x11435 <= code && code <= 0x11437) || // Mc   [3] NEWA VOWEL SIGN AA..NEWA VOWEL SIGN II
        (0x11440 <= code && code <= 0x11441) || // Mc   [2] NEWA VOWEL SIGN O..NEWA VOWEL SIGN AU
        0x11445 == code || // Mc       NEWA SIGN VISARGA
        (0x114b1 <= code && code <= 0x114b2) || // Mc   [2] TIRHUTA VOWEL SIGN I..TIRHUTA VOWEL SIGN II
        0x114b9 == code || // Mc       TIRHUTA VOWEL SIGN E
        (0x114bb <= code && code <= 0x114bc) || // Mc   [2] TIRHUTA VOWEL SIGN AI..TIRHUTA VOWEL SIGN O
        0x114be == code || // Mc       TIRHUTA VOWEL SIGN AU
        0x114c1 == code || // Mc       TIRHUTA SIGN VISARGA
        (0x115b0 <= code && code <= 0x115b1) || // Mc   [2] SIDDHAM VOWEL SIGN I..SIDDHAM VOWEL SIGN II
        (0x115b8 <= code && code <= 0x115bb) || // Mc   [4] SIDDHAM VOWEL SIGN E..SIDDHAM VOWEL SIGN AU
        0x115be == code || // Mc       SIDDHAM SIGN VISARGA
        (0x11630 <= code && code <= 0x11632) || // Mc   [3] MODI VOWEL SIGN AA..MODI VOWEL SIGN II
        (0x1163b <= code && code <= 0x1163c) || // Mc   [2] MODI VOWEL SIGN O..MODI VOWEL SIGN AU
        0x1163e == code || // Mc       MODI SIGN VISARGA
        0x116ac == code || // Mc       TAKRI SIGN VISARGA
        (0x116ae <= code && code <= 0x116af) || // Mc   [2] TAKRI VOWEL SIGN I..TAKRI VOWEL SIGN II
        0x116b6 == code || // Mc       TAKRI SIGN VIRAMA
        (0x11720 <= code && code <= 0x11721) || // Mc   [2] AHOM VOWEL SIGN A..AHOM VOWEL SIGN AA
        0x11726 == code || // Mc       AHOM VOWEL SIGN E
        (0x11a07 <= code && code <= 0x11a08) || // Mc   [2] ZANABAZAR SQUARE VOWEL SIGN AI..ZANABAZAR SQUARE VOWEL SIGN AU
        0x11a39 == code || // Mc       ZANABAZAR SQUARE SIGN VISARGA
        (0x11a57 <= code && code <= 0x11a58) || // Mc   [2] SOYOMBO VOWEL SIGN AI..SOYOMBO VOWEL SIGN AU
        0x11a97 == code || // Mc       SOYOMBO SIGN VISARGA
        0x11c2f == code || // Mc       BHAIKSUKI VOWEL SIGN AA
        0x11c3e == code || // Mc       BHAIKSUKI SIGN VISARGA
        0x11ca9 == code || // Mc       MARCHEN SUBJOINED LETTER YA
        0x11cb1 == code || // Mc       MARCHEN VOWEL SIGN I
        0x11cb4 == code || // Mc       MARCHEN VOWEL SIGN O
        (0x16f51 <= code && code <= 0x16f7e) || // Mc  [46] MIAO SIGN ASPIRATION..MIAO VOWEL SIGN NG
        0x1d166 == code || // Mc       MUSICAL SYMBOL COMBINING SPRECHGESANG STEM
        0x1d16d == code // Mc       MUSICAL SYMBOL COMBINING AUGMENTATION DOT
      ) {
        return SpacingMark;
      }

      if (
        (0x1100 <= code && code <= 0x115f) || // Lo  [96] HANGUL CHOSEONG KIYEOK..HANGUL CHOSEONG FILLER
        (0xa960 <= code && code <= 0xa97c) // Lo  [29] HANGUL CHOSEONG TIKEUT-MIEUM..HANGUL CHOSEONG SSANGYEORINHIEUH
      ) {
        return L;
      }

      if (
        (0x1160 <= code && code <= 0x11a7) || // Lo  [72] HANGUL JUNGSEONG FILLER..HANGUL JUNGSEONG O-YAE
        (0xd7b0 <= code && code <= 0xd7c6) // Lo  [23] HANGUL JUNGSEONG O-YEO..HANGUL JUNGSEONG ARAEA-E
      ) {
        return V;
      }

      if (
        (0x11a8 <= code && code <= 0x11ff) || // Lo  [88] HANGUL JONGSEONG KIYEOK..HANGUL JONGSEONG SSANGNIEUN
        (0xd7cb <= code && code <= 0xd7fb) // Lo  [49] HANGUL JONGSEONG NIEUN-RIEUL..HANGUL JONGSEONG PHIEUPH-THIEUTH
      ) {
        return T;
      }

      if (
        0xac00 == code || // Lo       HANGUL SYLLABLE GA
        0xac1c == code || // Lo       HANGUL SYLLABLE GAE
        0xac38 == code || // Lo       HANGUL SYLLABLE GYA
        0xac54 == code || // Lo       HANGUL SYLLABLE GYAE
        0xac70 == code || // Lo       HANGUL SYLLABLE GEO
        0xac8c == code || // Lo       HANGUL SYLLABLE GE
        0xaca8 == code || // Lo       HANGUL SYLLABLE GYEO
        0xacc4 == code || // Lo       HANGUL SYLLABLE GYE
        0xace0 == code || // Lo       HANGUL SYLLABLE GO
        0xacfc == code || // Lo       HANGUL SYLLABLE GWA
        0xad18 == code || // Lo       HANGUL SYLLABLE GWAE
        0xad34 == code || // Lo       HANGUL SYLLABLE GOE
        0xad50 == code || // Lo       HANGUL SYLLABLE GYO
        0xad6c == code || // Lo       HANGUL SYLLABLE GU
        0xad88 == code || // Lo       HANGUL SYLLABLE GWEO
        0xada4 == code || // Lo       HANGUL SYLLABLE GWE
        0xadc0 == code || // Lo       HANGUL SYLLABLE GWI
        0xaddc == code || // Lo       HANGUL SYLLABLE GYU
        0xadf8 == code || // Lo       HANGUL SYLLABLE GEU
        0xae14 == code || // Lo       HANGUL SYLLABLE GYI
        0xae30 == code || // Lo       HANGUL SYLLABLE GI
        0xae4c == code || // Lo       HANGUL SYLLABLE GGA
        0xae68 == code || // Lo       HANGUL SYLLABLE GGAE
        0xae84 == code || // Lo       HANGUL SYLLABLE GGYA
        0xaea0 == code || // Lo       HANGUL SYLLABLE GGYAE
        0xaebc == code || // Lo       HANGUL SYLLABLE GGEO
        0xaed8 == code || // Lo       HANGUL SYLLABLE GGE
        0xaef4 == code || // Lo       HANGUL SYLLABLE GGYEO
        0xaf10 == code || // Lo       HANGUL SYLLABLE GGYE
        0xaf2c == code || // Lo       HANGUL SYLLABLE GGO
        0xaf48 == code || // Lo       HANGUL SYLLABLE GGWA
        0xaf64 == code || // Lo       HANGUL SYLLABLE GGWAE
        0xaf80 == code || // Lo       HANGUL SYLLABLE GGOE
        0xaf9c == code || // Lo       HANGUL SYLLABLE GGYO
        0xafb8 == code || // Lo       HANGUL SYLLABLE GGU
        0xafd4 == code || // Lo       HANGUL SYLLABLE GGWEO
        0xaff0 == code || // Lo       HANGUL SYLLABLE GGWE
        0xb00c == code || // Lo       HANGUL SYLLABLE GGWI
        0xb028 == code || // Lo       HANGUL SYLLABLE GGYU
        0xb044 == code || // Lo       HANGUL SYLLABLE GGEU
        0xb060 == code || // Lo       HANGUL SYLLABLE GGYI
        0xb07c == code || // Lo       HANGUL SYLLABLE GGI
        0xb098 == code || // Lo       HANGUL SYLLABLE NA
        0xb0b4 == code || // Lo       HANGUL SYLLABLE NAE
        0xb0d0 == code || // Lo       HANGUL SYLLABLE NYA
        0xb0ec == code || // Lo       HANGUL SYLLABLE NYAE
        0xb108 == code || // Lo       HANGUL SYLLABLE NEO
        0xb124 == code || // Lo       HANGUL SYLLABLE NE
        0xb140 == code || // Lo       HANGUL SYLLABLE NYEO
        0xb15c == code || // Lo       HANGUL SYLLABLE NYE
        0xb178 == code || // Lo       HANGUL SYLLABLE NO
        0xb194 == code || // Lo       HANGUL SYLLABLE NWA
        0xb1b0 == code || // Lo       HANGUL SYLLABLE NWAE
        0xb1cc == code || // Lo       HANGUL SYLLABLE NOE
        0xb1e8 == code || // Lo       HANGUL SYLLABLE NYO
        0xb204 == code || // Lo       HANGUL SYLLABLE NU
        0xb220 == code || // Lo       HANGUL SYLLABLE NWEO
        0xb23c == code || // Lo       HANGUL SYLLABLE NWE
        0xb258 == code || // Lo       HANGUL SYLLABLE NWI
        0xb274 == code || // Lo       HANGUL SYLLABLE NYU
        0xb290 == code || // Lo       HANGUL SYLLABLE NEU
        0xb2ac == code || // Lo       HANGUL SYLLABLE NYI
        0xb2c8 == code || // Lo       HANGUL SYLLABLE NI
        0xb2e4 == code || // Lo       HANGUL SYLLABLE DA
        0xb300 == code || // Lo       HANGUL SYLLABLE DAE
        0xb31c == code || // Lo       HANGUL SYLLABLE DYA
        0xb338 == code || // Lo       HANGUL SYLLABLE DYAE
        0xb354 == code || // Lo       HANGUL SYLLABLE DEO
        0xb370 == code || // Lo       HANGUL SYLLABLE DE
        0xb38c == code || // Lo       HANGUL SYLLABLE DYEO
        0xb3a8 == code || // Lo       HANGUL SYLLABLE DYE
        0xb3c4 == code || // Lo       HANGUL SYLLABLE DO
        0xb3e0 == code || // Lo       HANGUL SYLLABLE DWA
        0xb3fc == code || // Lo       HANGUL SYLLABLE DWAE
        0xb418 == code || // Lo       HANGUL SYLLABLE DOE
        0xb434 == code || // Lo       HANGUL SYLLABLE DYO
        0xb450 == code || // Lo       HANGUL SYLLABLE DU
        0xb46c == code || // Lo       HANGUL SYLLABLE DWEO
        0xb488 == code || // Lo       HANGUL SYLLABLE DWE
        0xb4a4 == code || // Lo       HANGUL SYLLABLE DWI
        0xb4c0 == code || // Lo       HANGUL SYLLABLE DYU
        0xb4dc == code || // Lo       HANGUL SYLLABLE DEU
        0xb4f8 == code || // Lo       HANGUL SYLLABLE DYI
        0xb514 == code || // Lo       HANGUL SYLLABLE DI
        0xb530 == code || // Lo       HANGUL SYLLABLE DDA
        0xb54c == code || // Lo       HANGUL SYLLABLE DDAE
        0xb568 == code || // Lo       HANGUL SYLLABLE DDYA
        0xb584 == code || // Lo       HANGUL SYLLABLE DDYAE
        0xb5a0 == code || // Lo       HANGUL SYLLABLE DDEO
        0xb5bc == code || // Lo       HANGUL SYLLABLE DDE
        0xb5d8 == code || // Lo       HANGUL SYLLABLE DDYEO
        0xb5f4 == code || // Lo       HANGUL SYLLABLE DDYE
        0xb610 == code || // Lo       HANGUL SYLLABLE DDO
        0xb62c == code || // Lo       HANGUL SYLLABLE DDWA
        0xb648 == code || // Lo       HANGUL SYLLABLE DDWAE
        0xb664 == code || // Lo       HANGUL SYLLABLE DDOE
        0xb680 == code || // Lo       HANGUL SYLLABLE DDYO
        0xb69c == code || // Lo       HANGUL SYLLABLE DDU
        0xb6b8 == code || // Lo       HANGUL SYLLABLE DDWEO
        0xb6d4 == code || // Lo       HANGUL SYLLABLE DDWE
        0xb6f0 == code || // Lo       HANGUL SYLLABLE DDWI
        0xb70c == code || // Lo       HANGUL SYLLABLE DDYU
        0xb728 == code || // Lo       HANGUL SYLLABLE DDEU
        0xb744 == code || // Lo       HANGUL SYLLABLE DDYI
        0xb760 == code || // Lo       HANGUL SYLLABLE DDI
        0xb77c == code || // Lo       HANGUL SYLLABLE RA
        0xb798 == code || // Lo       HANGUL SYLLABLE RAE
        0xb7b4 == code || // Lo       HANGUL SYLLABLE RYA
        0xb7d0 == code || // Lo       HANGUL SYLLABLE RYAE
        0xb7ec == code || // Lo       HANGUL SYLLABLE REO
        0xb808 == code || // Lo       HANGUL SYLLABLE RE
        0xb824 == code || // Lo       HANGUL SYLLABLE RYEO
        0xb840 == code || // Lo       HANGUL SYLLABLE RYE
        0xb85c == code || // Lo       HANGUL SYLLABLE RO
        0xb878 == code || // Lo       HANGUL SYLLABLE RWA
        0xb894 == code || // Lo       HANGUL SYLLABLE RWAE
        0xb8b0 == code || // Lo       HANGUL SYLLABLE ROE
        0xb8cc == code || // Lo       HANGUL SYLLABLE RYO
        0xb8e8 == code || // Lo       HANGUL SYLLABLE RU
        0xb904 == code || // Lo       HANGUL SYLLABLE RWEO
        0xb920 == code || // Lo       HANGUL SYLLABLE RWE
        0xb93c == code || // Lo       HANGUL SYLLABLE RWI
        0xb958 == code || // Lo       HANGUL SYLLABLE RYU
        0xb974 == code || // Lo       HANGUL SYLLABLE REU
        0xb990 == code || // Lo       HANGUL SYLLABLE RYI
        0xb9ac == code || // Lo       HANGUL SYLLABLE RI
        0xb9c8 == code || // Lo       HANGUL SYLLABLE MA
        0xb9e4 == code || // Lo       HANGUL SYLLABLE MAE
        0xba00 == code || // Lo       HANGUL SYLLABLE MYA
        0xba1c == code || // Lo       HANGUL SYLLABLE MYAE
        0xba38 == code || // Lo       HANGUL SYLLABLE MEO
        0xba54 == code || // Lo       HANGUL SYLLABLE ME
        0xba70 == code || // Lo       HANGUL SYLLABLE MYEO
        0xba8c == code || // Lo       HANGUL SYLLABLE MYE
        0xbaa8 == code || // Lo       HANGUL SYLLABLE MO
        0xbac4 == code || // Lo       HANGUL SYLLABLE MWA
        0xbae0 == code || // Lo       HANGUL SYLLABLE MWAE
        0xbafc == code || // Lo       HANGUL SYLLABLE MOE
        0xbb18 == code || // Lo       HANGUL SYLLABLE MYO
        0xbb34 == code || // Lo       HANGUL SYLLABLE MU
        0xbb50 == code || // Lo       HANGUL SYLLABLE MWEO
        0xbb6c == code || // Lo       HANGUL SYLLABLE MWE
        0xbb88 == code || // Lo       HANGUL SYLLABLE MWI
        0xbba4 == code || // Lo       HANGUL SYLLABLE MYU
        0xbbc0 == code || // Lo       HANGUL SYLLABLE MEU
        0xbbdc == code || // Lo       HANGUL SYLLABLE MYI
        0xbbf8 == code || // Lo       HANGUL SYLLABLE MI
        0xbc14 == code || // Lo       HANGUL SYLLABLE BA
        0xbc30 == code || // Lo       HANGUL SYLLABLE BAE
        0xbc4c == code || // Lo       HANGUL SYLLABLE BYA
        0xbc68 == code || // Lo       HANGUL SYLLABLE BYAE
        0xbc84 == code || // Lo       HANGUL SYLLABLE BEO
        0xbca0 == code || // Lo       HANGUL SYLLABLE BE
        0xbcbc == code || // Lo       HANGUL SYLLABLE BYEO
        0xbcd8 == code || // Lo       HANGUL SYLLABLE BYE
        0xbcf4 == code || // Lo       HANGUL SYLLABLE BO
        0xbd10 == code || // Lo       HANGUL SYLLABLE BWA
        0xbd2c == code || // Lo       HANGUL SYLLABLE BWAE
        0xbd48 == code || // Lo       HANGUL SYLLABLE BOE
        0xbd64 == code || // Lo       HANGUL SYLLABLE BYO
        0xbd80 == code || // Lo       HANGUL SYLLABLE BU
        0xbd9c == code || // Lo       HANGUL SYLLABLE BWEO
        0xbdb8 == code || // Lo       HANGUL SYLLABLE BWE
        0xbdd4 == code || // Lo       HANGUL SYLLABLE BWI
        0xbdf0 == code || // Lo       HANGUL SYLLABLE BYU
        0xbe0c == code || // Lo       HANGUL SYLLABLE BEU
        0xbe28 == code || // Lo       HANGUL SYLLABLE BYI
        0xbe44 == code || // Lo       HANGUL SYLLABLE BI
        0xbe60 == code || // Lo       HANGUL SYLLABLE BBA
        0xbe7c == code || // Lo       HANGUL SYLLABLE BBAE
        0xbe98 == code || // Lo       HANGUL SYLLABLE BBYA
        0xbeb4 == code || // Lo       HANGUL SYLLABLE BBYAE
        0xbed0 == code || // Lo       HANGUL SYLLABLE BBEO
        0xbeec == code || // Lo       HANGUL SYLLABLE BBE
        0xbf08 == code || // Lo       HANGUL SYLLABLE BBYEO
        0xbf24 == code || // Lo       HANGUL SYLLABLE BBYE
        0xbf40 == code || // Lo       HANGUL SYLLABLE BBO
        0xbf5c == code || // Lo       HANGUL SYLLABLE BBWA
        0xbf78 == code || // Lo       HANGUL SYLLABLE BBWAE
        0xbf94 == code || // Lo       HANGUL SYLLABLE BBOE
        0xbfb0 == code || // Lo       HANGUL SYLLABLE BBYO
        0xbfcc == code || // Lo       HANGUL SYLLABLE BBU
        0xbfe8 == code || // Lo       HANGUL SYLLABLE BBWEO
        0xc004 == code || // Lo       HANGUL SYLLABLE BBWE
        0xc020 == code || // Lo       HANGUL SYLLABLE BBWI
        0xc03c == code || // Lo       HANGUL SYLLABLE BBYU
        0xc058 == code || // Lo       HANGUL SYLLABLE BBEU
        0xc074 == code || // Lo       HANGUL SYLLABLE BBYI
        0xc090 == code || // Lo       HANGUL SYLLABLE BBI
        0xc0ac == code || // Lo       HANGUL SYLLABLE SA
        0xc0c8 == code || // Lo       HANGUL SYLLABLE SAE
        0xc0e4 == code || // Lo       HANGUL SYLLABLE SYA
        0xc100 == code || // Lo       HANGUL SYLLABLE SYAE
        0xc11c == code || // Lo       HANGUL SYLLABLE SEO
        0xc138 == code || // Lo       HANGUL SYLLABLE SE
        0xc154 == code || // Lo       HANGUL SYLLABLE SYEO
        0xc170 == code || // Lo       HANGUL SYLLABLE SYE
        0xc18c == code || // Lo       HANGUL SYLLABLE SO
        0xc1a8 == code || // Lo       HANGUL SYLLABLE SWA
        0xc1c4 == code || // Lo       HANGUL SYLLABLE SWAE
        0xc1e0 == code || // Lo       HANGUL SYLLABLE SOE
        0xc1fc == code || // Lo       HANGUL SYLLABLE SYO
        0xc218 == code || // Lo       HANGUL SYLLABLE SU
        0xc234 == code || // Lo       HANGUL SYLLABLE SWEO
        0xc250 == code || // Lo       HANGUL SYLLABLE SWE
        0xc26c == code || // Lo       HANGUL SYLLABLE SWI
        0xc288 == code || // Lo       HANGUL SYLLABLE SYU
        0xc2a4 == code || // Lo       HANGUL SYLLABLE SEU
        0xc2c0 == code || // Lo       HANGUL SYLLABLE SYI
        0xc2dc == code || // Lo       HANGUL SYLLABLE SI
        0xc2f8 == code || // Lo       HANGUL SYLLABLE SSA
        0xc314 == code || // Lo       HANGUL SYLLABLE SSAE
        0xc330 == code || // Lo       HANGUL SYLLABLE SSYA
        0xc34c == code || // Lo       HANGUL SYLLABLE SSYAE
        0xc368 == code || // Lo       HANGUL SYLLABLE SSEO
        0xc384 == code || // Lo       HANGUL SYLLABLE SSE
        0xc3a0 == code || // Lo       HANGUL SYLLABLE SSYEO
        0xc3bc == code || // Lo       HANGUL SYLLABLE SSYE
        0xc3d8 == code || // Lo       HANGUL SYLLABLE SSO
        0xc3f4 == code || // Lo       HANGUL SYLLABLE SSWA
        0xc410 == code || // Lo       HANGUL SYLLABLE SSWAE
        0xc42c == code || // Lo       HANGUL SYLLABLE SSOE
        0xc448 == code || // Lo       HANGUL SYLLABLE SSYO
        0xc464 == code || // Lo       HANGUL SYLLABLE SSU
        0xc480 == code || // Lo       HANGUL SYLLABLE SSWEO
        0xc49c == code || // Lo       HANGUL SYLLABLE SSWE
        0xc4b8 == code || // Lo       HANGUL SYLLABLE SSWI
        0xc4d4 == code || // Lo       HANGUL SYLLABLE SSYU
        0xc4f0 == code || // Lo       HANGUL SYLLABLE SSEU
        0xc50c == code || // Lo       HANGUL SYLLABLE SSYI
        0xc528 == code || // Lo       HANGUL SYLLABLE SSI
        0xc544 == code || // Lo       HANGUL SYLLABLE A
        0xc560 == code || // Lo       HANGUL SYLLABLE AE
        0xc57c == code || // Lo       HANGUL SYLLABLE YA
        0xc598 == code || // Lo       HANGUL SYLLABLE YAE
        0xc5b4 == code || // Lo       HANGUL SYLLABLE EO
        0xc5d0 == code || // Lo       HANGUL SYLLABLE E
        0xc5ec == code || // Lo       HANGUL SYLLABLE YEO
        0xc608 == code || // Lo       HANGUL SYLLABLE YE
        0xc624 == code || // Lo       HANGUL SYLLABLE O
        0xc640 == code || // Lo       HANGUL SYLLABLE WA
        0xc65c == code || // Lo       HANGUL SYLLABLE WAE
        0xc678 == code || // Lo       HANGUL SYLLABLE OE
        0xc694 == code || // Lo       HANGUL SYLLABLE YO
        0xc6b0 == code || // Lo       HANGUL SYLLABLE U
        0xc6cc == code || // Lo       HANGUL SYLLABLE WEO
        0xc6e8 == code || // Lo       HANGUL SYLLABLE WE
        0xc704 == code || // Lo       HANGUL SYLLABLE WI
        0xc720 == code || // Lo       HANGUL SYLLABLE YU
        0xc73c == code || // Lo       HANGUL SYLLABLE EU
        0xc758 == code || // Lo       HANGUL SYLLABLE YI
        0xc774 == code || // Lo       HANGUL SYLLABLE I
        0xc790 == code || // Lo       HANGUL SYLLABLE JA
        0xc7ac == code || // Lo       HANGUL SYLLABLE JAE
        0xc7c8 == code || // Lo       HANGUL SYLLABLE JYA
        0xc7e4 == code || // Lo       HANGUL SYLLABLE JYAE
        0xc800 == code || // Lo       HANGUL SYLLABLE JEO
        0xc81c == code || // Lo       HANGUL SYLLABLE JE
        0xc838 == code || // Lo       HANGUL SYLLABLE JYEO
        0xc854 == code || // Lo       HANGUL SYLLABLE JYE
        0xc870 == code || // Lo       HANGUL SYLLABLE JO
        0xc88c == code || // Lo       HANGUL SYLLABLE JWA
        0xc8a8 == code || // Lo       HANGUL SYLLABLE JWAE
        0xc8c4 == code || // Lo       HANGUL SYLLABLE JOE
        0xc8e0 == code || // Lo       HANGUL SYLLABLE JYO
        0xc8fc == code || // Lo       HANGUL SYLLABLE JU
        0xc918 == code || // Lo       HANGUL SYLLABLE JWEO
        0xc934 == code || // Lo       HANGUL SYLLABLE JWE
        0xc950 == code || // Lo       HANGUL SYLLABLE JWI
        0xc96c == code || // Lo       HANGUL SYLLABLE JYU
        0xc988 == code || // Lo       HANGUL SYLLABLE JEU
        0xc9a4 == code || // Lo       HANGUL SYLLABLE JYI
        0xc9c0 == code || // Lo       HANGUL SYLLABLE JI
        0xc9dc == code || // Lo       HANGUL SYLLABLE JJA
        0xc9f8 == code || // Lo       HANGUL SYLLABLE JJAE
        0xca14 == code || // Lo       HANGUL SYLLABLE JJYA
        0xca30 == code || // Lo       HANGUL SYLLABLE JJYAE
        0xca4c == code || // Lo       HANGUL SYLLABLE JJEO
        0xca68 == code || // Lo       HANGUL SYLLABLE JJE
        0xca84 == code || // Lo       HANGUL SYLLABLE JJYEO
        0xcaa0 == code || // Lo       HANGUL SYLLABLE JJYE
        0xcabc == code || // Lo       HANGUL SYLLABLE JJO
        0xcad8 == code || // Lo       HANGUL SYLLABLE JJWA
        0xcaf4 == code || // Lo       HANGUL SYLLABLE JJWAE
        0xcb10 == code || // Lo       HANGUL SYLLABLE JJOE
        0xcb2c == code || // Lo       HANGUL SYLLABLE JJYO
        0xcb48 == code || // Lo       HANGUL SYLLABLE JJU
        0xcb64 == code || // Lo       HANGUL SYLLABLE JJWEO
        0xcb80 == code || // Lo       HANGUL SYLLABLE JJWE
        0xcb9c == code || // Lo       HANGUL SYLLABLE JJWI
        0xcbb8 == code || // Lo       HANGUL SYLLABLE JJYU
        0xcbd4 == code || // Lo       HANGUL SYLLABLE JJEU
        0xcbf0 == code || // Lo       HANGUL SYLLABLE JJYI
        0xcc0c == code || // Lo       HANGUL SYLLABLE JJI
        0xcc28 == code || // Lo       HANGUL SYLLABLE CA
        0xcc44 == code || // Lo       HANGUL SYLLABLE CAE
        0xcc60 == code || // Lo       HANGUL SYLLABLE CYA
        0xcc7c == code || // Lo       HANGUL SYLLABLE CYAE
        0xcc98 == code || // Lo       HANGUL SYLLABLE CEO
        0xccb4 == code || // Lo       HANGUL SYLLABLE CE
        0xccd0 == code || // Lo       HANGUL SYLLABLE CYEO
        0xccec == code || // Lo       HANGUL SYLLABLE CYE
        0xcd08 == code || // Lo       HANGUL SYLLABLE CO
        0xcd24 == code || // Lo       HANGUL SYLLABLE CWA
        0xcd40 == code || // Lo       HANGUL SYLLABLE CWAE
        0xcd5c == code || // Lo       HANGUL SYLLABLE COE
        0xcd78 == code || // Lo       HANGUL SYLLABLE CYO
        0xcd94 == code || // Lo       HANGUL SYLLABLE CU
        0xcdb0 == code || // Lo       HANGUL SYLLABLE CWEO
        0xcdcc == code || // Lo       HANGUL SYLLABLE CWE
        0xcde8 == code || // Lo       HANGUL SYLLABLE CWI
        0xce04 == code || // Lo       HANGUL SYLLABLE CYU
        0xce20 == code || // Lo       HANGUL SYLLABLE CEU
        0xce3c == code || // Lo       HANGUL SYLLABLE CYI
        0xce58 == code || // Lo       HANGUL SYLLABLE CI
        0xce74 == code || // Lo       HANGUL SYLLABLE KA
        0xce90 == code || // Lo       HANGUL SYLLABLE KAE
        0xceac == code || // Lo       HANGUL SYLLABLE KYA
        0xcec8 == code || // Lo       HANGUL SYLLABLE KYAE
        0xcee4 == code || // Lo       HANGUL SYLLABLE KEO
        0xcf00 == code || // Lo       HANGUL SYLLABLE KE
        0xcf1c == code || // Lo       HANGUL SYLLABLE KYEO
        0xcf38 == code || // Lo       HANGUL SYLLABLE KYE
        0xcf54 == code || // Lo       HANGUL SYLLABLE KO
        0xcf70 == code || // Lo       HANGUL SYLLABLE KWA
        0xcf8c == code || // Lo       HANGUL SYLLABLE KWAE
        0xcfa8 == code || // Lo       HANGUL SYLLABLE KOE
        0xcfc4 == code || // Lo       HANGUL SYLLABLE KYO
        0xcfe0 == code || // Lo       HANGUL SYLLABLE KU
        0xcffc == code || // Lo       HANGUL SYLLABLE KWEO
        0xd018 == code || // Lo       HANGUL SYLLABLE KWE
        0xd034 == code || // Lo       HANGUL SYLLABLE KWI
        0xd050 == code || // Lo       HANGUL SYLLABLE KYU
        0xd06c == code || // Lo       HANGUL SYLLABLE KEU
        0xd088 == code || // Lo       HANGUL SYLLABLE KYI
        0xd0a4 == code || // Lo       HANGUL SYLLABLE KI
        0xd0c0 == code || // Lo       HANGUL SYLLABLE TA
        0xd0dc == code || // Lo       HANGUL SYLLABLE TAE
        0xd0f8 == code || // Lo       HANGUL SYLLABLE TYA
        0xd114 == code || // Lo       HANGUL SYLLABLE TYAE
        0xd130 == code || // Lo       HANGUL SYLLABLE TEO
        0xd14c == code || // Lo       HANGUL SYLLABLE TE
        0xd168 == code || // Lo       HANGUL SYLLABLE TYEO
        0xd184 == code || // Lo       HANGUL SYLLABLE TYE
        0xd1a0 == code || // Lo       HANGUL SYLLABLE TO
        0xd1bc == code || // Lo       HANGUL SYLLABLE TWA
        0xd1d8 == code || // Lo       HANGUL SYLLABLE TWAE
        0xd1f4 == code || // Lo       HANGUL SYLLABLE TOE
        0xd210 == code || // Lo       HANGUL SYLLABLE TYO
        0xd22c == code || // Lo       HANGUL SYLLABLE TU
        0xd248 == code || // Lo       HANGUL SYLLABLE TWEO
        0xd264 == code || // Lo       HANGUL SYLLABLE TWE
        0xd280 == code || // Lo       HANGUL SYLLABLE TWI
        0xd29c == code || // Lo       HANGUL SYLLABLE TYU
        0xd2b8 == code || // Lo       HANGUL SYLLABLE TEU
        0xd2d4 == code || // Lo       HANGUL SYLLABLE TYI
        0xd2f0 == code || // Lo       HANGUL SYLLABLE TI
        0xd30c == code || // Lo       HANGUL SYLLABLE PA
        0xd328 == code || // Lo       HANGUL SYLLABLE PAE
        0xd344 == code || // Lo       HANGUL SYLLABLE PYA
        0xd360 == code || // Lo       HANGUL SYLLABLE PYAE
        0xd37c == code || // Lo       HANGUL SYLLABLE PEO
        0xd398 == code || // Lo       HANGUL SYLLABLE PE
        0xd3b4 == code || // Lo       HANGUL SYLLABLE PYEO
        0xd3d0 == code || // Lo       HANGUL SYLLABLE PYE
        0xd3ec == code || // Lo       HANGUL SYLLABLE PO
        0xd408 == code || // Lo       HANGUL SYLLABLE PWA
        0xd424 == code || // Lo       HANGUL SYLLABLE PWAE
        0xd440 == code || // Lo       HANGUL SYLLABLE POE
        0xd45c == code || // Lo       HANGUL SYLLABLE PYO
        0xd478 == code || // Lo       HANGUL SYLLABLE PU
        0xd494 == code || // Lo       HANGUL SYLLABLE PWEO
        0xd4b0 == code || // Lo       HANGUL SYLLABLE PWE
        0xd4cc == code || // Lo       HANGUL SYLLABLE PWI
        0xd4e8 == code || // Lo       HANGUL SYLLABLE PYU
        0xd504 == code || // Lo       HANGUL SYLLABLE PEU
        0xd520 == code || // Lo       HANGUL SYLLABLE PYI
        0xd53c == code || // Lo       HANGUL SYLLABLE PI
        0xd558 == code || // Lo       HANGUL SYLLABLE HA
        0xd574 == code || // Lo       HANGUL SYLLABLE HAE
        0xd590 == code || // Lo       HANGUL SYLLABLE HYA
        0xd5ac == code || // Lo       HANGUL SYLLABLE HYAE
        0xd5c8 == code || // Lo       HANGUL SYLLABLE HEO
        0xd5e4 == code || // Lo       HANGUL SYLLABLE HE
        0xd600 == code || // Lo       HANGUL SYLLABLE HYEO
        0xd61c == code || // Lo       HANGUL SYLLABLE HYE
        0xd638 == code || // Lo       HANGUL SYLLABLE HO
        0xd654 == code || // Lo       HANGUL SYLLABLE HWA
        0xd670 == code || // Lo       HANGUL SYLLABLE HWAE
        0xd68c == code || // Lo       HANGUL SYLLABLE HOE
        0xd6a8 == code || // Lo       HANGUL SYLLABLE HYO
        0xd6c4 == code || // Lo       HANGUL SYLLABLE HU
        0xd6e0 == code || // Lo       HANGUL SYLLABLE HWEO
        0xd6fc == code || // Lo       HANGUL SYLLABLE HWE
        0xd718 == code || // Lo       HANGUL SYLLABLE HWI
        0xd734 == code || // Lo       HANGUL SYLLABLE HYU
        0xd750 == code || // Lo       HANGUL SYLLABLE HEU
        0xd76c == code || // Lo       HANGUL SYLLABLE HYI
        0xd788 == code // Lo       HANGUL SYLLABLE HI
      ) {
        return LV;
      }

      if (
        (0xac01 <= code && code <= 0xac1b) || // Lo  [27] HANGUL SYLLABLE GAG..HANGUL SYLLABLE GAH
        (0xac1d <= code && code <= 0xac37) || // Lo  [27] HANGUL SYLLABLE GAEG..HANGUL SYLLABLE GAEH
        (0xac39 <= code && code <= 0xac53) || // Lo  [27] HANGUL SYLLABLE GYAG..HANGUL SYLLABLE GYAH
        (0xac55 <= code && code <= 0xac6f) || // Lo  [27] HANGUL SYLLABLE GYAEG..HANGUL SYLLABLE GYAEH
        (0xac71 <= code && code <= 0xac8b) || // Lo  [27] HANGUL SYLLABLE GEOG..HANGUL SYLLABLE GEOH
        (0xac8d <= code && code <= 0xaca7) || // Lo  [27] HANGUL SYLLABLE GEG..HANGUL SYLLABLE GEH
        (0xaca9 <= code && code <= 0xacc3) || // Lo  [27] HANGUL SYLLABLE GYEOG..HANGUL SYLLABLE GYEOH
        (0xacc5 <= code && code <= 0xacdf) || // Lo  [27] HANGUL SYLLABLE GYEG..HANGUL SYLLABLE GYEH
        (0xace1 <= code && code <= 0xacfb) || // Lo  [27] HANGUL SYLLABLE GOG..HANGUL SYLLABLE GOH
        (0xacfd <= code && code <= 0xad17) || // Lo  [27] HANGUL SYLLABLE GWAG..HANGUL SYLLABLE GWAH
        (0xad19 <= code && code <= 0xad33) || // Lo  [27] HANGUL SYLLABLE GWAEG..HANGUL SYLLABLE GWAEH
        (0xad35 <= code && code <= 0xad4f) || // Lo  [27] HANGUL SYLLABLE GOEG..HANGUL SYLLABLE GOEH
        (0xad51 <= code && code <= 0xad6b) || // Lo  [27] HANGUL SYLLABLE GYOG..HANGUL SYLLABLE GYOH
        (0xad6d <= code && code <= 0xad87) || // Lo  [27] HANGUL SYLLABLE GUG..HANGUL SYLLABLE GUH
        (0xad89 <= code && code <= 0xada3) || // Lo  [27] HANGUL SYLLABLE GWEOG..HANGUL SYLLABLE GWEOH
        (0xada5 <= code && code <= 0xadbf) || // Lo  [27] HANGUL SYLLABLE GWEG..HANGUL SYLLABLE GWEH
        (0xadc1 <= code && code <= 0xaddb) || // Lo  [27] HANGUL SYLLABLE GWIG..HANGUL SYLLABLE GWIH
        (0xaddd <= code && code <= 0xadf7) || // Lo  [27] HANGUL SYLLABLE GYUG..HANGUL SYLLABLE GYUH
        (0xadf9 <= code && code <= 0xae13) || // Lo  [27] HANGUL SYLLABLE GEUG..HANGUL SYLLABLE GEUH
        (0xae15 <= code && code <= 0xae2f) || // Lo  [27] HANGUL SYLLABLE GYIG..HANGUL SYLLABLE GYIH
        (0xae31 <= code && code <= 0xae4b) || // Lo  [27] HANGUL SYLLABLE GIG..HANGUL SYLLABLE GIH
        (0xae4d <= code && code <= 0xae67) || // Lo  [27] HANGUL SYLLABLE GGAG..HANGUL SYLLABLE GGAH
        (0xae69 <= code && code <= 0xae83) || // Lo  [27] HANGUL SYLLABLE GGAEG..HANGUL SYLLABLE GGAEH
        (0xae85 <= code && code <= 0xae9f) || // Lo  [27] HANGUL SYLLABLE GGYAG..HANGUL SYLLABLE GGYAH
        (0xaea1 <= code && code <= 0xaebb) || // Lo  [27] HANGUL SYLLABLE GGYAEG..HANGUL SYLLABLE GGYAEH
        (0xaebd <= code && code <= 0xaed7) || // Lo  [27] HANGUL SYLLABLE GGEOG..HANGUL SYLLABLE GGEOH
        (0xaed9 <= code && code <= 0xaef3) || // Lo  [27] HANGUL SYLLABLE GGEG..HANGUL SYLLABLE GGEH
        (0xaef5 <= code && code <= 0xaf0f) || // Lo  [27] HANGUL SYLLABLE GGYEOG..HANGUL SYLLABLE GGYEOH
        (0xaf11 <= code && code <= 0xaf2b) || // Lo  [27] HANGUL SYLLABLE GGYEG..HANGUL SYLLABLE GGYEH
        (0xaf2d <= code && code <= 0xaf47) || // Lo  [27] HANGUL SYLLABLE GGOG..HANGUL SYLLABLE GGOH
        (0xaf49 <= code && code <= 0xaf63) || // Lo  [27] HANGUL SYLLABLE GGWAG..HANGUL SYLLABLE GGWAH
        (0xaf65 <= code && code <= 0xaf7f) || // Lo  [27] HANGUL SYLLABLE GGWAEG..HANGUL SYLLABLE GGWAEH
        (0xaf81 <= code && code <= 0xaf9b) || // Lo  [27] HANGUL SYLLABLE GGOEG..HANGUL SYLLABLE GGOEH
        (0xaf9d <= code && code <= 0xafb7) || // Lo  [27] HANGUL SYLLABLE GGYOG..HANGUL SYLLABLE GGYOH
        (0xafb9 <= code && code <= 0xafd3) || // Lo  [27] HANGUL SYLLABLE GGUG..HANGUL SYLLABLE GGUH
        (0xafd5 <= code && code <= 0xafef) || // Lo  [27] HANGUL SYLLABLE GGWEOG..HANGUL SYLLABLE GGWEOH
        (0xaff1 <= code && code <= 0xb00b) || // Lo  [27] HANGUL SYLLABLE GGWEG..HANGUL SYLLABLE GGWEH
        (0xb00d <= code && code <= 0xb027) || // Lo  [27] HANGUL SYLLABLE GGWIG..HANGUL SYLLABLE GGWIH
        (0xb029 <= code && code <= 0xb043) || // Lo  [27] HANGUL SYLLABLE GGYUG..HANGUL SYLLABLE GGYUH
        (0xb045 <= code && code <= 0xb05f) || // Lo  [27] HANGUL SYLLABLE GGEUG..HANGUL SYLLABLE GGEUH
        (0xb061 <= code && code <= 0xb07b) || // Lo  [27] HANGUL SYLLABLE GGYIG..HANGUL SYLLABLE GGYIH
        (0xb07d <= code && code <= 0xb097) || // Lo  [27] HANGUL SYLLABLE GGIG..HANGUL SYLLABLE GGIH
        (0xb099 <= code && code <= 0xb0b3) || // Lo  [27] HANGUL SYLLABLE NAG..HANGUL SYLLABLE NAH
        (0xb0b5 <= code && code <= 0xb0cf) || // Lo  [27] HANGUL SYLLABLE NAEG..HANGUL SYLLABLE NAEH
        (0xb0d1 <= code && code <= 0xb0eb) || // Lo  [27] HANGUL SYLLABLE NYAG..HANGUL SYLLABLE NYAH
        (0xb0ed <= code && code <= 0xb107) || // Lo  [27] HANGUL SYLLABLE NYAEG..HANGUL SYLLABLE NYAEH
        (0xb109 <= code && code <= 0xb123) || // Lo  [27] HANGUL SYLLABLE NEOG..HANGUL SYLLABLE NEOH
        (0xb125 <= code && code <= 0xb13f) || // Lo  [27] HANGUL SYLLABLE NEG..HANGUL SYLLABLE NEH
        (0xb141 <= code && code <= 0xb15b) || // Lo  [27] HANGUL SYLLABLE NYEOG..HANGUL SYLLABLE NYEOH
        (0xb15d <= code && code <= 0xb177) || // Lo  [27] HANGUL SYLLABLE NYEG..HANGUL SYLLABLE NYEH
        (0xb179 <= code && code <= 0xb193) || // Lo  [27] HANGUL SYLLABLE NOG..HANGUL SYLLABLE NOH
        (0xb195 <= code && code <= 0xb1af) || // Lo  [27] HANGUL SYLLABLE NWAG..HANGUL SYLLABLE NWAH
        (0xb1b1 <= code && code <= 0xb1cb) || // Lo  [27] HANGUL SYLLABLE NWAEG..HANGUL SYLLABLE NWAEH
        (0xb1cd <= code && code <= 0xb1e7) || // Lo  [27] HANGUL SYLLABLE NOEG..HANGUL SYLLABLE NOEH
        (0xb1e9 <= code && code <= 0xb203) || // Lo  [27] HANGUL SYLLABLE NYOG..HANGUL SYLLABLE NYOH
        (0xb205 <= code && code <= 0xb21f) || // Lo  [27] HANGUL SYLLABLE NUG..HANGUL SYLLABLE NUH
        (0xb221 <= code && code <= 0xb23b) || // Lo  [27] HANGUL SYLLABLE NWEOG..HANGUL SYLLABLE NWEOH
        (0xb23d <= code && code <= 0xb257) || // Lo  [27] HANGUL SYLLABLE NWEG..HANGUL SYLLABLE NWEH
        (0xb259 <= code && code <= 0xb273) || // Lo  [27] HANGUL SYLLABLE NWIG..HANGUL SYLLABLE NWIH
        (0xb275 <= code && code <= 0xb28f) || // Lo  [27] HANGUL SYLLABLE NYUG..HANGUL SYLLABLE NYUH
        (0xb291 <= code && code <= 0xb2ab) || // Lo  [27] HANGUL SYLLABLE NEUG..HANGUL SYLLABLE NEUH
        (0xb2ad <= code && code <= 0xb2c7) || // Lo  [27] HANGUL SYLLABLE NYIG..HANGUL SYLLABLE NYIH
        (0xb2c9 <= code && code <= 0xb2e3) || // Lo  [27] HANGUL SYLLABLE NIG..HANGUL SYLLABLE NIH
        (0xb2e5 <= code && code <= 0xb2ff) || // Lo  [27] HANGUL SYLLABLE DAG..HANGUL SYLLABLE DAH
        (0xb301 <= code && code <= 0xb31b) || // Lo  [27] HANGUL SYLLABLE DAEG..HANGUL SYLLABLE DAEH
        (0xb31d <= code && code <= 0xb337) || // Lo  [27] HANGUL SYLLABLE DYAG..HANGUL SYLLABLE DYAH
        (0xb339 <= code && code <= 0xb353) || // Lo  [27] HANGUL SYLLABLE DYAEG..HANGUL SYLLABLE DYAEH
        (0xb355 <= code && code <= 0xb36f) || // Lo  [27] HANGUL SYLLABLE DEOG..HANGUL SYLLABLE DEOH
        (0xb371 <= code && code <= 0xb38b) || // Lo  [27] HANGUL SYLLABLE DEG..HANGUL SYLLABLE DEH
        (0xb38d <= code && code <= 0xb3a7) || // Lo  [27] HANGUL SYLLABLE DYEOG..HANGUL SYLLABLE DYEOH
        (0xb3a9 <= code && code <= 0xb3c3) || // Lo  [27] HANGUL SYLLABLE DYEG..HANGUL SYLLABLE DYEH
        (0xb3c5 <= code && code <= 0xb3df) || // Lo  [27] HANGUL SYLLABLE DOG..HANGUL SYLLABLE DOH
        (0xb3e1 <= code && code <= 0xb3fb) || // Lo  [27] HANGUL SYLLABLE DWAG..HANGUL SYLLABLE DWAH
        (0xb3fd <= code && code <= 0xb417) || // Lo  [27] HANGUL SYLLABLE DWAEG..HANGUL SYLLABLE DWAEH
        (0xb419 <= code && code <= 0xb433) || // Lo  [27] HANGUL SYLLABLE DOEG..HANGUL SYLLABLE DOEH
        (0xb435 <= code && code <= 0xb44f) || // Lo  [27] HANGUL SYLLABLE DYOG..HANGUL SYLLABLE DYOH
        (0xb451 <= code && code <= 0xb46b) || // Lo  [27] HANGUL SYLLABLE DUG..HANGUL SYLLABLE DUH
        (0xb46d <= code && code <= 0xb487) || // Lo  [27] HANGUL SYLLABLE DWEOG..HANGUL SYLLABLE DWEOH
        (0xb489 <= code && code <= 0xb4a3) || // Lo  [27] HANGUL SYLLABLE DWEG..HANGUL SYLLABLE DWEH
        (0xb4a5 <= code && code <= 0xb4bf) || // Lo  [27] HANGUL SYLLABLE DWIG..HANGUL SYLLABLE DWIH
        (0xb4c1 <= code && code <= 0xb4db) || // Lo  [27] HANGUL SYLLABLE DYUG..HANGUL SYLLABLE DYUH
        (0xb4dd <= code && code <= 0xb4f7) || // Lo  [27] HANGUL SYLLABLE DEUG..HANGUL SYLLABLE DEUH
        (0xb4f9 <= code && code <= 0xb513) || // Lo  [27] HANGUL SYLLABLE DYIG..HANGUL SYLLABLE DYIH
        (0xb515 <= code && code <= 0xb52f) || // Lo  [27] HANGUL SYLLABLE DIG..HANGUL SYLLABLE DIH
        (0xb531 <= code && code <= 0xb54b) || // Lo  [27] HANGUL SYLLABLE DDAG..HANGUL SYLLABLE DDAH
        (0xb54d <= code && code <= 0xb567) || // Lo  [27] HANGUL SYLLABLE DDAEG..HANGUL SYLLABLE DDAEH
        (0xb569 <= code && code <= 0xb583) || // Lo  [27] HANGUL SYLLABLE DDYAG..HANGUL SYLLABLE DDYAH
        (0xb585 <= code && code <= 0xb59f) || // Lo  [27] HANGUL SYLLABLE DDYAEG..HANGUL SYLLABLE DDYAEH
        (0xb5a1 <= code && code <= 0xb5bb) || // Lo  [27] HANGUL SYLLABLE DDEOG..HANGUL SYLLABLE DDEOH
        (0xb5bd <= code && code <= 0xb5d7) || // Lo  [27] HANGUL SYLLABLE DDEG..HANGUL SYLLABLE DDEH
        (0xb5d9 <= code && code <= 0xb5f3) || // Lo  [27] HANGUL SYLLABLE DDYEOG..HANGUL SYLLABLE DDYEOH
        (0xb5f5 <= code && code <= 0xb60f) || // Lo  [27] HANGUL SYLLABLE DDYEG..HANGUL SYLLABLE DDYEH
        (0xb611 <= code && code <= 0xb62b) || // Lo  [27] HANGUL SYLLABLE DDOG..HANGUL SYLLABLE DDOH
        (0xb62d <= code && code <= 0xb647) || // Lo  [27] HANGUL SYLLABLE DDWAG..HANGUL SYLLABLE DDWAH
        (0xb649 <= code && code <= 0xb663) || // Lo  [27] HANGUL SYLLABLE DDWAEG..HANGUL SYLLABLE DDWAEH
        (0xb665 <= code && code <= 0xb67f) || // Lo  [27] HANGUL SYLLABLE DDOEG..HANGUL SYLLABLE DDOEH
        (0xb681 <= code && code <= 0xb69b) || // Lo  [27] HANGUL SYLLABLE DDYOG..HANGUL SYLLABLE DDYOH
        (0xb69d <= code && code <= 0xb6b7) || // Lo  [27] HANGUL SYLLABLE DDUG..HANGUL SYLLABLE DDUH
        (0xb6b9 <= code && code <= 0xb6d3) || // Lo  [27] HANGUL SYLLABLE DDWEOG..HANGUL SYLLABLE DDWEOH
        (0xb6d5 <= code && code <= 0xb6ef) || // Lo  [27] HANGUL SYLLABLE DDWEG..HANGUL SYLLABLE DDWEH
        (0xb6f1 <= code && code <= 0xb70b) || // Lo  [27] HANGUL SYLLABLE DDWIG..HANGUL SYLLABLE DDWIH
        (0xb70d <= code && code <= 0xb727) || // Lo  [27] HANGUL SYLLABLE DDYUG..HANGUL SYLLABLE DDYUH
        (0xb729 <= code && code <= 0xb743) || // Lo  [27] HANGUL SYLLABLE DDEUG..HANGUL SYLLABLE DDEUH
        (0xb745 <= code && code <= 0xb75f) || // Lo  [27] HANGUL SYLLABLE DDYIG..HANGUL SYLLABLE DDYIH
        (0xb761 <= code && code <= 0xb77b) || // Lo  [27] HANGUL SYLLABLE DDIG..HANGUL SYLLABLE DDIH
        (0xb77d <= code && code <= 0xb797) || // Lo  [27] HANGUL SYLLABLE RAG..HANGUL SYLLABLE RAH
        (0xb799 <= code && code <= 0xb7b3) || // Lo  [27] HANGUL SYLLABLE RAEG..HANGUL SYLLABLE RAEH
        (0xb7b5 <= code && code <= 0xb7cf) || // Lo  [27] HANGUL SYLLABLE RYAG..HANGUL SYLLABLE RYAH
        (0xb7d1 <= code && code <= 0xb7eb) || // Lo  [27] HANGUL SYLLABLE RYAEG..HANGUL SYLLABLE RYAEH
        (0xb7ed <= code && code <= 0xb807) || // Lo  [27] HANGUL SYLLABLE REOG..HANGUL SYLLABLE REOH
        (0xb809 <= code && code <= 0xb823) || // Lo  [27] HANGUL SYLLABLE REG..HANGUL SYLLABLE REH
        (0xb825 <= code && code <= 0xb83f) || // Lo  [27] HANGUL SYLLABLE RYEOG..HANGUL SYLLABLE RYEOH
        (0xb841 <= code && code <= 0xb85b) || // Lo  [27] HANGUL SYLLABLE RYEG..HANGUL SYLLABLE RYEH
        (0xb85d <= code && code <= 0xb877) || // Lo  [27] HANGUL SYLLABLE ROG..HANGUL SYLLABLE ROH
        (0xb879 <= code && code <= 0xb893) || // Lo  [27] HANGUL SYLLABLE RWAG..HANGUL SYLLABLE RWAH
        (0xb895 <= code && code <= 0xb8af) || // Lo  [27] HANGUL SYLLABLE RWAEG..HANGUL SYLLABLE RWAEH
        (0xb8b1 <= code && code <= 0xb8cb) || // Lo  [27] HANGUL SYLLABLE ROEG..HANGUL SYLLABLE ROEH
        (0xb8cd <= code && code <= 0xb8e7) || // Lo  [27] HANGUL SYLLABLE RYOG..HANGUL SYLLABLE RYOH
        (0xb8e9 <= code && code <= 0xb903) || // Lo  [27] HANGUL SYLLABLE RUG..HANGUL SYLLABLE RUH
        (0xb905 <= code && code <= 0xb91f) || // Lo  [27] HANGUL SYLLABLE RWEOG..HANGUL SYLLABLE RWEOH
        (0xb921 <= code && code <= 0xb93b) || // Lo  [27] HANGUL SYLLABLE RWEG..HANGUL SYLLABLE RWEH
        (0xb93d <= code && code <= 0xb957) || // Lo  [27] HANGUL SYLLABLE RWIG..HANGUL SYLLABLE RWIH
        (0xb959 <= code && code <= 0xb973) || // Lo  [27] HANGUL SYLLABLE RYUG..HANGUL SYLLABLE RYUH
        (0xb975 <= code && code <= 0xb98f) || // Lo  [27] HANGUL SYLLABLE REUG..HANGUL SYLLABLE REUH
        (0xb991 <= code && code <= 0xb9ab) || // Lo  [27] HANGUL SYLLABLE RYIG..HANGUL SYLLABLE RYIH
        (0xb9ad <= code && code <= 0xb9c7) || // Lo  [27] HANGUL SYLLABLE RIG..HANGUL SYLLABLE RIH
        (0xb9c9 <= code && code <= 0xb9e3) || // Lo  [27] HANGUL SYLLABLE MAG..HANGUL SYLLABLE MAH
        (0xb9e5 <= code && code <= 0xb9ff) || // Lo  [27] HANGUL SYLLABLE MAEG..HANGUL SYLLABLE MAEH
        (0xba01 <= code && code <= 0xba1b) || // Lo  [27] HANGUL SYLLABLE MYAG..HANGUL SYLLABLE MYAH
        (0xba1d <= code && code <= 0xba37) || // Lo  [27] HANGUL SYLLABLE MYAEG..HANGUL SYLLABLE MYAEH
        (0xba39 <= code && code <= 0xba53) || // Lo  [27] HANGUL SYLLABLE MEOG..HANGUL SYLLABLE MEOH
        (0xba55 <= code && code <= 0xba6f) || // Lo  [27] HANGUL SYLLABLE MEG..HANGUL SYLLABLE MEH
        (0xba71 <= code && code <= 0xba8b) || // Lo  [27] HANGUL SYLLABLE MYEOG..HANGUL SYLLABLE MYEOH
        (0xba8d <= code && code <= 0xbaa7) || // Lo  [27] HANGUL SYLLABLE MYEG..HANGUL SYLLABLE MYEH
        (0xbaa9 <= code && code <= 0xbac3) || // Lo  [27] HANGUL SYLLABLE MOG..HANGUL SYLLABLE MOH
        (0xbac5 <= code && code <= 0xbadf) || // Lo  [27] HANGUL SYLLABLE MWAG..HANGUL SYLLABLE MWAH
        (0xbae1 <= code && code <= 0xbafb) || // Lo  [27] HANGUL SYLLABLE MWAEG..HANGUL SYLLABLE MWAEH
        (0xbafd <= code && code <= 0xbb17) || // Lo  [27] HANGUL SYLLABLE MOEG..HANGUL SYLLABLE MOEH
        (0xbb19 <= code && code <= 0xbb33) || // Lo  [27] HANGUL SYLLABLE MYOG..HANGUL SYLLABLE MYOH
        (0xbb35 <= code && code <= 0xbb4f) || // Lo  [27] HANGUL SYLLABLE MUG..HANGUL SYLLABLE MUH
        (0xbb51 <= code && code <= 0xbb6b) || // Lo  [27] HANGUL SYLLABLE MWEOG..HANGUL SYLLABLE MWEOH
        (0xbb6d <= code && code <= 0xbb87) || // Lo  [27] HANGUL SYLLABLE MWEG..HANGUL SYLLABLE MWEH
        (0xbb89 <= code && code <= 0xbba3) || // Lo  [27] HANGUL SYLLABLE MWIG..HANGUL SYLLABLE MWIH
        (0xbba5 <= code && code <= 0xbbbf) || // Lo  [27] HANGUL SYLLABLE MYUG..HANGUL SYLLABLE MYUH
        (0xbbc1 <= code && code <= 0xbbdb) || // Lo  [27] HANGUL SYLLABLE MEUG..HANGUL SYLLABLE MEUH
        (0xbbdd <= code && code <= 0xbbf7) || // Lo  [27] HANGUL SYLLABLE MYIG..HANGUL SYLLABLE MYIH
        (0xbbf9 <= code && code <= 0xbc13) || // Lo  [27] HANGUL SYLLABLE MIG..HANGUL SYLLABLE MIH
        (0xbc15 <= code && code <= 0xbc2f) || // Lo  [27] HANGUL SYLLABLE BAG..HANGUL SYLLABLE BAH
        (0xbc31 <= code && code <= 0xbc4b) || // Lo  [27] HANGUL SYLLABLE BAEG..HANGUL SYLLABLE BAEH
        (0xbc4d <= code && code <= 0xbc67) || // Lo  [27] HANGUL SYLLABLE BYAG..HANGUL SYLLABLE BYAH
        (0xbc69 <= code && code <= 0xbc83) || // Lo  [27] HANGUL SYLLABLE BYAEG..HANGUL SYLLABLE BYAEH
        (0xbc85 <= code && code <= 0xbc9f) || // Lo  [27] HANGUL SYLLABLE BEOG..HANGUL SYLLABLE BEOH
        (0xbca1 <= code && code <= 0xbcbb) || // Lo  [27] HANGUL SYLLABLE BEG..HANGUL SYLLABLE BEH
        (0xbcbd <= code && code <= 0xbcd7) || // Lo  [27] HANGUL SYLLABLE BYEOG..HANGUL SYLLABLE BYEOH
        (0xbcd9 <= code && code <= 0xbcf3) || // Lo  [27] HANGUL SYLLABLE BYEG..HANGUL SYLLABLE BYEH
        (0xbcf5 <= code && code <= 0xbd0f) || // Lo  [27] HANGUL SYLLABLE BOG..HANGUL SYLLABLE BOH
        (0xbd11 <= code && code <= 0xbd2b) || // Lo  [27] HANGUL SYLLABLE BWAG..HANGUL SYLLABLE BWAH
        (0xbd2d <= code && code <= 0xbd47) || // Lo  [27] HANGUL SYLLABLE BWAEG..HANGUL SYLLABLE BWAEH
        (0xbd49 <= code && code <= 0xbd63) || // Lo  [27] HANGUL SYLLABLE BOEG..HANGUL SYLLABLE BOEH
        (0xbd65 <= code && code <= 0xbd7f) || // Lo  [27] HANGUL SYLLABLE BYOG..HANGUL SYLLABLE BYOH
        (0xbd81 <= code && code <= 0xbd9b) || // Lo  [27] HANGUL SYLLABLE BUG..HANGUL SYLLABLE BUH
        (0xbd9d <= code && code <= 0xbdb7) || // Lo  [27] HANGUL SYLLABLE BWEOG..HANGUL SYLLABLE BWEOH
        (0xbdb9 <= code && code <= 0xbdd3) || // Lo  [27] HANGUL SYLLABLE BWEG..HANGUL SYLLABLE BWEH
        (0xbdd5 <= code && code <= 0xbdef) || // Lo  [27] HANGUL SYLLABLE BWIG..HANGUL SYLLABLE BWIH
        (0xbdf1 <= code && code <= 0xbe0b) || // Lo  [27] HANGUL SYLLABLE BYUG..HANGUL SYLLABLE BYUH
        (0xbe0d <= code && code <= 0xbe27) || // Lo  [27] HANGUL SYLLABLE BEUG..HANGUL SYLLABLE BEUH
        (0xbe29 <= code && code <= 0xbe43) || // Lo  [27] HANGUL SYLLABLE BYIG..HANGUL SYLLABLE BYIH
        (0xbe45 <= code && code <= 0xbe5f) || // Lo  [27] HANGUL SYLLABLE BIG..HANGUL SYLLABLE BIH
        (0xbe61 <= code && code <= 0xbe7b) || // Lo  [27] HANGUL SYLLABLE BBAG..HANGUL SYLLABLE BBAH
        (0xbe7d <= code && code <= 0xbe97) || // Lo  [27] HANGUL SYLLABLE BBAEG..HANGUL SYLLABLE BBAEH
        (0xbe99 <= code && code <= 0xbeb3) || // Lo  [27] HANGUL SYLLABLE BBYAG..HANGUL SYLLABLE BBYAH
        (0xbeb5 <= code && code <= 0xbecf) || // Lo  [27] HANGUL SYLLABLE BBYAEG..HANGUL SYLLABLE BBYAEH
        (0xbed1 <= code && code <= 0xbeeb) || // Lo  [27] HANGUL SYLLABLE BBEOG..HANGUL SYLLABLE BBEOH
        (0xbeed <= code && code <= 0xbf07) || // Lo  [27] HANGUL SYLLABLE BBEG..HANGUL SYLLABLE BBEH
        (0xbf09 <= code && code <= 0xbf23) || // Lo  [27] HANGUL SYLLABLE BBYEOG..HANGUL SYLLABLE BBYEOH
        (0xbf25 <= code && code <= 0xbf3f) || // Lo  [27] HANGUL SYLLABLE BBYEG..HANGUL SYLLABLE BBYEH
        (0xbf41 <= code && code <= 0xbf5b) || // Lo  [27] HANGUL SYLLABLE BBOG..HANGUL SYLLABLE BBOH
        (0xbf5d <= code && code <= 0xbf77) || // Lo  [27] HANGUL SYLLABLE BBWAG..HANGUL SYLLABLE BBWAH
        (0xbf79 <= code && code <= 0xbf93) || // Lo  [27] HANGUL SYLLABLE BBWAEG..HANGUL SYLLABLE BBWAEH
        (0xbf95 <= code && code <= 0xbfaf) || // Lo  [27] HANGUL SYLLABLE BBOEG..HANGUL SYLLABLE BBOEH
        (0xbfb1 <= code && code <= 0xbfcb) || // Lo  [27] HANGUL SYLLABLE BBYOG..HANGUL SYLLABLE BBYOH
        (0xbfcd <= code && code <= 0xbfe7) || // Lo  [27] HANGUL SYLLABLE BBUG..HANGUL SYLLABLE BBUH
        (0xbfe9 <= code && code <= 0xc003) || // Lo  [27] HANGUL SYLLABLE BBWEOG..HANGUL SYLLABLE BBWEOH
        (0xc005 <= code && code <= 0xc01f) || // Lo  [27] HANGUL SYLLABLE BBWEG..HANGUL SYLLABLE BBWEH
        (0xc021 <= code && code <= 0xc03b) || // Lo  [27] HANGUL SYLLABLE BBWIG..HANGUL SYLLABLE BBWIH
        (0xc03d <= code && code <= 0xc057) || // Lo  [27] HANGUL SYLLABLE BBYUG..HANGUL SYLLABLE BBYUH
        (0xc059 <= code && code <= 0xc073) || // Lo  [27] HANGUL SYLLABLE BBEUG..HANGUL SYLLABLE BBEUH
        (0xc075 <= code && code <= 0xc08f) || // Lo  [27] HANGUL SYLLABLE BBYIG..HANGUL SYLLABLE BBYIH
        (0xc091 <= code && code <= 0xc0ab) || // Lo  [27] HANGUL SYLLABLE BBIG..HANGUL SYLLABLE BBIH
        (0xc0ad <= code && code <= 0xc0c7) || // Lo  [27] HANGUL SYLLABLE SAG..HANGUL SYLLABLE SAH
        (0xc0c9 <= code && code <= 0xc0e3) || // Lo  [27] HANGUL SYLLABLE SAEG..HANGUL SYLLABLE SAEH
        (0xc0e5 <= code && code <= 0xc0ff) || // Lo  [27] HANGUL SYLLABLE SYAG..HANGUL SYLLABLE SYAH
        (0xc101 <= code && code <= 0xc11b) || // Lo  [27] HANGUL SYLLABLE SYAEG..HANGUL SYLLABLE SYAEH
        (0xc11d <= code && code <= 0xc137) || // Lo  [27] HANGUL SYLLABLE SEOG..HANGUL SYLLABLE SEOH
        (0xc139 <= code && code <= 0xc153) || // Lo  [27] HANGUL SYLLABLE SEG..HANGUL SYLLABLE SEH
        (0xc155 <= code && code <= 0xc16f) || // Lo  [27] HANGUL SYLLABLE SYEOG..HANGUL SYLLABLE SYEOH
        (0xc171 <= code && code <= 0xc18b) || // Lo  [27] HANGUL SYLLABLE SYEG..HANGUL SYLLABLE SYEH
        (0xc18d <= code && code <= 0xc1a7) || // Lo  [27] HANGUL SYLLABLE SOG..HANGUL SYLLABLE SOH
        (0xc1a9 <= code && code <= 0xc1c3) || // Lo  [27] HANGUL SYLLABLE SWAG..HANGUL SYLLABLE SWAH
        (0xc1c5 <= code && code <= 0xc1df) || // Lo  [27] HANGUL SYLLABLE SWAEG..HANGUL SYLLABLE SWAEH
        (0xc1e1 <= code && code <= 0xc1fb) || // Lo  [27] HANGUL SYLLABLE SOEG..HANGUL SYLLABLE SOEH
        (0xc1fd <= code && code <= 0xc217) || // Lo  [27] HANGUL SYLLABLE SYOG..HANGUL SYLLABLE SYOH
        (0xc219 <= code && code <= 0xc233) || // Lo  [27] HANGUL SYLLABLE SUG..HANGUL SYLLABLE SUH
        (0xc235 <= code && code <= 0xc24f) || // Lo  [27] HANGUL SYLLABLE SWEOG..HANGUL SYLLABLE SWEOH
        (0xc251 <= code && code <= 0xc26b) || // Lo  [27] HANGUL SYLLABLE SWEG..HANGUL SYLLABLE SWEH
        (0xc26d <= code && code <= 0xc287) || // Lo  [27] HANGUL SYLLABLE SWIG..HANGUL SYLLABLE SWIH
        (0xc289 <= code && code <= 0xc2a3) || // Lo  [27] HANGUL SYLLABLE SYUG..HANGUL SYLLABLE SYUH
        (0xc2a5 <= code && code <= 0xc2bf) || // Lo  [27] HANGUL SYLLABLE SEUG..HANGUL SYLLABLE SEUH
        (0xc2c1 <= code && code <= 0xc2db) || // Lo  [27] HANGUL SYLLABLE SYIG..HANGUL SYLLABLE SYIH
        (0xc2dd <= code && code <= 0xc2f7) || // Lo  [27] HANGUL SYLLABLE SIG..HANGUL SYLLABLE SIH
        (0xc2f9 <= code && code <= 0xc313) || // Lo  [27] HANGUL SYLLABLE SSAG..HANGUL SYLLABLE SSAH
        (0xc315 <= code && code <= 0xc32f) || // Lo  [27] HANGUL SYLLABLE SSAEG..HANGUL SYLLABLE SSAEH
        (0xc331 <= code && code <= 0xc34b) || // Lo  [27] HANGUL SYLLABLE SSYAG..HANGUL SYLLABLE SSYAH
        (0xc34d <= code && code <= 0xc367) || // Lo  [27] HANGUL SYLLABLE SSYAEG..HANGUL SYLLABLE SSYAEH
        (0xc369 <= code && code <= 0xc383) || // Lo  [27] HANGUL SYLLABLE SSEOG..HANGUL SYLLABLE SSEOH
        (0xc385 <= code && code <= 0xc39f) || // Lo  [27] HANGUL SYLLABLE SSEG..HANGUL SYLLABLE SSEH
        (0xc3a1 <= code && code <= 0xc3bb) || // Lo  [27] HANGUL SYLLABLE SSYEOG..HANGUL SYLLABLE SSYEOH
        (0xc3bd <= code && code <= 0xc3d7) || // Lo  [27] HANGUL SYLLABLE SSYEG..HANGUL SYLLABLE SSYEH
        (0xc3d9 <= code && code <= 0xc3f3) || // Lo  [27] HANGUL SYLLABLE SSOG..HANGUL SYLLABLE SSOH
        (0xc3f5 <= code && code <= 0xc40f) || // Lo  [27] HANGUL SYLLABLE SSWAG..HANGUL SYLLABLE SSWAH
        (0xc411 <= code && code <= 0xc42b) || // Lo  [27] HANGUL SYLLABLE SSWAEG..HANGUL SYLLABLE SSWAEH
        (0xc42d <= code && code <= 0xc447) || // Lo  [27] HANGUL SYLLABLE SSOEG..HANGUL SYLLABLE SSOEH
        (0xc449 <= code && code <= 0xc463) || // Lo  [27] HANGUL SYLLABLE SSYOG..HANGUL SYLLABLE SSYOH
        (0xc465 <= code && code <= 0xc47f) || // Lo  [27] HANGUL SYLLABLE SSUG..HANGUL SYLLABLE SSUH
        (0xc481 <= code && code <= 0xc49b) || // Lo  [27] HANGUL SYLLABLE SSWEOG..HANGUL SYLLABLE SSWEOH
        (0xc49d <= code && code <= 0xc4b7) || // Lo  [27] HANGUL SYLLABLE SSWEG..HANGUL SYLLABLE SSWEH
        (0xc4b9 <= code && code <= 0xc4d3) || // Lo  [27] HANGUL SYLLABLE SSWIG..HANGUL SYLLABLE SSWIH
        (0xc4d5 <= code && code <= 0xc4ef) || // Lo  [27] HANGUL SYLLABLE SSYUG..HANGUL SYLLABLE SSYUH
        (0xc4f1 <= code && code <= 0xc50b) || // Lo  [27] HANGUL SYLLABLE SSEUG..HANGUL SYLLABLE SSEUH
        (0xc50d <= code && code <= 0xc527) || // Lo  [27] HANGUL SYLLABLE SSYIG..HANGUL SYLLABLE SSYIH
        (0xc529 <= code && code <= 0xc543) || // Lo  [27] HANGUL SYLLABLE SSIG..HANGUL SYLLABLE SSIH
        (0xc545 <= code && code <= 0xc55f) || // Lo  [27] HANGUL SYLLABLE AG..HANGUL SYLLABLE AH
        (0xc561 <= code && code <= 0xc57b) || // Lo  [27] HANGUL SYLLABLE AEG..HANGUL SYLLABLE AEH
        (0xc57d <= code && code <= 0xc597) || // Lo  [27] HANGUL SYLLABLE YAG..HANGUL SYLLABLE YAH
        (0xc599 <= code && code <= 0xc5b3) || // Lo  [27] HANGUL SYLLABLE YAEG..HANGUL SYLLABLE YAEH
        (0xc5b5 <= code && code <= 0xc5cf) || // Lo  [27] HANGUL SYLLABLE EOG..HANGUL SYLLABLE EOH
        (0xc5d1 <= code && code <= 0xc5eb) || // Lo  [27] HANGUL SYLLABLE EG..HANGUL SYLLABLE EH
        (0xc5ed <= code && code <= 0xc607) || // Lo  [27] HANGUL SYLLABLE YEOG..HANGUL SYLLABLE YEOH
        (0xc609 <= code && code <= 0xc623) || // Lo  [27] HANGUL SYLLABLE YEG..HANGUL SYLLABLE YEH
        (0xc625 <= code && code <= 0xc63f) || // Lo  [27] HANGUL SYLLABLE OG..HANGUL SYLLABLE OH
        (0xc641 <= code && code <= 0xc65b) || // Lo  [27] HANGUL SYLLABLE WAG..HANGUL SYLLABLE WAH
        (0xc65d <= code && code <= 0xc677) || // Lo  [27] HANGUL SYLLABLE WAEG..HANGUL SYLLABLE WAEH
        (0xc679 <= code && code <= 0xc693) || // Lo  [27] HANGUL SYLLABLE OEG..HANGUL SYLLABLE OEH
        (0xc695 <= code && code <= 0xc6af) || // Lo  [27] HANGUL SYLLABLE YOG..HANGUL SYLLABLE YOH
        (0xc6b1 <= code && code <= 0xc6cb) || // Lo  [27] HANGUL SYLLABLE UG..HANGUL SYLLABLE UH
        (0xc6cd <= code && code <= 0xc6e7) || // Lo  [27] HANGUL SYLLABLE WEOG..HANGUL SYLLABLE WEOH
        (0xc6e9 <= code && code <= 0xc703) || // Lo  [27] HANGUL SYLLABLE WEG..HANGUL SYLLABLE WEH
        (0xc705 <= code && code <= 0xc71f) || // Lo  [27] HANGUL SYLLABLE WIG..HANGUL SYLLABLE WIH
        (0xc721 <= code && code <= 0xc73b) || // Lo  [27] HANGUL SYLLABLE YUG..HANGUL SYLLABLE YUH
        (0xc73d <= code && code <= 0xc757) || // Lo  [27] HANGUL SYLLABLE EUG..HANGUL SYLLABLE EUH
        (0xc759 <= code && code <= 0xc773) || // Lo  [27] HANGUL SYLLABLE YIG..HANGUL SYLLABLE YIH
        (0xc775 <= code && code <= 0xc78f) || // Lo  [27] HANGUL SYLLABLE IG..HANGUL SYLLABLE IH
        (0xc791 <= code && code <= 0xc7ab) || // Lo  [27] HANGUL SYLLABLE JAG..HANGUL SYLLABLE JAH
        (0xc7ad <= code && code <= 0xc7c7) || // Lo  [27] HANGUL SYLLABLE JAEG..HANGUL SYLLABLE JAEH
        (0xc7c9 <= code && code <= 0xc7e3) || // Lo  [27] HANGUL SYLLABLE JYAG..HANGUL SYLLABLE JYAH
        (0xc7e5 <= code && code <= 0xc7ff) || // Lo  [27] HANGUL SYLLABLE JYAEG..HANGUL SYLLABLE JYAEH
        (0xc801 <= code && code <= 0xc81b) || // Lo  [27] HANGUL SYLLABLE JEOG..HANGUL SYLLABLE JEOH
        (0xc81d <= code && code <= 0xc837) || // Lo  [27] HANGUL SYLLABLE JEG..HANGUL SYLLABLE JEH
        (0xc839 <= code && code <= 0xc853) || // Lo  [27] HANGUL SYLLABLE JYEOG..HANGUL SYLLABLE JYEOH
        (0xc855 <= code && code <= 0xc86f) || // Lo  [27] HANGUL SYLLABLE JYEG..HANGUL SYLLABLE JYEH
        (0xc871 <= code && code <= 0xc88b) || // Lo  [27] HANGUL SYLLABLE JOG..HANGUL SYLLABLE JOH
        (0xc88d <= code && code <= 0xc8a7) || // Lo  [27] HANGUL SYLLABLE JWAG..HANGUL SYLLABLE JWAH
        (0xc8a9 <= code && code <= 0xc8c3) || // Lo  [27] HANGUL SYLLABLE JWAEG..HANGUL SYLLABLE JWAEH
        (0xc8c5 <= code && code <= 0xc8df) || // Lo  [27] HANGUL SYLLABLE JOEG..HANGUL SYLLABLE JOEH
        (0xc8e1 <= code && code <= 0xc8fb) || // Lo  [27] HANGUL SYLLABLE JYOG..HANGUL SYLLABLE JYOH
        (0xc8fd <= code && code <= 0xc917) || // Lo  [27] HANGUL SYLLABLE JUG..HANGUL SYLLABLE JUH
        (0xc919 <= code && code <= 0xc933) || // Lo  [27] HANGUL SYLLABLE JWEOG..HANGUL SYLLABLE JWEOH
        (0xc935 <= code && code <= 0xc94f) || // Lo  [27] HANGUL SYLLABLE JWEG..HANGUL SYLLABLE JWEH
        (0xc951 <= code && code <= 0xc96b) || // Lo  [27] HANGUL SYLLABLE JWIG..HANGUL SYLLABLE JWIH
        (0xc96d <= code && code <= 0xc987) || // Lo  [27] HANGUL SYLLABLE JYUG..HANGUL SYLLABLE JYUH
        (0xc989 <= code && code <= 0xc9a3) || // Lo  [27] HANGUL SYLLABLE JEUG..HANGUL SYLLABLE JEUH
        (0xc9a5 <= code && code <= 0xc9bf) || // Lo  [27] HANGUL SYLLABLE JYIG..HANGUL SYLLABLE JYIH
        (0xc9c1 <= code && code <= 0xc9db) || // Lo  [27] HANGUL SYLLABLE JIG..HANGUL SYLLABLE JIH
        (0xc9dd <= code && code <= 0xc9f7) || // Lo  [27] HANGUL SYLLABLE JJAG..HANGUL SYLLABLE JJAH
        (0xc9f9 <= code && code <= 0xca13) || // Lo  [27] HANGUL SYLLABLE JJAEG..HANGUL SYLLABLE JJAEH
        (0xca15 <= code && code <= 0xca2f) || // Lo  [27] HANGUL SYLLABLE JJYAG..HANGUL SYLLABLE JJYAH
        (0xca31 <= code && code <= 0xca4b) || // Lo  [27] HANGUL SYLLABLE JJYAEG..HANGUL SYLLABLE JJYAEH
        (0xca4d <= code && code <= 0xca67) || // Lo  [27] HANGUL SYLLABLE JJEOG..HANGUL SYLLABLE JJEOH
        (0xca69 <= code && code <= 0xca83) || // Lo  [27] HANGUL SYLLABLE JJEG..HANGUL SYLLABLE JJEH
        (0xca85 <= code && code <= 0xca9f) || // Lo  [27] HANGUL SYLLABLE JJYEOG..HANGUL SYLLABLE JJYEOH
        (0xcaa1 <= code && code <= 0xcabb) || // Lo  [27] HANGUL SYLLABLE JJYEG..HANGUL SYLLABLE JJYEH
        (0xcabd <= code && code <= 0xcad7) || // Lo  [27] HANGUL SYLLABLE JJOG..HANGUL SYLLABLE JJOH
        (0xcad9 <= code && code <= 0xcaf3) || // Lo  [27] HANGUL SYLLABLE JJWAG..HANGUL SYLLABLE JJWAH
        (0xcaf5 <= code && code <= 0xcb0f) || // Lo  [27] HANGUL SYLLABLE JJWAEG..HANGUL SYLLABLE JJWAEH
        (0xcb11 <= code && code <= 0xcb2b) || // Lo  [27] HANGUL SYLLABLE JJOEG..HANGUL SYLLABLE JJOEH
        (0xcb2d <= code && code <= 0xcb47) || // Lo  [27] HANGUL SYLLABLE JJYOG..HANGUL SYLLABLE JJYOH
        (0xcb49 <= code && code <= 0xcb63) || // Lo  [27] HANGUL SYLLABLE JJUG..HANGUL SYLLABLE JJUH
        (0xcb65 <= code && code <= 0xcb7f) || // Lo  [27] HANGUL SYLLABLE JJWEOG..HANGUL SYLLABLE JJWEOH
        (0xcb81 <= code && code <= 0xcb9b) || // Lo  [27] HANGUL SYLLABLE JJWEG..HANGUL SYLLABLE JJWEH
        (0xcb9d <= code && code <= 0xcbb7) || // Lo  [27] HANGUL SYLLABLE JJWIG..HANGUL SYLLABLE JJWIH
        (0xcbb9 <= code && code <= 0xcbd3) || // Lo  [27] HANGUL SYLLABLE JJYUG..HANGUL SYLLABLE JJYUH
        (0xcbd5 <= code && code <= 0xcbef) || // Lo  [27] HANGUL SYLLABLE JJEUG..HANGUL SYLLABLE JJEUH
        (0xcbf1 <= code && code <= 0xcc0b) || // Lo  [27] HANGUL SYLLABLE JJYIG..HANGUL SYLLABLE JJYIH
        (0xcc0d <= code && code <= 0xcc27) || // Lo  [27] HANGUL SYLLABLE JJIG..HANGUL SYLLABLE JJIH
        (0xcc29 <= code && code <= 0xcc43) || // Lo  [27] HANGUL SYLLABLE CAG..HANGUL SYLLABLE CAH
        (0xcc45 <= code && code <= 0xcc5f) || // Lo  [27] HANGUL SYLLABLE CAEG..HANGUL SYLLABLE CAEH
        (0xcc61 <= code && code <= 0xcc7b) || // Lo  [27] HANGUL SYLLABLE CYAG..HANGUL SYLLABLE CYAH
        (0xcc7d <= code && code <= 0xcc97) || // Lo  [27] HANGUL SYLLABLE CYAEG..HANGUL SYLLABLE CYAEH
        (0xcc99 <= code && code <= 0xccb3) || // Lo  [27] HANGUL SYLLABLE CEOG..HANGUL SYLLABLE CEOH
        (0xccb5 <= code && code <= 0xcccf) || // Lo  [27] HANGUL SYLLABLE CEG..HANGUL SYLLABLE CEH
        (0xccd1 <= code && code <= 0xcceb) || // Lo  [27] HANGUL SYLLABLE CYEOG..HANGUL SYLLABLE CYEOH
        (0xcced <= code && code <= 0xcd07) || // Lo  [27] HANGUL SYLLABLE CYEG..HANGUL SYLLABLE CYEH
        (0xcd09 <= code && code <= 0xcd23) || // Lo  [27] HANGUL SYLLABLE COG..HANGUL SYLLABLE COH
        (0xcd25 <= code && code <= 0xcd3f) || // Lo  [27] HANGUL SYLLABLE CWAG..HANGUL SYLLABLE CWAH
        (0xcd41 <= code && code <= 0xcd5b) || // Lo  [27] HANGUL SYLLABLE CWAEG..HANGUL SYLLABLE CWAEH
        (0xcd5d <= code && code <= 0xcd77) || // Lo  [27] HANGUL SYLLABLE COEG..HANGUL SYLLABLE COEH
        (0xcd79 <= code && code <= 0xcd93) || // Lo  [27] HANGUL SYLLABLE CYOG..HANGUL SYLLABLE CYOH
        (0xcd95 <= code && code <= 0xcdaf) || // Lo  [27] HANGUL SYLLABLE CUG..HANGUL SYLLABLE CUH
        (0xcdb1 <= code && code <= 0xcdcb) || // Lo  [27] HANGUL SYLLABLE CWEOG..HANGUL SYLLABLE CWEOH
        (0xcdcd <= code && code <= 0xcde7) || // Lo  [27] HANGUL SYLLABLE CWEG..HANGUL SYLLABLE CWEH
        (0xcde9 <= code && code <= 0xce03) || // Lo  [27] HANGUL SYLLABLE CWIG..HANGUL SYLLABLE CWIH
        (0xce05 <= code && code <= 0xce1f) || // Lo  [27] HANGUL SYLLABLE CYUG..HANGUL SYLLABLE CYUH
        (0xce21 <= code && code <= 0xce3b) || // Lo  [27] HANGUL SYLLABLE CEUG..HANGUL SYLLABLE CEUH
        (0xce3d <= code && code <= 0xce57) || // Lo  [27] HANGUL SYLLABLE CYIG..HANGUL SYLLABLE CYIH
        (0xce59 <= code && code <= 0xce73) || // Lo  [27] HANGUL SYLLABLE CIG..HANGUL SYLLABLE CIH
        (0xce75 <= code && code <= 0xce8f) || // Lo  [27] HANGUL SYLLABLE KAG..HANGUL SYLLABLE KAH
        (0xce91 <= code && code <= 0xceab) || // Lo  [27] HANGUL SYLLABLE KAEG..HANGUL SYLLABLE KAEH
        (0xcead <= code && code <= 0xcec7) || // Lo  [27] HANGUL SYLLABLE KYAG..HANGUL SYLLABLE KYAH
        (0xcec9 <= code && code <= 0xcee3) || // Lo  [27] HANGUL SYLLABLE KYAEG..HANGUL SYLLABLE KYAEH
        (0xcee5 <= code && code <= 0xceff) || // Lo  [27] HANGUL SYLLABLE KEOG..HANGUL SYLLABLE KEOH
        (0xcf01 <= code && code <= 0xcf1b) || // Lo  [27] HANGUL SYLLABLE KEG..HANGUL SYLLABLE KEH
        (0xcf1d <= code && code <= 0xcf37) || // Lo  [27] HANGUL SYLLABLE KYEOG..HANGUL SYLLABLE KYEOH
        (0xcf39 <= code && code <= 0xcf53) || // Lo  [27] HANGUL SYLLABLE KYEG..HANGUL SYLLABLE KYEH
        (0xcf55 <= code && code <= 0xcf6f) || // Lo  [27] HANGUL SYLLABLE KOG..HANGUL SYLLABLE KOH
        (0xcf71 <= code && code <= 0xcf8b) || // Lo  [27] HANGUL SYLLABLE KWAG..HANGUL SYLLABLE KWAH
        (0xcf8d <= code && code <= 0xcfa7) || // Lo  [27] HANGUL SYLLABLE KWAEG..HANGUL SYLLABLE KWAEH
        (0xcfa9 <= code && code <= 0xcfc3) || // Lo  [27] HANGUL SYLLABLE KOEG..HANGUL SYLLABLE KOEH
        (0xcfc5 <= code && code <= 0xcfdf) || // Lo  [27] HANGUL SYLLABLE KYOG..HANGUL SYLLABLE KYOH
        (0xcfe1 <= code && code <= 0xcffb) || // Lo  [27] HANGUL SYLLABLE KUG..HANGUL SYLLABLE KUH
        (0xcffd <= code && code <= 0xd017) || // Lo  [27] HANGUL SYLLABLE KWEOG..HANGUL SYLLABLE KWEOH
        (0xd019 <= code && code <= 0xd033) || // Lo  [27] HANGUL SYLLABLE KWEG..HANGUL SYLLABLE KWEH
        (0xd035 <= code && code <= 0xd04f) || // Lo  [27] HANGUL SYLLABLE KWIG..HANGUL SYLLABLE KWIH
        (0xd051 <= code && code <= 0xd06b) || // Lo  [27] HANGUL SYLLABLE KYUG..HANGUL SYLLABLE KYUH
        (0xd06d <= code && code <= 0xd087) || // Lo  [27] HANGUL SYLLABLE KEUG..HANGUL SYLLABLE KEUH
        (0xd089 <= code && code <= 0xd0a3) || // Lo  [27] HANGUL SYLLABLE KYIG..HANGUL SYLLABLE KYIH
        (0xd0a5 <= code && code <= 0xd0bf) || // Lo  [27] HANGUL SYLLABLE KIG..HANGUL SYLLABLE KIH
        (0xd0c1 <= code && code <= 0xd0db) || // Lo  [27] HANGUL SYLLABLE TAG..HANGUL SYLLABLE TAH
        (0xd0dd <= code && code <= 0xd0f7) || // Lo  [27] HANGUL SYLLABLE TAEG..HANGUL SYLLABLE TAEH
        (0xd0f9 <= code && code <= 0xd113) || // Lo  [27] HANGUL SYLLABLE TYAG..HANGUL SYLLABLE TYAH
        (0xd115 <= code && code <= 0xd12f) || // Lo  [27] HANGUL SYLLABLE TYAEG..HANGUL SYLLABLE TYAEH
        (0xd131 <= code && code <= 0xd14b) || // Lo  [27] HANGUL SYLLABLE TEOG..HANGUL SYLLABLE TEOH
        (0xd14d <= code && code <= 0xd167) || // Lo  [27] HANGUL SYLLABLE TEG..HANGUL SYLLABLE TEH
        (0xd169 <= code && code <= 0xd183) || // Lo  [27] HANGUL SYLLABLE TYEOG..HANGUL SYLLABLE TYEOH
        (0xd185 <= code && code <= 0xd19f) || // Lo  [27] HANGUL SYLLABLE TYEG..HANGUL SYLLABLE TYEH
        (0xd1a1 <= code && code <= 0xd1bb) || // Lo  [27] HANGUL SYLLABLE TOG..HANGUL SYLLABLE TOH
        (0xd1bd <= code && code <= 0xd1d7) || // Lo  [27] HANGUL SYLLABLE TWAG..HANGUL SYLLABLE TWAH
        (0xd1d9 <= code && code <= 0xd1f3) || // Lo  [27] HANGUL SYLLABLE TWAEG..HANGUL SYLLABLE TWAEH
        (0xd1f5 <= code && code <= 0xd20f) || // Lo  [27] HANGUL SYLLABLE TOEG..HANGUL SYLLABLE TOEH
        (0xd211 <= code && code <= 0xd22b) || // Lo  [27] HANGUL SYLLABLE TYOG..HANGUL SYLLABLE TYOH
        (0xd22d <= code && code <= 0xd247) || // Lo  [27] HANGUL SYLLABLE TUG..HANGUL SYLLABLE TUH
        (0xd249 <= code && code <= 0xd263) || // Lo  [27] HANGUL SYLLABLE TWEOG..HANGUL SYLLABLE TWEOH
        (0xd265 <= code && code <= 0xd27f) || // Lo  [27] HANGUL SYLLABLE TWEG..HANGUL SYLLABLE TWEH
        (0xd281 <= code && code <= 0xd29b) || // Lo  [27] HANGUL SYLLABLE TWIG..HANGUL SYLLABLE TWIH
        (0xd29d <= code && code <= 0xd2b7) || // Lo  [27] HANGUL SYLLABLE TYUG..HANGUL SYLLABLE TYUH
        (0xd2b9 <= code && code <= 0xd2d3) || // Lo  [27] HANGUL SYLLABLE TEUG..HANGUL SYLLABLE TEUH
        (0xd2d5 <= code && code <= 0xd2ef) || // Lo  [27] HANGUL SYLLABLE TYIG..HANGUL SYLLABLE TYIH
        (0xd2f1 <= code && code <= 0xd30b) || // Lo  [27] HANGUL SYLLABLE TIG..HANGUL SYLLABLE TIH
        (0xd30d <= code && code <= 0xd327) || // Lo  [27] HANGUL SYLLABLE PAG..HANGUL SYLLABLE PAH
        (0xd329 <= code && code <= 0xd343) || // Lo  [27] HANGUL SYLLABLE PAEG..HANGUL SYLLABLE PAEH
        (0xd345 <= code && code <= 0xd35f) || // Lo  [27] HANGUL SYLLABLE PYAG..HANGUL SYLLABLE PYAH
        (0xd361 <= code && code <= 0xd37b) || // Lo  [27] HANGUL SYLLABLE PYAEG..HANGUL SYLLABLE PYAEH
        (0xd37d <= code && code <= 0xd397) || // Lo  [27] HANGUL SYLLABLE PEOG..HANGUL SYLLABLE PEOH
        (0xd399 <= code && code <= 0xd3b3) || // Lo  [27] HANGUL SYLLABLE PEG..HANGUL SYLLABLE PEH
        (0xd3b5 <= code && code <= 0xd3cf) || // Lo  [27] HANGUL SYLLABLE PYEOG..HANGUL SYLLABLE PYEOH
        (0xd3d1 <= code && code <= 0xd3eb) || // Lo  [27] HANGUL SYLLABLE PYEG..HANGUL SYLLABLE PYEH
        (0xd3ed <= code && code <= 0xd407) || // Lo  [27] HANGUL SYLLABLE POG..HANGUL SYLLABLE POH
        (0xd409 <= code && code <= 0xd423) || // Lo  [27] HANGUL SYLLABLE PWAG..HANGUL SYLLABLE PWAH
        (0xd425 <= code && code <= 0xd43f) || // Lo  [27] HANGUL SYLLABLE PWAEG..HANGUL SYLLABLE PWAEH
        (0xd441 <= code && code <= 0xd45b) || // Lo  [27] HANGUL SYLLABLE POEG..HANGUL SYLLABLE POEH
        (0xd45d <= code && code <= 0xd477) || // Lo  [27] HANGUL SYLLABLE PYOG..HANGUL SYLLABLE PYOH
        (0xd479 <= code && code <= 0xd493) || // Lo  [27] HANGUL SYLLABLE PUG..HANGUL SYLLABLE PUH
        (0xd495 <= code && code <= 0xd4af) || // Lo  [27] HANGUL SYLLABLE PWEOG..HANGUL SYLLABLE PWEOH
        (0xd4b1 <= code && code <= 0xd4cb) || // Lo  [27] HANGUL SYLLABLE PWEG..HANGUL SYLLABLE PWEH
        (0xd4cd <= code && code <= 0xd4e7) || // Lo  [27] HANGUL SYLLABLE PWIG..HANGUL SYLLABLE PWIH
        (0xd4e9 <= code && code <= 0xd503) || // Lo  [27] HANGUL SYLLABLE PYUG..HANGUL SYLLABLE PYUH
        (0xd505 <= code && code <= 0xd51f) || // Lo  [27] HANGUL SYLLABLE PEUG..HANGUL SYLLABLE PEUH
        (0xd521 <= code && code <= 0xd53b) || // Lo  [27] HANGUL SYLLABLE PYIG..HANGUL SYLLABLE PYIH
        (0xd53d <= code && code <= 0xd557) || // Lo  [27] HANGUL SYLLABLE PIG..HANGUL SYLLABLE PIH
        (0xd559 <= code && code <= 0xd573) || // Lo  [27] HANGUL SYLLABLE HAG..HANGUL SYLLABLE HAH
        (0xd575 <= code && code <= 0xd58f) || // Lo  [27] HANGUL SYLLABLE HAEG..HANGUL SYLLABLE HAEH
        (0xd591 <= code && code <= 0xd5ab) || // Lo  [27] HANGUL SYLLABLE HYAG..HANGUL SYLLABLE HYAH
        (0xd5ad <= code && code <= 0xd5c7) || // Lo  [27] HANGUL SYLLABLE HYAEG..HANGUL SYLLABLE HYAEH
        (0xd5c9 <= code && code <= 0xd5e3) || // Lo  [27] HANGUL SYLLABLE HEOG..HANGUL SYLLABLE HEOH
        (0xd5e5 <= code && code <= 0xd5ff) || // Lo  [27] HANGUL SYLLABLE HEG..HANGUL SYLLABLE HEH
        (0xd601 <= code && code <= 0xd61b) || // Lo  [27] HANGUL SYLLABLE HYEOG..HANGUL SYLLABLE HYEOH
        (0xd61d <= code && code <= 0xd637) || // Lo  [27] HANGUL SYLLABLE HYEG..HANGUL SYLLABLE HYEH
        (0xd639 <= code && code <= 0xd653) || // Lo  [27] HANGUL SYLLABLE HOG..HANGUL SYLLABLE HOH
        (0xd655 <= code && code <= 0xd66f) || // Lo  [27] HANGUL SYLLABLE HWAG..HANGUL SYLLABLE HWAH
        (0xd671 <= code && code <= 0xd68b) || // Lo  [27] HANGUL SYLLABLE HWAEG..HANGUL SYLLABLE HWAEH
        (0xd68d <= code && code <= 0xd6a7) || // Lo  [27] HANGUL SYLLABLE HOEG..HANGUL SYLLABLE HOEH
        (0xd6a9 <= code && code <= 0xd6c3) || // Lo  [27] HANGUL SYLLABLE HYOG..HANGUL SYLLABLE HYOH
        (0xd6c5 <= code && code <= 0xd6df) || // Lo  [27] HANGUL SYLLABLE HUG..HANGUL SYLLABLE HUH
        (0xd6e1 <= code && code <= 0xd6fb) || // Lo  [27] HANGUL SYLLABLE HWEOG..HANGUL SYLLABLE HWEOH
        (0xd6fd <= code && code <= 0xd717) || // Lo  [27] HANGUL SYLLABLE HWEG..HANGUL SYLLABLE HWEH
        (0xd719 <= code && code <= 0xd733) || // Lo  [27] HANGUL SYLLABLE HWIG..HANGUL SYLLABLE HWIH
        (0xd735 <= code && code <= 0xd74f) || // Lo  [27] HANGUL SYLLABLE HYUG..HANGUL SYLLABLE HYUH
        (0xd751 <= code && code <= 0xd76b) || // Lo  [27] HANGUL SYLLABLE HEUG..HANGUL SYLLABLE HEUH
        (0xd76d <= code && code <= 0xd787) || // Lo  [27] HANGUL SYLLABLE HYIG..HANGUL SYLLABLE HYIH
        (0xd789 <= code && code <= 0xd7a3) // Lo  [27] HANGUL SYLLABLE HIG..HANGUL SYLLABLE HIH
      ) {
        return LVT;
      }

      if (
        0x261d == code || // So       WHITE UP POINTING INDEX
        0x26f9 == code || // So       PERSON WITH BALL
        (0x270a <= code && code <= 0x270d) || // So   [4] RAISED FIST..WRITING HAND
        0x1f385 == code || // So       FATHER CHRISTMAS
        (0x1f3c2 <= code && code <= 0x1f3c4) || // So   [3] SNOWBOARDER..SURFER
        0x1f3c7 == code || // So       HORSE RACING
        (0x1f3ca <= code && code <= 0x1f3cc) || // So   [3] SWIMMER..GOLFER
        (0x1f442 <= code && code <= 0x1f443) || // So   [2] EAR..NOSE
        (0x1f446 <= code && code <= 0x1f450) || // So  [11] WHITE UP POINTING BACKHAND INDEX..OPEN HANDS SIGN
        0x1f46e == code || // So       POLICE OFFICER
        (0x1f470 <= code && code <= 0x1f478) || // So   [9] BRIDE WITH VEIL..PRINCESS
        0x1f47c == code || // So       BABY ANGEL
        (0x1f481 <= code && code <= 0x1f483) || // So   [3] INFORMATION DESK PERSON..DANCER
        (0x1f485 <= code && code <= 0x1f487) || // So   [3] NAIL POLISH..HAIRCUT
        0x1f4aa == code || // So       FLEXED BICEPS
        (0x1f574 <= code && code <= 0x1f575) || // So   [2] MAN IN BUSINESS SUIT LEVITATING..SLEUTH OR SPY
        0x1f57a == code || // So       MAN DANCING
        0x1f590 == code || // So       RAISED HAND WITH FINGERS SPLAYED
        (0x1f595 <= code && code <= 0x1f596) || // So   [2] REVERSED HAND WITH MIDDLE FINGER EXTENDED..RAISED HAND WITH PART BETWEEN MIDDLE AND RING FINGERS
        (0x1f645 <= code && code <= 0x1f647) || // So   [3] FACE WITH NO GOOD GESTURE..PERSON BOWING DEEPLY
        (0x1f64b <= code && code <= 0x1f64f) || // So   [5] HAPPY PERSON RAISING ONE HAND..PERSON WITH FOLDED HANDS
        0x1f6a3 == code || // So       ROWBOAT
        (0x1f6b4 <= code && code <= 0x1f6b6) || // So   [3] BICYCLIST..PEDESTRIAN
        0x1f6c0 == code || // So       BATH
        0x1f6cc == code || // So       SLEEPING ACCOMMODATION
        (0x1f918 <= code && code <= 0x1f91c) || // So   [5] SIGN OF THE HORNS..RIGHT-FACING FIST
        (0x1f91e <= code && code <= 0x1f91f) || // So   [2] HAND WITH INDEX AND MIDDLE FINGERS CROSSED..I LOVE YOU HAND SIGN
        0x1f926 == code || // So       FACE PALM
        (0x1f930 <= code && code <= 0x1f939) || // So  [10] PREGNANT WOMAN..JUGGLING
        (0x1f93d <= code && code <= 0x1f93e) || // So   [2] WATER POLO..HANDBALL
        (0x1f9d1 <= code && code <= 0x1f9dd) // So  [13] ADULT..ELF
      ) {
        return E_Base;
      }

      if (
        0x1f3fb <= code &&
        code <= 0x1f3ff // Sk   [5] EMOJI MODIFIER FITZPATRICK TYPE-1-2..EMOJI MODIFIER FITZPATRICK TYPE-6
      ) {
        return E_Modifier;
      }

      if (
        0x200d == code // Cf       ZERO WIDTH JOINER
      ) {
        return ZWJ;
      }

      if (
        0x2640 == code || // So       FEMALE SIGN
        0x2642 == code || // So       MALE SIGN
        (0x2695 <= code && code <= 0x2696) || // So   [2] STAFF OF AESCULAPIUS..SCALES
        0x2708 == code || // So       AIRPLANE
        0x2764 == code || // So       HEAVY BLACK HEART
        0x1f308 == code || // So       RAINBOW
        0x1f33e == code || // So       EAR OF RICE
        0x1f373 == code || // So       COOKING
        0x1f393 == code || // So       GRADUATION CAP
        0x1f3a4 == code || // So       MICROPHONE
        0x1f3a8 == code || // So       ARTIST PALETTE
        0x1f3eb == code || // So       SCHOOL
        0x1f3ed == code || // So       FACTORY
        0x1f48b == code || // So       KISS MARK
        (0x1f4bb <= code && code <= 0x1f4bc) || // So   [2] PERSONAL COMPUTER..BRIEFCASE
        0x1f527 == code || // So       WRENCH
        0x1f52c == code || // So       MICROSCOPE
        0x1f5e8 == code || // So       LEFT SPEECH BUBBLE
        0x1f680 == code || // So       ROCKET
        0x1f692 == code // So       FIRE ENGINE
      ) {
        return Glue_After_Zwj;
      }

      if (
        0x1f466 <= code &&
        code <= 0x1f469 // So   [4] BOY..WOMAN
      ) {
        return E_Base_GAZ;
      }

      //all unlisted characters have a grapheme break property of "Other"
      return Other;
    }
    return this;
  }

  var graphemeSplitter = GraphemeSplitter();
};
