// ==UserScript==
// @name         Torrenter
// @namespace    http://www.google.com/search?q=mabakay
// @version      1.70
// @description  Adds links to torrent sites on popular movie websites.
// @description:pl-PL Dodaje linki do stron z torrentami na popularnych stronach o filmach.
// @author       mabakay
// @copyright    2010 - 2021, mabakay
// @date         04 November 2021
// @license      MIT
// @run-at       document-end
// @icon64URL    https://raw.githubusercontent.com/mabakay/torrenter/master/torrenter_64.png
// @supportURL   https://github.com/mabakay/torrenter
// @updateURL    https://github.com/mabakay/torrenter/raw/master/torrenter.user.js
// @downloadURL  https://github.com/mabakay/torrenter/raw/master/torrenter.user.js
// @match        http://www.filmweb.pl/*
// @match        https://www.filmweb.pl/*
// @match        http://release24.pl/*
// @match        https://release24.pl/*
// @match        http://www.imdb.com/*
// @match        https://www.imdb.com/*
// @match        http://www.rottentomatoes.com/*
// @match        https://www.rottentomatoes.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var engines = [
        "https://thepiratebay10.org/search/{0}/0/7/0",
        "https://rarbg.to/torrents.php?search={0}&order=seeders&by=DESC",
        "http://1337x.to/search/{0}/1/",
        "https://torrentz2eu.org/index.html?q={0}",
        "https://yts.mx/browse-movies/{0}/all/all/0/seeds/0/all",
        "https://eztv.re/search/{0}",
        "https://zooqle.com/search?q={0}&s=ns&v=t&sd=d",
        "https://www.torrentdownloads.me/search/?new=1&s_cat=0&search={0}",
        "https://www.limetorrents.pro/search/all/{0}/seeds/1/"
    ];

    var hostName = window.location.hostname;

    setTimeout(function() { processSite(hostName); }, 250);

    function processSite(hostName) {
        switch (hostName) {
            case "release24.pl":
                processRelease24();
                break;

            case "www.filmweb.pl":
                processFilmweb();
                break;

            case "www.imdb.com":
                processImdb();
                break;

            case "www.rottentomatoes.com":
                processRottenTomatoes();
                break;
        }
    }

    function createLinkSpan(tag, title, style, itemStyle) {
        var span = document.createElement(tag);
        span.setAttribute("id", "Torrenter");
        span.setAttribute("style", style);

        for (var i = 0; i < engines.length; i++) {
            var link = document.createElement("a");
            link.setAttribute("href", format(engines[i], encodeURIComponent(title)));

            if (itemStyle) {
                link.setAttribute("style", itemStyle);
            }

            var urlRegex = /(https?:\/\/)(.+?)\//;
            var regexResult = engines[i].match(urlRegex);
            link.innerHTML = getFavIconImg(regexResult[2]);

            link.setAttribute("title", regexResult[2]);

            if (i > 0) {
                var separator = document.createElement("span");
                separator.innerHTML = "&nbsp;|&nbsp;";

                span.appendChild(separator);
            }

            span.appendChild(link);
        }

        return span;
    }

    function getFavIconImg(url) {
        return '<img src="http://www.google.com/s2/favicons?domain=' + url + '" width="16px" height="16px">';
    }

    function format(str) {
        for (var i = 1; i < arguments.length; i++) {
            var argNum = "{" + (i - 1) + "}";

            str = str.replace(argNum, arguments[i]);
        }

        return str;
    }

    function processRelease24() {
        var titleElement = document.getElementById("mainwindow");
        var loopCount = titleElement.childElementCount > 3 ? titleElement.childElementCount - 3 : 2;

        for (var i = 1; i < loopCount; i++) {
            var elem = titleElement.children[i];

            if (elem.className === "wpis") {
                var title_regex = /\"(.*)\"\s*(\(([0-9]{4})\))?/;
                var match = elem.children[0].children[0].innerHTML.match(title_regex);

                if (match != null) {
                    var title = match[1];

                    if (match.length === 4 && match[3]) {
                        title += " " + match[3];
                    }

                    var span = createLinkSpan("span", title, "margin-left: 3em; font-weight: normal;", "position: relative; top: 5px;");

                    elem.children[2].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].appendChild(
                        span
                    );
                }
            }
        }
    }

    function processFilmweb() {
        var titleElement = document.querySelector(".filmCoverSection__title span");
        var title;

        if (titleElement) {
            var smallTitleElement = document.querySelector(".filmCoverSection__orginalTitle");

            if (smallTitleElement) {
                title = smallTitleElement.innerText;
            } else {
                title = titleElement.innerText;
            }

            var year = document.querySelector(".filmCoverSection__year").innerText;
            var yearRegexp = /([0-9]{4})/;
            var match = year.match(yearRegexp);

            if (match != null) {
                title += " " + match[1];
            }
        }

        var headerElement = document.querySelector('.filmCoverSection__type');
        if (headerElement && title) {
            headerElement.appendChild(createLinkSpan("span", title, "margin-left: 1em; font-size: 0.7em; display: inline-flex;", "position: relative; top: 2px;"), titleElement.nextSibling);
        }
    }

    function processImdb() {
        var style = "margin-top: 0.5em; font-size: 0.7em;";
        var titleElement = document.querySelector('[class*="TitleHeader__TitleText"]')
        var title;
        var hasSmallTitle = false;

        if (titleElement) {
            var smallTitleElement = document.querySelector('[class*="OriginalTitle__OriginalTitle"]')

            if (smallTitleElement) {
                style = "margin-left: 1.5em; font-size: 0.7em; margin-bottom: 0.5em; display: inline-block;";
                titleElement = smallTitleElement;
                hasSmallTitle = true;

                title = smallTitleElement.childNodes[0].nodeValue;

                // Remove "Original title" prefix
                var titleRegexp = /Original title: (.*)|.*/;
                var titleMatch = title.match(titleRegexp);

                if (titleMatch != null) {
                    title = titleMatch[1];
                }
            } else {
                title = titleElement.childNodes[0].nodeValue;
            }

            var yearElement = document.querySelector('[class*="TitleBlockMetaData__ListItemText"]')
            if (yearElement) {
                var year = yearElement.textContent;
                var yearRegexp = /([0-9]{4})/;
                var match = year.match(yearRegexp);

                if (match != null) {
                    title += " " + match[1];
                }
            }
        }

        if (titleElement && title) {
            if (hasSmallTitle) {
                titleElement.appendChild(createLinkSpan("span", title, style));
            } else {
                titleElement.parentElement.appendChild(createLinkSpan("div", title, style));
            }
        }
    }

    function processRottenTomatoes() {
        var titleElement = document.querySelector(".scoreboard__title");
        var title;

        if (titleElement) {
            title = titleElement.innerText;

            var year = document.querySelector(".scoreboard__info").innerText;
            var yearRegexp = /([0-9]{4})/;
            var match = year.match(yearRegexp);

            if (match != null) {
                title += " " + match[1];
            }
        }

        var headerElement = document.querySelector('.scoreboard__title');
        if (headerElement && title) {
            headerElement.appendChild(createLinkSpan("span", title, "margin-left: 1em;font-size: 0.5em;position: relative;top: -7px;", "position: relative; top: 2px;"));
        }
    }
})();
