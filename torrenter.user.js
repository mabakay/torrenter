// ==UserScript==
// @name           Torrenter
// @namespace      http://www.google.com/search?q=mabakay
// @version        2.2.0
// @description    Adds links to torrent sites on popular movie websites.
// @description:pl Dodaje linki do stron z torrentami na popularnych stronach o filmach.
// @author         mabakay
// @copyright      2010 - 2022, mabakay
// @date           17 April 2022
// @license        MIT
// @run-at         document-end
// @icon64URL      https://raw.githubusercontent.com/mabakay/torrenter/master/torrenter_64.png
// @supportURL     https://github.com/mabakay/torrenter
// @updateURL      https://github.com/mabakay/torrenter/raw/master/torrenter.user.js
// @downloadURL    https://github.com/mabakay/torrenter/raw/master/torrenter.user.js
// @match          http://www.filmweb.pl/*
// @match          https://www.filmweb.pl/*
// @match          http://release24.pl/*
// @match          https://release24.pl/*
// @match          http://www.imdb.com/*
// @match          https://www.imdb.com/*
// @match          http://www.rottentomatoes.com/*
// @match          https://www.rottentomatoes.com/*
// @require        https://openuserjs.org/src/libs/sizzle/GM_config.min.js
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_registerMenuCommand
// ==/UserScript==
"use strict";
var TorrenterConfigurator = /** @class */ (function () {
    function TorrenterConfigurator(language, changeCallback) {
        var _this = this;
        this._language = language;
        if (!GM_config || !GM_registerMenuCommand) {
            return;
        }
        var gmConfiguration = {
            "id": "mabakay_Torrenter",
            "title": this.localization.settingsTitle,
            "fields": {
                "showEngines": {
                    "label": this.localization.showBuildInEngines,
                    "type": "checkbox",
                    "default": true
                },
                "showUserEngines": {
                    "label": this.localization.showUserEngines,
                    "type": "checkbox",
                    "default": false
                },
                "showUserEnginesFirst": {
                    "label": this.localization.showUserEnginesFirst,
                    "type": "checkbox",
                    "default": false
                },
                "userEngines": {
                    "label": this.localization.userEngines,
                    "type": "textarea",
                    "default": "",
                }
            },
            "events": {
                "open": function (document, window, frame) {
                    var userEnginesFiled = document.getElementById("mabakay_Torrenter_field_userEngines");
                    userEnginesFiled.setAttribute("cols", "80");
                    userEnginesFiled.setAttribute("rows", "10");
                    userEnginesFiled.setAttribute("placeholder", _this.localization.eg + " https://search-site.com/?title={title}&year={year}&orderby=seeds[&imdbTag={imdb}]");
                    var enginesFieldDescription = document.createElement("div");
                    enginesFieldDescription.setAttribute("style", "font-size: 12px;margin: 5px 6px;color: gray;");
                    enginesFieldDescription.innerHTML = _this.localization.addEngineDescription;
                    var enginesLabelField = document.getElementById("mabakay_Torrenter_userEngines_field_label");
                    enginesLabelField.after(enginesFieldDescription);
                    var saveButton = document.getElementById("mabakay_Torrenter_saveBtn");
                    saveButton.textContent = _this.localization.saveButtonCaption;
                    var closeButton = document.getElementById("mabakay_Torrenter_closeBtn");
                    closeButton.textContent = _this.localization.closeCaptionButton;
                    var restToDefaultsLink = document.getElementById("mabakay_Torrenter_resetLink");
                    restToDefaultsLink.textContent = _this.localization.resetLinkCaption;
                    GM_config.frame.setAttribute("style", "inset: 166px auto auto 326px;border: 1px solid rgb(0, 0, 0);height: 440px;margin: 0px;opacity: 1;overflow: auto;padding: 0px;position: fixed;width: 650px;z-index: 9999;display: block;");
                },
                "save": function () {
                    GM_config.close();
                    if (changeCallback) {
                        changeCallback();
                    }
                }
            }
        };
        GM_config.init(gmConfiguration);
        GM_registerMenuCommand(this.localization.configureMenuItem, function () { GM_config.open(); });
    }
    Object.defineProperty(TorrenterConfigurator.prototype, "localization", {
        get: function () {
            if (!TorrenterConfigurator._localization.hasOwnProperty(this._language)) {
                return TorrenterConfigurator._localization["en"];
            }
            return TorrenterConfigurator._localization[this._language];
        },
        enumerable: false,
        configurable: true
    });
    TorrenterConfigurator.prototype.getConfigurationProperty = function (name, defaultValue) {
        var _a;
        try {
            return (_a = GM_config.get(name)) !== null && _a !== void 0 ? _a : defaultValue;
        }
        catch (_b) {
            return defaultValue;
        }
    };
    TorrenterConfigurator.getLanguage = function () {
        var lang = (window.navigator.languages ? window.navigator.languages[0] : window.navigator.language).toLowerCase();
        if (lang.indexOf("-") !== -1)
            lang = lang.split("-")[0];
        if (lang.indexOf("_") !== -1)
            lang = lang.split("_")[0];
        return lang;
    };
    TorrenterConfigurator.prototype.getConfiguration = function () {
        return {
            engines: [
                "https://thepiratebay10.org/search/{title}[ {year}]/0/7/0",
                "https://rarbg.to/torrents.php?search={title}[ {year}]&order=seeders&by=DESC[&imdb={imdb}]",
                "https://1337x.to/sort-search/{title}[ {year}]/seeders/desc/1/",
                "https://torrentz2eu.org/index.html?q={title}[ {year}]",
                "https://yts.mx/browse-movies/{title}[/all/all/0/seeds/{year}/all]",
                "https://eztv.re/search/{title}[ {year}]",
                "https://www.torlock.com/?q={title}[ {year}]&sort=seeds&order=desc",
                "https://www.torrentdownloads.me/search/?new=1&s_cat=0&search={title}[ {year}]",
                "https://www.limetorrents.pro/search/all/{title}[ {year}]/seeds/1/"
            ],
            showEngines: this.getConfigurationProperty("showEngines", true),
            showUserEngines: this.getConfigurationProperty("showUserEngines", false),
            showUserEnginesFirst: this.getConfigurationProperty("showUserEnginesFirst", false),
            userEngines: this.getConfigurationProperty("userEngines", "").split(/\r?\n/).filter(function (item) { return !!item; }),
        };
    };
    ;
    TorrenterConfigurator._localization = {
        en: {
            settingsTitle: "Torrenter Script Settings",
            showBuildInEngines: "Show Build-in Engines",
            showUserEngines: "Show User Definied Engines",
            showUserEnginesFirst: "Show User Definied Engines First",
            userEngines: "User Engines",
            eg: "e.g.",
            addEngineDescription: "Type by separating with an enter. Available variables are:</br>&emsp;{title} - movie title</br>&emsp;{year} - movie release year</br>&emsp;{imdb} - position ID in www.imdb.com</br>&emsp;[] - optional fragment, removed if the internal tag is not found by the site processor",
            saveButtonCaption: "Save",
            closeCaptionButton: "Close",
            resetLinkCaption: "Reset to defaults",
            configureMenuItem: "Configure"
        },
        pl: {
            settingsTitle: "Ustawienia skryptu Torrenter",
            showBuildInEngines: "Pokaż wyszukiwarki wbudowane",
            showUserEngines: "Pokaż wyszukiwarki użytkownika",
            showUserEnginesFirst: "Pokaż wyszukiwarki użytkownika jako pierwsze",
            userEngines: "Wyszukiwarki użytkownika",
            eg: "np.",
            addEngineDescription: "Podaj rozdzielając enterem. Dostępne zmienne to:</br>&emsp;{title} - tytuł filmu</br>&emsp;{year} - rok wydania filmu</br>&emsp;{imdb} - ID pozycji w serwisie www.imdb.com</br>&emsp;[] - fragment opcjonalny usuwany jeżeli wewnętrzny tag nie zostanie odnaleziony przez parser strony",
            saveButtonCaption: "Zapisz",
            closeCaptionButton: "Anuluj",
            resetLinkCaption: "Przywróć ustawienia domyślne",
            configureMenuItem: "Skonfiguruj"
        }
    };
    return TorrenterConfigurator;
}());
var Torrenter = /** @class */ (function () {
    function Torrenter() {
    }
    Torrenter.prototype.apply = function (config, siteProcessor) {
        var _this = this;
        var torrenterElements = document.getElementsByClassName("torrenter");
        if (torrenterElements && torrenterElements.length > 0) {
            for (var i = torrenterElements.length - 1; i >= 0; i--) {
                torrenterElements[i].remove();
            }
        }
        setTimeout(function () { siteProcessor(function (tag, style, itemStyle, args) { return _this.createLinkSpan(config, tag, style, itemStyle, args); }); }, 250);
    };
    Torrenter.getSiteProcessor = function (hostName) {
        switch (hostName) {
            case "release24.pl":
                return Torrenter.processRelease24;
            case "www.filmweb.pl":
                return Torrenter.processFilmweb;
            case "www.imdb.com":
                return Torrenter.processImdb;
            case "www.rottentomatoes.com":
                return Torrenter.processRottenTomatoes;
        }
    };
    Torrenter.prototype.createLinkSpan = function (config, tag, style, itemStyle, args) {
        var span = document.createElement(tag);
        span.setAttribute("style", style);
        span.classList.add("torrenter");
        var engines = [];
        if (config.showEngines && config.showUserEngines) {
            if (config.showUserEnginesFirst) {
                engines = config.userEngines.concat(config.engines);
            }
            else {
                engines = config.engines.concat(config.userEngines);
            }
        }
        else if (config.showEngines) {
            engines = config.engines;
        }
        else if (config.showUserEngines) {
            engines = config.userEngines;
        }
        for (var i = 0; i < engines.length; i++) {
            var link = document.createElement("a");
            link.setAttribute("href", Torrenter.format(engines[i], args));
            if (itemStyle) {
                link.setAttribute("style", itemStyle);
            }
            var urlRegex = /(https?:\/\/)(.+?)\//;
            var regexResult = engines[i].match(urlRegex);
            link.innerHTML = Torrenter.getFavIconImg(regexResult[2]);
            link.setAttribute("title", regexResult[2]);
            if (i > 0) {
                var separator = document.createElement("span");
                separator.innerHTML = "&nbsp;|&nbsp;";
                span.appendChild(separator);
            }
            span.appendChild(link);
        }
        return span;
    };
    Torrenter.getFavIconImg = function (url) {
        return '<img src="' + window.location.protocol + '//www.google.com/s2/favicons?domain=' + url + '" width="16px" height="16px">';
    };
    Torrenter.format = function (str, args) {
        return str.replace(/(?:\[[^{}]*?)?{(\w+)}(?:[^{}]*?\])?/g, function (text, placeholder) {
            if (text[0] == "[" && text[text.length - 1] == "]") {
                return args.hasOwnProperty(placeholder) && args[placeholder] != null ? text.substring(1, text.length - 1).replace("{" + placeholder + "}", encodeURIComponent(args[placeholder])) : "";
            }
            else {
                return args.hasOwnProperty(placeholder) ? encodeURIComponent(args[placeholder]) : text;
            }
        });
    };
    Torrenter.processRelease24 = function (createLinkSpan) {
        var titleElement = document.getElementById("mainwindow");
        var loopCount = titleElement.childElementCount;
        for (var i = 1; i < loopCount; i++) {
            var elem = titleElement.children[i];
            if (elem.className === "wpis") {
                var title_regex = /\"(.*)\"\s*(\(([0-9]{4})\))?/;
                var match = elem.children[0].children[0].innerHTML.match(title_regex);
                if (match != null) {
                    var title = match[1];
                    var year = match.length === 4 && match[3] ? match[3] : null;
                    var span = createLinkSpan("span", "margin-left: 1em; font-weight: normal;", "position: relative; top: 5px;", { title: title, year: year });
                    elem.children[2].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].appendChild(span);
                }
            }
        }
    };
    Torrenter.processFilmweb = function (createLinkSpan) {
        var titleElement = document.querySelector(".fP__title");
        var title;
        var year;
        if (titleElement) {
            var smallTitleElement = document.querySelector(".fP__originalTitle");
            if (smallTitleElement) {
                title = smallTitleElement.textContent;
            }
            else {
                title = titleElement.textContent;
            }
            var yearRegexp = /([0-9]{4})/;
            var match = document.querySelector(".fP__year").textContent.match(yearRegexp);
            if (match != null) {
                year = match[1];
            }
        }
        var headerElement = document.querySelector(".fP__titleDetails");
        if (headerElement && title) {
            headerElement.appendChild(createLinkSpan("span", "display: inline-flex;", "position: relative; top: 2px; z-index: 1;", { title: title, year: year }));
        }
    };
    Torrenter.processImdb = function (createLinkSpan) {
        var titleElement = document.querySelector('[data-testid*="block__title"]');
        var title;
        var year;
        if (titleElement) {
            var smallTitleElement = document.querySelector('[data-testid*="original-title"]');
            if (smallTitleElement) {
                title = smallTitleElement.childNodes[0].nodeValue;
                // Remove "Original title" prefix
                var titleRegexp = /Original title: (.*)|.*/;
                var titleMatch = title.match(titleRegexp);
                if (titleMatch != null) {
                    title = titleMatch[1];
                }
            }
            else {
                title = titleElement.childNodes[0].nodeValue;
            }
            var yearElement = document.querySelector('[class*="ipc-inline-list__item"] span');
            if (yearElement) {
                var yearRegexp = /([0-9]{4})/;
                var match = yearElement.textContent.match(yearRegexp);
                if (match != null) {
                    year = match[1];
                }
            }
        }
        var headerElement = document.querySelector('[data-testid*="block__metadata"]');
        if (headerElement && title) {
            var match = window.location.pathname.match(/\/(tt.*?)(?:\/|\?|$)/i);
            var imdb = match != null ? match[1] : null;
            headerElement.appendChild(createLinkSpan("span", "margin-left: 1em; display: inline-block;", null, { title: title, year: year, imdb: imdb }));
        }
    };
    Torrenter.processRottenTomatoes = function (createLinkSpan) {
        var titleElement = document.querySelector(".scoreboard__title");
        var title;
        var year;
        if (titleElement) {
            title = titleElement.textContent;
            var yearRegexp = /([0-9]{4})/;
            var match = document.querySelector(".scoreboard__info").textContent.match(yearRegexp);
            if (match != null) {
                year = match[1];
            }
        }
        var headerElement = document.querySelector(".scoreboard__title");
        if (headerElement && title) {
            headerElement.appendChild(createLinkSpan("span", "margin-left: 1em;font-size: 0.5em;position: relative;top: -7px;", "position: relative; top: 2px;", { title: title, year: year }));
        }
    };
    return Torrenter;
}());
var configurator = new TorrenterConfigurator(TorrenterConfigurator.getLanguage(), function () { applyFunction(configurator.getConfiguration()); });
var config = configurator.getConfiguration();
var hostName = window.location.hostname;
var siteProcessor = Torrenter.getSiteProcessor(hostName);
var applyFunction = function (config) {
    if (siteProcessor) {
        var torrenter = new Torrenter();
        torrenter.apply(config, siteProcessor);
    }
};
applyFunction(config);
