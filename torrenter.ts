// ==UserScript==
// @name           Torrenter
// @namespace      http://www.google.com/search?q=mabakay
// @version        2.0.0
// @description    Adds links to torrent sites on popular movie websites.
// @description:pl Dodaje linki do stron z torrentami na popularnych stronach o filmach.
// @author         mabakay
// @copyright      2010 - 2021, mabakay
// @date           04 November 2021
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

declare var GM_config: {
    init: Function;
    open: Function;
    close: Function;
    get: Function;
    frame: Element;
};

declare var GM_registerMenuCommand: Function;

type CreateLinkSpanFunction = (tag: string, title: string, year: string, style: string, itemStyle?: string) => HTMLElement;
type SiteProcessFunction = (createLinkSpan: CreateLinkSpanFunction) => void;

'use strict';
class TorrenterConfigurator {
    private _language: string;

    private static readonly _localization: Object = {
        en: {
            settingsTitle: 'Torrenter Script Settings',
            showBuildInEngines: 'Show Build-in Engines',
            showUserEngines: 'Show User Definied Engines',
            showUserEnginesFirst: 'Show User Definied Engines First',
            userEngines: 'User Engines',
            eg: 'e.g.',
            addEngineDescription: 'Type by separating with an enter. Available variables are:</br>&emsp;{title} - movie title</br>&emsp;{year} - movie release year',
            saveButtonCaption: 'Save',
            closeCaptionButton: 'Close',
            resetLinkCaption: 'Reset to defaults',
            configureMenuItem: 'Configure'
        },
        pl: {
            settingsTitle: 'Ustawienia skryptu Torrenter',
            showBuildInEngines: 'Pokaż wyszukiwarki wbudowane',
            showUserEngines: 'Pokaż wyszukiwarki użytkownika',
            showUserEnginesFirst: 'Pokaż wyszukiwarki użytkownika jako pierwsze',
            userEngines: 'Wyszukiwarki użytkownika',
            eg: 'np.',
            addEngineDescription: 'Podaj rozdzielając enterem. Dostępne zmienne to:</br>&emsp;{title} - tytuł filmu</br>&emsp;{year} - rok wydania filmu',
            saveButtonCaption: 'Zapisz',
            closeCaptionButton: 'Anuluj',
            resetLinkCaption: 'Przywróć ustawienia domyślne',
            configureMenuItem: 'Skonfiguruj'
        }
    }

    private get localization(): any {
        if (!TorrenterConfigurator._localization.hasOwnProperty(this._language)) {
            return TorrenterConfigurator._localization['en'];
        }

        return TorrenterConfigurator._localization[this._language];
    }

    private getConfigurationProperty(name: string, defaultValue?: any) {
        try {
            return GM_config.get(name) ?? defaultValue;
        } catch {
            return defaultValue;
        }
    }

    static getLanguage(): string {
        let lang = (window.navigator.languages ? window.navigator.languages[0] : window.navigator.language).toLowerCase();

        if (lang.indexOf('-') !== -1)
            lang = lang.split('-')[0];

        if (lang.indexOf('_') !== -1)
            lang = lang.split('_')[0];

        return lang;
    }

    getConfiguration(): any {
        return {
            engines: [
                "https://thepiratebay10.org/search/{title} {year}/0/7/0",
                "https://rarbg.to/torrents.php?search={title} {year}&order=seeders&by=DESC",
                "https://1337x.to/sort-search/{title} {year}/seeders/desc/1/",
                "https://torrentz2eu.org/index.html?q={title} {year}",
                "https://yts.mx/browse-movies/{title}/all/all/0/seeds/{year}/all",
                "https://eztv.re/search/{title} {year}",
                "https://zooqle.com/search?q={title} {year}&s=ns&v=t&sd=d",
                "https://www.torrentdownloads.me/search/?new=1&s_cat=0&search={title} {year}",
                "https://www.limetorrents.pro/search/all/{title} {year}/seeds/1/"
            ],
            showEngines: this.getConfigurationProperty('showEngines', true),
            showUserEngines: this.getConfigurationProperty('showUserEngines', false),
            showUserEnginesFirst: this.getConfigurationProperty('showUserEnginesFirst', false),
            userEngines: this.getConfigurationProperty('userEngines', '').split(/\r?\n/).filter((item) => { return !!item; }),
        };
    }

