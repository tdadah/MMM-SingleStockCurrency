/* global Module, Log */
/* Magic Mirror Module: MMM-SingleStockCurrency (https://github.com/balassy/MMM-SingleStockCurrency)
 * By Tara Dadah (https://www.linkedin.com/in/taradadah/)
 * A fork of MMM-SingleStock (https://github.com/balassy/MMM-SingleStock) by György Balássy
 * MIT Licensed.
 */

Module.register('MMM-SingleStockCurrency', {
  defaults: {
    stockSymbol: 'GOOG',
    apiToken: '',
    updateInterval: 3600000,
    showChange: true,
    changeType: '',
    colorized: false,
    minimal: false,
    label: 'symbol' // 'symbol' | 'none'
  },

  requiresVersion: '2.1.0',
  url: '',

  getTranslations() {
    return {
      en: 'translations/en.json',
      hu: 'translations/hu.json'
    };
  },

  start() {
    const self = this;
    this.viewModel = null;
    this.hasData = false;

    this._getData(() => self.updateDom());

    setInterval(() => {
      self._getData(() => self.updateDom());
    }, this.config.updateInterval);
  },

  getDom() {
    const wrapper = document.createElement('div');

    if (this.viewModel) {
      const priceEl = document.createElement('div');
      if (this.config.minimal) {
        priceEl.classList = 'small';
      }

      const labelEl = document.createElement('span');
      labelEl.innerHTML = `${this.viewModel.label}`;
      priceEl.appendChild(labelEl);

      const valueEl = document.createElement('span');
      valueEl.innerHTML = ` ${this.viewModel.price}`;
      if (this.config.colorized) {
        valueEl.classList = 'bright';
      }
      priceEl.appendChild(valueEl);

      wrapper.appendChild(priceEl);

      if (this.config.showChange) {
        const changeEl = document.createElement('div');

        changeEl.innerHTML = this.config.changeType === 'percent'
          ? `(${this.viewModel.change}%)`
          : `(${this.viewModel.change})`;

        changeEl.classList = this.config.minimal
          ? 'dimmed xsmall'
          : 'dimmed small';

        if (this.config.colorized) {
          if (this.viewModel.change > 0) {
            changeEl.style = 'color: #a3ea80';
          }
          if (this.viewModel.change < 0) {
            changeEl.style = 'color: #FF8E99';
          }
        }

        wrapper.appendChild(changeEl);
      }
    } else {
      const loadingEl = document.createElement('span');
      loadingEl.innerHTML = this.translate('LOADING', {
        symbol: this.config.stockSymbol
      });
      loadingEl.classList = 'dimmed small';
      wrapper.appendChild(loadingEl);
    }

    return wrapper;
  },

  _getData(onCompleteCallback) {
    const self = this;

    if (self.url === '') {
      const expectedResponseHeaders = [
        'server',
        'date',
        'content-type',
        'content-length',
        'vary',
        'x-frame-options'
      ];
      const requestHeaders = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Token ${this.config.apiToken}` }
      ];

      self.url = this.getCorsUrl(
        `https://api.tiingo.com/iex/?tickers=${this.config.stockSymbol}`,
        requestHeaders,
        expectedResponseHeaders
      );
    }

    Log.info(self.name, self.url);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', self.url, true);
    xhr.onreadystatechange = function onReadyStateChange() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          self._processResponse(this.response);
          onCompleteCallback();
        } else {
          Log.error(self.name, `MMM-SingleStock: XHR status: ${this.status}`);
        }
      }
    };

    xhr.send();
  },

  _processResponse(responseBody) {
    const responseParsed = JSON.parse(responseBody);
    const response = responseParsed[0];

    Log.info(this.name, response);

    this.viewModel = {
      price: response.last
    };

    switch (this.config.changeType) {
      case 'percent':
        this.viewModel.change = (
          ((response.prevClose - response.last) / response.prevClose)
          * 100
        ).toFixed(2);
        break;
      default:
        this.viewModel.change = (response.prevClose - response.last).toFixed(2);
        break;
    }

    switch (this.config.label) {
      case 'symbol':
        this.viewModel.label = response.ticker;
        break;
      case 'none':
        this.viewModel.label = '';
        break;
      default:
        this.viewModel.label = this.config.label;
        break;
    }

    if (!this.hasData) {
      this.updateDom();
    }

    this.hasData = true;
  },

  /**
   * Gets a URL that will be used when calling the CORS-method on the server.
   *
   * @param {string} url the url to fetch from
   * @param {Array.<{name: string, value:string}>} requestHeaders the HTTP headers to send
   * @param {Array.<string>} expectedResponseHeaders the expected HTTP headers to recieve
   * @returns {string} to be used as URL when calling CORS-method on server.
   */
  getCorsUrl(url, requestHeaders, expectedResponseHeaders) {
    if (!url || url.length < 1) {
      throw new Error(`Invalid URL: ${url}`);
    } else {
      // eslint-disable-next-line no-restricted-globals
      let corsUrl = `${location.protocol}//${location.host}/cors?`;

      const requestHeaderString = this.getRequestHeaderString(requestHeaders);
      if (requestHeaderString) corsUrl = `${corsUrl}sendheaders=${requestHeaderString}`;

      // eslint-disable-next-line max-len
      const expectedResponseHeadersString = this.getExpectedResponseHeadersString(expectedResponseHeaders);
      if (requestHeaderString && expectedResponseHeadersString) {
        corsUrl = `${corsUrl}&expectedheaders=${expectedResponseHeadersString}`;
      } else if (expectedResponseHeadersString) {
        corsUrl = `${corsUrl}expectedheaders=${expectedResponseHeadersString}`;
      }

      if (requestHeaderString || expectedResponseHeadersString) {
        return `${corsUrl}&url=${url}`;
      }
      return `${corsUrl}url=${url}`;
    }
  },

  /**
   * Gets the part of the CORS URL that represents the HTTP headers to send.
   *
   * @param {Array.<{name: string, value:string}>} requestHeaders the HTTP headers to send
   * @returns {string} to be used as request-headers component in CORS URL.
   */
  getRequestHeaderString(requestHeaders) {
    let requestHeaderString = '';
    if (requestHeaders) {
      // eslint-disable-next-line no-restricted-syntax
      for (const header of requestHeaders) {
        if (requestHeaderString.length === 0) {
          requestHeaderString = `${header.name}:${encodeURIComponent(
            header.value
          )}`;
        } else {
          requestHeaderString = `${requestHeaderString},${
            header.name
          }:${encodeURIComponent(header.value)}`;
        }
      }
      return requestHeaderString;
    }
    return undefined;
  },

  /**
   * Gets the part of the CORS URL that represents the expected HTTP headers to recieve.
   *
   * @param {Array.<string>} expectedResponseHeaders the expected HTTP headers to recieve
   * @returns {string} to be used as the expected HTTP-headers component in CORS URL.
   */
  getExpectedResponseHeadersString(expectedResponseHeaders) {
    let expectedResponseHeadersString = '';
    if (expectedResponseHeaders) {
      // eslint-disable-next-line no-restricted-syntax
      for (const header of expectedResponseHeaders) {
        if (expectedResponseHeadersString.length === 0) {
          expectedResponseHeadersString = `${header}`;
        } else {
          expectedResponseHeadersString = `${expectedResponseHeadersString},${header}`;
        }
      }
      return expectedResponseHeaders;
    }
    return undefined;
  }
});
