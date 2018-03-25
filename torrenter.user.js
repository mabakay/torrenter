// ==UserScript==
// @name         Torrenter
// @namespace    http://www.google.com/search?q=mabakay
// @version      1.50
// @description  Adds links to torrent sites on popular movie websites.
// @description:pl-PL Dodaje linki do stron z torrentami na popularnych stronach o filmach.
// @author       mabakay
// @copyright    2010 - 2018, mabakay
// @date         25 march 2018
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @run-at       document-end
// @icon64URL    https://raw.githubusercontent.com/mabakay/torrenter/master/torrenter_64.png
// @updateURL    https://raw.githubusercontent.com/mabakay/torrenter/master/torrenter.user.js
// @supportURL   https://github.com/mabakay/torrenter
// @match        http://www.filmweb.pl/*
// @match        https://www.filmweb.pl/*
// @match        http://release24.pl/*
// @match        https://release24.pl/*
// @match        http://www.imdb.com/*
// @match        https://www.imdb.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var engines = [
        "https://thepiratebay.org/search/{0}/0/7/0",
        "https://rarbgmirror.org/torrents.php?search={0}&order=seeders&by=DESC",
        "http://1337x.to/search/{0}/1/",
        "https://torrentz2.eu/search?f={0}",
        "https://yts.am/browse-movies/{0}/all/all/0/seeds",
        "https://eztv.ag/search/{0}",
        "https://www.limetorrents.cc/search/all/{0}/seeds/1/"
    ];

    var hostName = window.location.hostname;

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
    }

    function createLinkSpan(tag, title, style) {
        var span = document.createElement(tag);
        span.setAttribute("id", "Torrenter");
        span.setAttribute("style", style);

        for (var i = 0; i < engines.length; i++) {
            var link = document.createElement("a");
            link.setAttribute("href", format(engines[i], encodeURIComponent(title)));
            link.setAttribute("style", "position: relative; top: 5px;");

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

                    var span = createLinkSpan("span", title, "margin-left: 3em; font-weight: normal;");

                    elem.children[2].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].appendChild(
                        span
                    );
                }
            }
        }
    }

    function processFilmweb() {
        var style = "margin-top: 0.5em; font-size: 0.7em;";
        var titleElement = document.querySelector(".filmMainHeader .hdr");
        var title,
            hasSmallTitle = false;

        if (titleElement) {
            var smallTitleElement = document.querySelector(".filmMainHeader .cap.s-16");

            if (smallTitleElement) {
                style = "margin-left: 1.5em; font-size: 0.7em;";
                titleElement = smallTitleElement;
                hasSmallTitle = true;

                title = smallTitleElement.innerText;
            } else {
                title = document.querySelector(".filmMainHeader .hdr a").innerText;
            }

            var year = document.querySelector(".filmMainHeader .hdr .filmTitle").childNodes[2].innerText;
            var yearRegexp = /\(([0-9]{4})\)/;
            var match = year.match(yearRegexp);

            if (match != null) {
                title += " " + match[1];
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

    function processImdb() {
        var style = "margin-top: 0.5em; font-size: 0.7em;";
        var titleElement = document.querySelector("div.title_block h1[itemprop=name]");
        var title,
            hasSmallTitle = false;

        if (titleElement) {
            var smallTitleElement = document.querySelector("div.title_block div.originalTitle");

            if (smallTitleElement) {
                style = "margin-left: 1.5em; font-size: 0.7em; margin-bottom: 0.5em; display: inline-block;";
                titleElement = smallTitleElement;
                hasSmallTitle = true;

                title = smallTitleElement.childNodes[0].nodeValue;
            } else {
                title = titleElement.childNodes[0].nodeValue;
            }

            var yearElement = document.querySelector("#titleYear");
            if (yearElement) {
                var year = yearElement.textContent;
                var yearRegexp = /\(([0-9]{4})\)/;
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
})();
