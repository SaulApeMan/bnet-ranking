# WC3 ladder in numbers

Live site: https://saulapeman.com/bnet-ranking/

A small static website (plain HTML, CSS and JavaScript; no backend, no forms, no external scripts) that shows the
Warcraft III in-game ladder: rankings per mode with filters (race, icon, name) and sorting, records per race
(including perfect records without a loss), and activity between scans.
The site is available in Polish, English, Chinese (Simplified) and German. Open `index.html` or serve the folder
with any static host (GitHub Pages works out of the box).

## Data
Public data read from the in-game Warcraft III ranking: mode, scan date, rank, display name, race, level, MMR,
wins, losses, icon. Provided as is, without warranty of accuracy (values are read from screenshots by OCR, so some
may be wrong). The data are public ranking data from the game.

## Content
- `*.html` - pages (index, ranking, records, icons, w3champions, activity, about)
- `assets/` - style, script and translations (`i18n.js`)
- `data/site-data.js` - the data
- `icons/` - player icons
- `leagues/` - league (division) emblems
- `icons-large/` - big portraits for the icon requirements view
- `names/` - cropped pictures of names that the game shows as images (only when published)

The repository contains nothing else.

Warcraft III is a trademark of Blizzard Entertainment. This site is unofficial.
