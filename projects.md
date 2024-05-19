---
layout: page
title: Projects
---

These are things I've worked on over the years, some for clients, and some as personal projects.
A lot of the work I did for clients is not available for public viewing, but every project I've worked on has taught me something new and the experience has been invaluable.

## Web Maps

### qview

My pride and joy.
I started work on this project in 2022 as a solution for a fast and lightweight way to display spatial data online, as opposed to the massive project that is Tel Aviv's IView system which is based on the ArcGIS JavaScript API.
It relies on MapLibre GL JS for the map display, with the main system acting as a platform for sources and layers defined in JSON files which can be selected based on the URL parameters.
I didn't stay on to see the project move to production as I was offered a different job, but I'm still proud of the work I, and later on my coworkers, did on it.

You can see the project [here](https://gis.tel-aviv.gov.il/qview/) and already integrated in several municipality pages.

### GeoSpatial Companies Map

A map I created as personal project based on data originally collected by Christoph Rieke.
It shows the locations of companies that are involved in the geospatial industry, and users can search or filter by category or country.
All the data is stored in a Google Sheet, is updated by the community and managed by me.

You can see the code [here](https://github.com/bogind/Geospatial-Companies)
The data is available [here](https://docs.google.com/spreadsheets/d/1Q2Q6J1Z6J8Q1Z9J9Q1Z9J1Q2Q6J1Z9Q)
And the map is available at [https://bogind.github.io/Geospatial-Companies/](https://bogind.github.io/Geospatial-Companies/)

<a href="https://bogind.github.io/Geospatial-Companies/"><img height="200px" src="https://bogind.github.io/Geospatial-Companies/preview.png"/></a>

### Election Maps

Due to Israel having so many elections in the past few years, I got the chance to create quite a few election maps.
These maps were created using MapLibre GL JS with the basemap created by me using GeoServer.

Here are some examples:

#### 2020 Elections for the 23rd Israeli Knesset (for Kaplan Open Source Inc.)
<a href="https://elections.kaplanopensource.co.il/2020/"><img height="200px" src="https://elections.kaplanopensource.co.il/preview_2020.png"/></a>

#### 3D version of the 2020 Elections for the 23rd Israeli Knesset (for Kaplan Open Source Inc.) - elevation is based on voter turnout
<a href="https://elections.kaplanopensource.co.il/2020/3d/"><img height="200px" src="https://elections.kaplanopensource.co.il/3d/preview_3d.png"/></a>

#### 2021 Elections for the 24th Israeli Knesset (for Kaplan Open Source Inc.)
<a href="https://elections.kaplanopensource.co.il/2021/"><img height="200px" src="https://elections.kaplanopensource.co.il/preview_2021.png"/></a>

#### 2022 Elections for the 25th Israeli Knesset (As a hobby project)
Pretty proud of this one, it was done mostly in the evenings and didn't take a lot of time to create.
It supports 4 languages and doesn't rely on a regular basemap, but uses 2 layers which together weigh about 1MB.
The "backend" here is simply using GitHub Pages to host the site and the actual realtime processing is done using Google Sheets and AppScript.
You can see the code here: [GitHub](https://github.com/bogind/elections)
<a href="https://bogind.github.io/elections/"><img height="200px" src="https://bogind.github.io/elections/preview.png"/></a>


### Purimap

A map/game I created for the Israeli Association For Cartography & Geographical Information Systems for Purim 2022.
The map is a simple game where you have to guess the which city's polygon is displayed on the map.
The polygons are out of place and 5 options are given to the user to choose from.

You can see the code [here](https://github.com/isrcartogis/purimap)

<a href="https://isrcartogis.github.io/purimap/"><img height="200px" src="https://isrcartogis.github.io/purimap/preview_desktop.png"/></a>



## QGIS Plugins

### qlyrx (with Netta Beninson)

[GitHub](https://github.com/arc2qgis/qlyrx)
[QGIS Hub](https://plugins.qgis.org/plugins/qlyrx/)

A simple QGIS plugin which adds two buttons to your plugins toolbar:
* One lets you apply SLD/QML stored symbology to your vector layers.
* The other lets you apply ArcGIS Pro .lyrx Symbology to your vector layers.

The Idea behind this is liberating organizations from having to keep using ESRI products just because it would take too long to transfer years worth of symbology files to QGIS.

This way, if you use a simple python script (which Netta created) you can convert all your old .lyr files to .lyrx and use directly in QGIS, or convert them further to QML.

###  Proxy Handler

[GitHub](https://github.com/bogind/prefix_proxy)
[QGIS Hub](https://plugins.qgis.org/plugins/prefix_proxy/)

A plugin that allows adding prefix proxy addresses to data source connections.


### Israeli Open Data Loader

*Created for Kaplan Open Source Inc.*

[GitHub](https://github.com/KaplanOpenSource/qgis-open-data)
[QGIS Hub](https://plugins.qgis.org/plugins/israeli_opendata_loader/)

A plugin that enables to quickly add Israeli open data resources. Including sources from Government ministries and agencies, Municipalities (paid version only), NGO / non-profits and Open Data websites.


## Other Projects

### MapLibre Symbol Utils

[GitHub](https://github.com/bogind/maplibre_symbol_utils)
[NPM](https://www.npmjs.com/package/maplibre_symbol_utils)


A JavaScript utility functions library for creating advanced symbols in MapLibre GL JS.
Allows users to create line pattern fill or use the MapLibre marker for the entire layer.

![MapLibre Symbol Utils - Line Patterns](https://github.com/bogind/maplibre_symbol_utils/raw/main/img/example_canvasfill.png)

![MapLibre Symbol Utils - Layer Marker](https://github.com/bogind/maplibre_symbol_utils/raw/main/img/example_markers.png)


### Google Podcasts Themes

I loved using the (depending when you are reading this) soon to be/already dead Google Podcasts, but I didn't like how it looked in my browser.
So I created a browser extension for Chrome and Firefox that allows you to change the theme of the Google Podcasts website (it turned out to be a lot less work then you would think).
While Google Podcasts is no longer relevant, the extension is still available for download and was a great first attempt at building an extension and navigating both the Chrome and Firefox web stores publishing process.

[GitHub](https://github.com/bogind/gpodcasts_themes)
[Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/google-podcasts-themes/)
[Chrome Web Store](https://chrome.google.com/webstore/detail/google-podcasts-themes/iiobffejnenlegdcmdkacbhecdgekpcd)