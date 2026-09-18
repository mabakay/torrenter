# Torrenter

Torrenter is a userscript that adds quick links to torrent search engines on popular movie websites. It reads the movie title, release year, and IMDb identifier where available, then builds search links for the configured engines.

## Supported websites

- [Filmweb](https://www.filmweb.pl/)
- [Release24](https://release24.pl/)
- [IMDb](https://www.imdb.com/)
- [Rotten Tomatoes](https://www.rottentomatoes.com/)

## Installation

Install a userscript manager such as Tampermonkey, Violentmonkey, or Greasemonkey, then install the latest script from:

<https://github.com/mabakay/torrenter/raw/master/torrenter.user.js>

The script can also be installed directly from the repository's `torrenter.user.js` file.

## Configuration

Open the userscript manager menu on a supported website and select **Configure**. The settings allow you to:

- Enable or disable built-in search engines.
- Enable user-defined search engines.
- Choose whether user-defined engines appear first.
- Add custom search URLs.

Custom URLs can use these variables:

- `{title}` - movie title
- `{year}` - release year
- `{imdb}` - IMDb identifier

Wrap an optional part of a URL in square brackets. For example, `[ {year}]` is removed when no release year is available.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
