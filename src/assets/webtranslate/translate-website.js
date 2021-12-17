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

$(document).ready(function() {
  var letsmtTranslatePagePrefix = Tilde.PageTranslateWidgetClientConfiguration.TranslatePagePrefix;
  var embedded = true;

  // when opening new page, don't start auto-translating because previous translation system is remembered in cookie
  document.cookie = 'letsmt-translation-system=;path=/;expires=' + new Date().toUTCString();

  var getQueryStringParameters = function() {
    var vars = [],
      hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
  };

  var queryStringParameters = getQueryStringParameters();
  var url = queryStringParameters['url'];
  var embeddedStyle = queryStringParameters['embeddedStyle'];
  var appId = queryStringParameters['appId'];
  var fakeUnload = appId && appId == 'presidency.kiosk';
  var termCorpusId = null;

  // style tweaks when system list not visible
  if (embeddedStyle == 'noSystemList') {
    $('#letsmt-translate-page-content').addClass('no-system-list');
  }
  // style tweaks when UI is not visible (except for progressbar)
  if (embeddedStyle != 'noUI') {
    $('#letsmt-translate-page-content').removeClass('no-ui');
  }

  function discardMiddleClick(event) {
    if (event.which == 2) {
      event.preventDefault();
    }
  }

  $(document).on('click', discardMiddleClick);

  var iframe = $('#letsmt-translate-page-iframe')[0];
  if (iframe && iframe.contentWindow) {
    suppressMiddleClickOnNewlyLoadedDocument(iframe.contentWindow);
    if (iframe.contentWindow.document) {
      $(iframe.contentWindow.document).on('click', discardMiddleClick);
    }
  }

  // for kiosk app where pages with external loads will block load and unload events
  // check ecvery now and then if page in iframe is changed and emulate "unload" event
  if (fakeUnload) {
    window.setTimeout(function() {
      var oldDoc = null;
      if (iframe && iframe.contentWindow && iframe && iframe.contentWindow.document) {
        oldDoc = iframe.contentWindow.document;
      }
      checkIfDocChanged(oldDoc);
    }, 100);
  }

  function checkIfDocChanged(oldDoc) {
    var iframe = $('#letsmt-translate-page-iframe')[0];
    if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
      var docChanged = false;
      try {
        docChanged = oldDoc != iframe.contentWindow.document;
      } catch (err) {
        docChanged = true;
      }
      if (docChanged) {
        Tilde.oldDocument = oldDoc;
        onUnload();
      }
      var nextOldDoc = iframe.contentWindow.document;
      window.setTimeout(function() {
        checkIfDocChanged(nextOldDoc);
      }, 100);
    }
  }

  var loadingPage = false;
  var showWait = function() {
    if (!loadingPage) {
      if (embeddedStyle != 'noUI') {
        $('#letsmt-translate-page-layout-table-column2').addClass('loading');
      }
      if (embedded) {
        window.parent.postMessage({ message: 'startedLoading' }, '*');
      }
      loadingPage = true;
    }

    if (!fakeUnload) {
      var iframeWindow = $('#letsmt-translate-page-iframe')[0].contentWindow;
      if (iframeWindow && iframeWindow.document) {
        Tilde.oldDocument = iframeWindow.document;
      } else {
        Tilde.oldDocument = null;
      }
    }

    if (Tilde.pageLoadTimeout) {
      window.clearTimeout(Tilde.pageLoadTimeout);
      Tilde.pageLoadTimeout = null;
    }

    Tilde.pageLoadTimeout = window.setTimeout(pageLoaded, 15000); //15 sec page load timeout
  };

  var hideWait = function() {
    if (embeddedStyle != 'noUI') {
      $('#letsmt-translate-page-layout-table-column2').removeClass('loading');
    }
    if (embedded) {
      window.parent.postMessage({ message: 'stoppedLoading' }, '*');
    }
    loadingPage = false;
  };

  var navigateIframe = function(address, autoTranslate) {
    translateAfterLoad = autoTranslate === true;
    // when new url is entered forget previous translation system so that it does not autotranslate the page
    // this is unset in unload event, so that when navigating further by link click, previous system is remembered and auto translation happens
    // don't do this when the current page is about:blank, because unload event won't be fired thus system forgetting will actually
    // happen the next time someone clicks on a link
    forgetPreviousTranslationSystem = $('#letsmt-translate-page-iframe')[0].contentWindow.location.href != 'about:blank';
    showWait();
    address = $.trim(address);
    var lowerCaseAddress = address.toLowerCase();
    var protocol = 'http';
    if (lowerCaseAddress.indexOf('http://') == 0) {
      address = address.substring(7);
    } else if (lowerCaseAddress.indexOf('https://') == 0) {
      protocol = 'https';
      address = address.substring(8);
    }

    var baseUrl = location.href;
    address = location.protocol + "//" + letsmtTranslatePagePrefix + protocol + "/" + address;
    $('#letsmt-translate-page-iframe').attr('name', 'letsmtTranslatePageIframe');
    window.open(address, 'letsmtTranslatePageIframe');
  };

  var navigateOrTranslate = function(address, translateAfterLoad) {
    if (translateAfterLoad) {
      // if translate after load is requested
      // check if requested url is already loaded
      // if it is, do not reload page and just start the translation
      // even if wrong language is selected

      var loadedAddress = '';
      var iframeWindow = $('#letsmt-translate-page-iframe')[0].contentWindow;
      if (iframeWindow && iframeWindow.location && iframeWindow.location.href) {
        loadedAddress = $.trim(proxyUrlToRealUrl(iframeWindow.location.href));
      }

      if (!address || loadedAddress != address) {
        // address is different, load page as usual
      } else {
        // address is already loaded, don't load, just start translation
        Tilde.PageTranslateWidget.translate(null, termCorpusId);
        return;
      }
    }

    navigateIframe(address, translateAfterLoad);
  };

  $('#letsmt-translate-page-address').keypress(function(event) {
    if (event.which == 13) {
      //ENTER
      event.preventDefault();
      navigateIframe($(this).val());
    }
  });

  var translateAfterLoad = false;

  // when widget is loaded, override onTranslateClick
  waitUntilJobDone(
    function() {
      return typeof Tilde !== 'undefined' && Tilde.PageTranslateWidget && Tilde.PageTranslateWidget.loading === false;
    },
    function() {
      if (embeddedStyle != 'noUI') {
        // set tab order for widget
        // (it uses float:right, so element order in html is all wrong,
        // but using different css layout there would be too difficult)
        $('#letsmt-translation-system').attr('tabindex', '4');
        $('#letsmt-translate').attr('tabindex', '5');

        Tilde.PageTranslateWidget.onTranslateClick = function() {
          // if not currently loading page, and entered address is different from loaded address
          // then first load the page, then start translation
          if (!loadingPage) {
            navigateOrTranslate($.trim($('#letsmt-translate-page-address').val()), true);
          }
        };
      }

      resizeLayout();

      if (embedded) {
        // set up communication between translation widget and parent page that hosts the widget page in an iframe
        Tilde.PageTranslateWidget.onSystemChange = function(systemId, changed, auto) {
          window.parent.postMessage({ message: 'systemChanged', systemId: systemId, changed: changed, auto: auto }, '*');
        };

        Tilde.PageTranslateWidget.onTranslationStart = function() {
          window.parent.postMessage({ message: 'translationStarted' }, '*');
          if (embeddedStyle == 'noUI') {
            $('#letsmt-translate-page-content').addClass('loading');
          }
        };

        Tilde.PageTranslateWidget.onTranslationStop = function() {
          window.parent.postMessage({ message: 'translationStopped' }, '*');
          if (embeddedStyle == 'noUI') {
            $('#letsmt-translate-page-content').removeClass('loading');
          }
        };

        Tilde.PageTranslateWidget.onRestoreFinished = function() {
          window.parent.postMessage({ message: 'untranslated' }, '*');
        };

        Tilde.PageTranslateWidget.onTranslated = function() {
          window.parent.postMessage({ message: 'translated' }, '*');
        };

        Tilde.PageTranslateWidget.onError = function(errorMessage) {
          window.parent.postMessage({ message: 'error', description: errorMessage }, '*');
        };

        Tilde.PageTranslateWidget.onWarning = function(warningMessage) {
          window.parent.postMessage({ message: 'warning', description: warningMessage }, '*');
        };

        if (embeddedStyle == 'noUI') {
          Tilde.PageTranslateWidget.onProgress = function(percent) {
            if (percent == 0 || percent == '0%') {
              window.parent.postMessage({ message: 'progress', progress: '1' }, '*');
            } else {
              window.parent.postMessage({ message: 'progress', progress: parseInt(percent) }, '*');
            }
          };
        }

        window.addEventListener(
          'message',
          function(event) {
            if (event.data) {
              switch (event.data.message) {
                case 'changeSystem':
                  Tilde.PageTranslateWidget.changeSystem(event.data.systemId);
                  break;
                case 'loadUrl':
                  termCorpusId = event.data.termCorpusId;
                  navigateOrTranslate(event.data.url, event.data.translateAfterLoad);
                  break;
                case 'translate':
                  if (loadingPage) {
                    window.parent.postMessage(
                      { message: 'warning', description: 'It is not safe to translate a page that is still loading.' },
                      '*'
                    );
                  } else {
                    termCorpusId = event.data.termCorpusId;
                    Tilde.PageTranslateWidget.translate(null, termCorpusId);
                  }
                  break;
                case 'untranslate':
                  Tilde.PageTranslateWidget.cancel();
                  break;
                case 'setSystemList':
                  Tilde.PageTranslateWidget.setTranslationSystemList(event.data.systemList);
                  break;
                default:
                  break;
              }
            }
          },
          false
        );

        window.parent.postMessage({ message: 'ready' }, '*');
      }
    },
    30000
  );

  var smallScreen = function() {
    try {
      return top.innerWidth < window.Tilde.getDefaultFontSize()[0] * 50 || top.innerHeight < window.Tilde.getDefaultFontSize()[1] * 30;
    } catch (err) {
      return (
        window.innerWidth < window.Tilde.getDefaultFontSize()[0] * 50 || window.innerHeight < window.Tilde.getDefaultFontSize()[1] * 30
      );
    }
  };

  var lastIframeWidth = null;
  var lastIframeHeight = null;

  function resizeLayout() {
    if (embeddedStyle != 'noUI') {
      if (window.innerWidth < window.Tilde.getDefaultFontSize()[0] * 35) {
        Tilde.PageTranslateWidget.clientConfiguration.restoreOriginalLinkLength = 1;
      } else if (window.innerWidth > window.Tilde.getDefaultFontSize()[0] * 55) {
        Tilde.PageTranslateWidget.clientConfiguration.restoreOriginalLinkLength = 3;
      } else {
        Tilde.PageTranslateWidget.clientConfiguration.restoreOriginalLinkLength = 2;
      }
    }

    // resize iframe to fit content on small screens and make iframe static
    // so that whole screen can be used for scrolling/zooming (scrolling the header away)
    if (smallScreen()) {
      $('#letsmt-translate-page-iframe-container').css('position', 'static');
      var iframeWindow = $('#letsmt-translate-page-iframe')[0].contentWindow;
      if (iframeWindow && iframeWindow.document && iframeWindow.document.body) {
        if (lastIframeWidth != Math.max(iframeWindow.document.body.scrollWidth, window.innerWidth)) {
          lastIframeWidth = Math.max(iframeWindow.document.body.scrollWidth, window.innerWidth);
          $('#letsmt-translate-page-iframe-container').width(lastIframeWidth);
        }
        if (
          lastIframeHeight != iframeWindow.document.body.scrollHeight + 1 &&
          lastIframeHeight != iframeWindow.document.body.scrollHeight
        ) {
          lastIframeHeight = iframeWindow.document.body.scrollHeight + 32;
          $('#letsmt-translate-page-iframe-container').height(lastIframeHeight);
        }
      } else {
        $('#letsmt-translate-page-iframe-container').css('height', '');
        $('#letsmt-translate-page-iframe-container').css('width', '');
        lastIframeWidth = null;
        lastIframeHeight = null;
      }
    } else {
      $('#letsmt-translate-page-iframe-container').css('height', '');
      $('#letsmt-translate-page-iframe-container').css('width', '');
      $('#letsmt-translate-page-iframe-container').css('position', '');
    }

    window.setTimeout(resizeLayout, 100);
  }

  function proxyUrlToRealUrl(proxyUrl) {
    var proxyIndex = proxyUrl.indexOf(letsmtTranslatePagePrefix);
    if (proxyIndex > -1) {
      var protocolEndIndex = proxyUrl.indexOf('/', proxyIndex + letsmtTranslatePagePrefix.length);
      var protocol = proxyUrl.substring(proxyIndex + letsmtTranslatePagePrefix.length, protocolEndIndex);
      return protocol + '://' + proxyUrl.substring(protocolEndIndex + 1);
    }
    return null;
  }

  function suppressMiddleClickOnNewlyLoadedDocument(iframeWindow) {
    if (iframeWindow && iframeWindow.document) {
      $(iframeWindow).on('unload', function() {
        // wait until enough of the document is loaded to be able to attach mouseclick events
        window.setTimeout(function() {
          waitUntilJobDone(
            function() {
              return iframeWindow && iframeWindow.document;
            },
            function() {
              $(iframeWindow.document).on('click', discardMiddleClick);
            },
            60000
          );
        }, 50);
      });
    }
  }

  function onUnload() {
    showWait();

    $('#letsmt-translate-page-iframe-container').height('auto');
    $('#letsmt-translate-page-iframe-container').width('auto');
    $('#letsmt-translate-page-iframe-container').css('position', 'fixed');

    if (typeof Tilde !== 'undefined' && Tilde.PageTranslateWidget && Tilde.PageTranslateWidget.cancel) {
      Tilde.PageTranslateWidget.cancel(!forgetPreviousTranslationSystem, true);
      forgetPreviousTranslationSystem = false;
    }
  }

  function pageLoaded() {
    var iframeWindow = $('#letsmt-translate-page-iframe')[0].contentWindow;

    if (iframeWindow && iframeWindow.location && iframeWindow.location.href != 'about:blank' && iframeWindow.document) {
      var stillTheSameDocument = false;
      try {
        stillTheSameDocument = iframeWindow.document === Tilde.oldDocument;
      } catch (err) {
        // if we don't have access/premission to old document
        // it means that document has changed
      }

      if (!stillTheSameDocument) {
        Tilde.pageLoadTimeout = null;
        suppressMiddleClickOnNewlyLoadedDocument(iframeWindow);

        var url = proxyUrlToRealUrl(iframeWindow.location.href);
        if (url) {
          if (embeddedStyle != 'noUI') {
            $('#letsmt-translate-page-address').val(url);
          }
          if (embedded) {
            window.parent.postMessage({ message: 'urlLoaded', url: url }, '*');
          }
        }

        if (!fakeUnload) {
          $(iframeWindow).on('unload', onUnload);
        }

        $(iframeWindow.document).ready(function() {
          // page that needs translation could be loaded before translate widget finished loading,
          // so wait before trying to translate it
          waitUntilJobDone(
            function() {
              return typeof Tilde !== 'undefined' && Tilde.PageTranslateWidget && Tilde.PageTranslateWidget.loading === false;
            },
            function() {
              if (
                $(iframeWindow.document)
                  .find('html')
                  .hasClass('error')
              ) {
                // don't try to translate error pages generated by TranslateProxy
                // (common error messages are already localized)
                translateAfterLoad = false;
                if (embedded) {
                  window.parent.postMessage(
                    {
                      message: 'error',
                      description: $(iframeWindow.document)
                        .find('body')
                        .text(),
                      shownInUI: true
                    },
                    '*'
                  );
                }
              } else {
                var loadedPageLanguageCode = $(iframeWindow.document)
                  .find('html')
                  .attr('lang');

                var languageChanged = false;
                if (loadedPageLanguageCode) {
                  languageChanged = Tilde.PageTranslateWidget.setSourceLanguage(loadedPageLanguageCode.substring(0,2));
                }

                if (translateAfterLoad) {
                  if (!languageChanged) {
                    // if page load was initiated by translate button, start translation as soon as page is loaded
                    Tilde.PageTranslateWidget.translate(null, termCorpusId);
                    translateAfterLoad = false;
                  }
                } else {
                  if (Tilde.PageTranslateWidget.autoTranslateIfNeeded) {
                    Tilde.PageTranslateWidget.autoTranslateIfNeeded();
                  }
                }
              }
            },
            30000
          );
        });
      }
    }

    if (!Tilde.pageLoadTimeout) {
      hideWait();
    }
  }

  $('#letsmt-translate-page-iframe').on('load', function() {
    if (Tilde.pageLoadTimeout) {
      window.clearTimeout(Tilde.pageLoadTimeout);
      Tilde.pageLoadTimeout = null;

      pageLoaded();
    }
  });

  $('#letsmt-translate-page-go-to-page-button').click(function() {
    navigateIframe($.trim($('#letsmt-translate-page-address').val()));
  });

  if (url) {
    if (embeddedStyle != 'noUI') {
      $('#letsmt-translate-page-address').val(url);
    }
    navigateIframe(url);
  } else {
    if (embeddedStyle != 'noUI') {
      $('#letsmt-translate-page-address').focus();
    }
  }
});
