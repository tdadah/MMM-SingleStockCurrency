# MMM-SingleStockCurrency
A MagicMirror Module for displaying a single stock or currency. This is a fork of [MMM-SingleStock](https://github.com/balassy/MMM-SingleStock).

## Features

By default this module displays the symbol and the current price of the configured stock:

![Default](doc/screenshot-default.png)

If you wish, you can completely remove the prefix, and display only the price value:

![Without prefix](doc/screenshot-none.png)

You can even configure any custom prefix, for example a dollar sign:

![With custom prefix](doc/screenshot-customprefix.png)

The second line of the module displays the change of the price which can be hidden if you prefer:

![Without second line](doc/screenshot-nochange.png)

You can also configure the module to display a percent change in the price:

![Percent Change](doc/screenshot-percentchange.png)

Finally, this module also supports a smaller view as well as colorizing the percentage change and highlight the stock value:

![Minimal](doc/screenshot-minimizedcolorized.png)

This module is capable to display only a single stock price. If you would like to see the price of more stocks on your mirror, add this module multiple times.

## Using the module

To use this module follow these steps:

1. Clone this repository to the `modules` folder of your MagicMirror:

```bash
git clone https://github.com/tdadah/MMM-SingleStockCurrency.git
```

2. Add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
  modules: [
    {
      module: 'MMM-SingleStockCurrency',
      position: 'top_right',
      config: {
        stockSymbol: 'GOOG',
        apiToken: 'YOUR_TOKEN',  // Unique, private API key obtained from https://api.tiingo.com/documentation/general/connecting
        updateInterval: 3600000, // 1 hour in milliseconds
        showChange: true,        // false | true
        changeType: '',          // 'percent' | ''
        label: 'symbol',         // 'symbol' | 'none' | any string
        colorized: false,        // false | true
        minimal: false           // false | true
      }
    }
  ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `stockSymbol`    | **REQUIRED** The symbol of the stock of what the value should be displayed in this module. <br><br> **Type:** `string` <br>**Default value:** `GOOG`
| `apiToken`       | **REQUIRED** Your unique, private API key for the Tiingo API you can obtain from https://api.tiingo.com/documentation/general/connecting. <br><br> **Type:** `string` <br>**Default value:** `""` (empty string)
| `updateInterval` | *Optional* The frequency of when the module should query the current price of the stock. <br><br>**Type:** `int` (milliseconds) <br>**Default value:** `3600000` milliseconds (1 hour)
| `showChange`     | *Optional* Determines whether the price difference should be also displayed. <br><br>**Type:** `boolean` <br>**Default value:** `true` (yes, the price difference is displayed)
|`changeType`      | *Optional* Allows stock change to be shown as the raw value or as a percent.<br><br>**Type:** `string` <br>**Default Value**: `""` (empty string)<br>**Possible values:** <br>`percent`: Show the change as a percent rather than the raw value.
| `label`          | *Optional* Determines what prefix should be prepended to the price. <br><br>**Type:** `string` <br>**Possible values:** <br>`symbol`: The acronym of the stock (e.g. `GOOG`) is displayed before the price.<br>`none`: Nothing is displayed before the price, only the price is shown.<br>Any other string is displayed as is, e.g. set `$` to display a dollar sign before the price number.<br>**Default value:** `symbol` (the acronym of the stock is displayed before the price)
| `colorized`      | *Optional* Determines whether the price difference should be displayed in red (negative) or green (positive) as well as highlight the current price. <br><br>**Type:** `boolean` <br>**Default value:** `false` (no color highlight)
| `minimal`        | *Optional* Determines whether the module should reduce the font size for a more compact display. <br><br>**Type:** `boolean` <br>**Default value:** `false` (regular font size)

## How it works

This module periodically sends requests from the browser window of the MagicMirror Electron application to the [IEX Cloud Service](https://iextrading.com/developer/). The IEX Cloud API has [multiple tiers](https://iexcloud.io/pricing/) including a free tier which is suitable for this module. However to access the API you need a unique, private API Token.

You can sign up to Tiingo by visiting this URL: https://api.tiingo.com/documentation/general/overview

## Localization

Currently this module supports English (`en`) and Hungarian (`hu`) languages. The language can be specified in the global `language` setting in the `config.js` file.

## Contribution

1. Install developer dependencies:

```bash
npm install
```

2. Run all linters:

```bash
npm run lint
```

## Acknowledments

This project is a fork of [György Balássy's](https://www.linkedin.com/in/balassy) [MMM-SingleStock](https://github.com/balassy/MMM-SingleStock) module.