    constructor(language: string, changeCallback?: CallableFunction) {
        this._language = language;

        if (!GM_config || !GM_registerMenuCommand) {
            return;
        }

        let gmConfiguration = {
            'id': 'mabakay_Torrenter',
            'title': this.localization.settingsTitle,
            'fields': {
                'showEngines': {
                    'label': this.localization.showBuildInEngines,
                    'type': 'checkbox',
                    'default': true
                },
                'showUserEngines': {
                    'label': this.localization.showUserEngines,
                    'type': 'checkbox',
                    'default': false
                },
                'showUserEnginesFirst': {
                    'label': this.localization.showUserEnginesFirst,
                    'type': 'checkbox',
                    'default': false
                },
                'userEngines': {
                    'label': this.localization.userEngines,
                    'type': 'textarea',
                    'default': '',
                }
            },
            'events': {
                'open': (document, window, frame) => {
                    let userEnginesFiled = document.getElementById('mabakay_Torrenter_field_userEngines');
                    userEnginesFiled.setAttribute('cols', '80');
                    userEnginesFiled.setAttribute('rows', '10');
                    userEnginesFiled.setAttribute('placeholder', this.localization.eg + ' https://search-site.com/?title={title}&year={year}&orderby=seeds');

                    let enginesFieldDescription = document.createElement("div");
                    enginesFieldDescription.setAttribute('style', 'font-size: 12px;margin: 5px 6px;color: gray;');
                    enginesFieldDescription.innerHTML = this.localization.addEngineDescription;

                    let enginesLabelField = document.getElementById('mabakay_Torrenter_userEngines_field_label');
                    enginesLabelField.after(enginesFieldDescription);

                    let saveButton = <Element>document.getElementById('mabakay_Torrenter_saveBtn');
                    saveButton.textContent = this.localization.saveButtonCaption;

                    let closeButton = <Element>document.getElementById('mabakay_Torrenter_closeBtn');
                    closeButton.textContent = this.localization.closeCaptionButton;

                    let restToDefaultsLink = <Element>document.getElementById('mabakay_Torrenter_resetLink');
                    restToDefaultsLink.textContent = this.localization.resetLinkCaption;

                    GM_config.frame.setAttribute('style', 'inset: 166px auto auto 326px;border: 1px solid rgb(0, 0, 0);height: 410px;margin: 0px;opacity: 1;overflow: auto;padding: 0px;position: fixed;width: 650px;z-index: 9999;display: block;');
                },
                'save': () => {
                    GM_config.close();

                    if (changeCallback) {
                        changeCallback();
                    }
                }
            }
        };

        GM_config.init(gmConfiguration);
        GM_registerMenuCommand(this.localization.configureMenuItem, () => { GM_config.open(); });
    };
}

class Torrenter {
    apply(config: Object, siteProcessor: SiteProcessFunction): void {
        let torrenterElements = document.getElementsByClassName('torrenter');
        if (torrenterElements && torrenterElements.length > 0) {
            for (var i = torrenterElements.length - 1; i >= 0; i--) {
                torrenterElements[i].remove();
            }
        }

        setTimeout(() => { siteProcessor((tag: string, title: string, year: string, style: string, itemStyle?: string) => { return this.createLinkSpan(config, tag, title, year, style, itemStyle); }); }, 250);
    }

    static getSiteProcessor(hostName: string): SiteProcessFunction {
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
    }

    createLinkSpan(config: any, tag: string, title: string, year: string, style: string, itemStyle?: string): HTMLElement {
        let span = document.createElement(tag);
        span.setAttribute("style", style);
        span.classList.add("torrenter");

        let engines = [];

        if (config.showEngines && config.showUserEngines) {
            if (config.showUserEnginesFirst) {
                engines = config.userEngines.concat(config.engines);
            } else {
                engines = config.engines.concat(config.userEngines);
            }
        } else if (config.showEngines) {
            engines = config.engines;
        } else if (config.showUserEngines) {
            engines = config.userEngines;
        }

        for (let i = 0; i < engines.length; i++) {
            let link = document.createElement("a");
            link.setAttribute("href", Torrenter.format(engines[i], { title: encodeURIComponent(title), year: year }));

            if (itemStyle) {
                link.setAttribute("style", itemStyle);
            }

            let urlRegex = /(https?:\/\/)(.+?)\//;
            let regexResult = engines[i].match(urlRegex);
            link.innerHTML = Torrenter.getFavIconImg(regexResult[2]);

            link.setAttribute("title", regexResult[2]);

            if (i > 0) {
                let separator = document.createElement("span");
                separator.innerHTML = "&nbsp;|&nbsp;";

                span.appendChild(separator);
            }

            span.appendChild(link);
        }

        return span;
    }

    private static getFavIconImg(url: string): string {
        return '<img src="http://www.google.com/s2/favicons?domain=' + url + '" width="16px" height="16px">';
    }

    private static format(str: string, args: any): string {
        return str.replace(/{(\w+)}/g, (placeholderWithDelimiters, placeholderWithoutDelimiters) => { return args.hasOwnProperty(placeholderWithoutDelimiters) ? args[placeholderWithoutDelimiters] : placeholderWithDelimiters; });
    }

    private static processRelease24(createLinkSpan: CreateLinkSpanFunction): void {
        let titleElement = document.getElementById("mainwindow");
        let loopCount = titleElement.childElementCount > 3 ? titleElement.childElementCount - 3 : 2;

        for (let i = 1; i < loopCount; i++) {
            let elem = titleElement.children[i];

            if (elem.className === "wpis") {
                let title_regex = /\"(.*)\"\s*(\(([0-9]{4})\))?/;
                let match = elem.children[0].children[0].innerHTML.match(title_regex);

                if (match != null) {
                    let title = match[1];
                    let titleYear;

                    if (match.length === 4 && match[3]) {
                        titleYear = match[3];
                    }

                    let span = createLinkSpan("span", title, titleYear, "margin-left: 1em; font-weight: normal;", "position: relative; top: 5px;");

                    elem.children[2].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].appendChild(span);
                }
            }
        }
    }

    private static processFilmweb(createLinkSpan: CreateLinkSpanFunction): void {
        let titleElement = document.querySelector(".filmCoverSection__title span");
        let title;
        let titleYear;

        if (titleElement) {
            let smallTitleElement = document.querySelector(".filmCoverSection__orginalTitle");

            if (smallTitleElement) {
                title = smallTitleElement.textContent;
            } else {
                title = titleElement.textContent;
            }

            let year = document.querySelector(".filmCoverSection__year").textContent;
            let yearRegexp = /([0-9]{4})/;
            let match = year.match(yearRegexp);

            if (match != null) {
                titleYear = match[1];
            }
        }

        let headerElement = document.querySelector('.filmCoverSection__type');
        if (headerElement && title) {
            headerElement.appendChild(createLinkSpan("span", title, titleYear, "margin-left: 1em; display: inline-flex;", "position: relative; top: 2px; z-index: 1;"));
        }
    }

    private static processImdb(createLinkSpan: CreateLinkSpanFunction): void {
        let style = "margin-top: 0.5em;";
        let titleElement = document.querySelector('[class*="TitleHeader__TitleText"]')
        let title;
        let titleYear;
        let hasSmallTitle = false;

        if (titleElement) {
            let smallTitleElement = document.querySelector('[class*="OriginalTitle__OriginalTitle"]')

            if (smallTitleElement) {
                style = "margin-left: 1em; display: inline-block;";
                titleElement = smallTitleElement;
                hasSmallTitle = true;

                title = smallTitleElement.childNodes[0].nodeValue;

                // Remove "Original title" prefix
                let titleRegexp = /Original title: (.*)|.*/;
                let titleMatch = title.match(titleRegexp);

                if (titleMatch != null) {
                    title = titleMatch[1];
                }
            } else {
                title = titleElement.childNodes[0].nodeValue;
            }

            let yearElement = document.querySelector('[class*="TitleBlockMetaData__ListItemText"]')
            if (yearElement) {
                let year = yearElement.textContent;
                let yearRegexp = /([0-9]{4})/;
                let match = year.match(yearRegexp);

                if (match != null) {
                    titleYear = match[1];
                }
            }
        }

        if (titleElement && title) {
            if (hasSmallTitle) {
                titleElement.appendChild(createLinkSpan("span", title, titleYear, style));
            } else {
                titleElement.parentElement.appendChild(createLinkSpan("div", title, titleYear, style));
            }
        }
    }

    private static processRottenTomatoes(createLinkSpan: CreateLinkSpanFunction): void {
        let titleElement = document.querySelector(".scoreboard__title");
        let title;
        let titleYear;

        if (titleElement) {
            title = titleElement.textContent;

            let year = document.querySelector(".scoreboard__info").textContent;
            let yearRegexp = /([0-9]{4})/;
            let match = year.match(yearRegexp);

            if (match != null) {
                titleYear = match[1];
            }
        }

        let headerElement = document.querySelector('.scoreboard__title');
        if (headerElement && title) {
            headerElement.appendChild(createLinkSpan("span", title, titleYear, "margin-left: 1em;font-size: 0.5em;position: relative;top: -7px;", "position: relative; top: 2px;"));
        }
    }
}

let configurator = new TorrenterConfigurator(TorrenterConfigurator.getLanguage(), () => { applyFunction(configurator.getConfiguration()); });
let config = configurator.getConfiguration();

let hostName = window.location.hostname;
let siteProcessor = Torrenter.getSiteProcessor(hostName);

let applyFunction = (config: any) => {
    if (siteProcessor) {
        let torrenter = new Torrenter();
        torrenter.apply(config, siteProcessor);
    }
};

applyFunction(config);
