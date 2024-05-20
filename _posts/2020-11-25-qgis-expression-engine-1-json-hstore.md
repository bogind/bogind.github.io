---
layout: post
title: 'Exploring The QGIS Expression Engine, Part 1: Getting Values From JSON & HSTORE'
tags: [OpenStreetMap,QGIS,JSON,Expressions,HSTORE]
thumbnail-img: /assets/img/blog/qgis_expression_1_json_1.png
cover-img: /assets/img/blog/qgis_expression_1_json_1.png
share-title: 'Exploring The QGIS Expression Engine, Part 1: Getting Values From JSON & HSTORE'
share-description: How to take work with HSTORE and JSON fields in the QGIS expression engine
share-img: /assets/img/blog/qgis_expression_1_json_1.png
comments: true
author: Dror Bogin
---

This will be the first post of as many as I get around to write about using the QGIS expression engine for selection, geometry generation and calculations to speed up and automate some analysis.


![]({{ '/assets/img/blog/qgis_expression_1_json_1.png' | relative_url }})

If you ever downloaded OpenStreetMap data, you found the `tags` or `other_tags` field which is filled with either an [hstore](https://www.postgresql.org/docs/current/hstore.html) field if you used the data from the [GeoFabrik download site](https://download.geofabrik.de/) they are made up of "key"=>"value" pairs seperated by commas, these are additional attributes contained within one field. It's handy if you want to store different attributes for each row in your data. OpenStreetMap does this because not all features of the same type have all the attributes, for examples not all bars need an attribute of "payment:bitcoin".

![]({{ '/assets/img/blog/qgis_expression_1_json_2.png' | relative_url }})

So how can we get the data out of that field?

In case we just want to use that field in the selection process, we could use this expression to select businesses that accept bitcoin as payment:

```python

map_get( hstore_to_map(  "other_tags" ),'payment:bitcoin') = 'yes'

```

These are the businesses in Tel Aviv that accept bitcoin:

![]({{ '/assets/img/blog/qgis_expression_1_json_3.png' | relative_url }})

Note that there are more points in the image than just points of interest, if you got a national pbf file from GeoFabrik, using hstore_to_map can help you cut it to distinguishable layers.

But what did our expression actualy do?

We used the `other_tags` field and create a `map` object from it, what that is, is a dictionary that QGIS can find value by key in. Very similar to JSON in that regard, except JSON is a string and also needs to be converted to a QGIS map to be used.

our map object will look like this:

![]({{ '/assets/img/blog/qgis_expression_1_json_4.png' | relative_url }})

The idea is, converting the string we get from OSM to an object that QGIS can search in easily instead of using some fancy regex to find the right value we want.

### A JSON example:

![]({{ '/assets/img/blog/qgis_expression_1_json_5.png' | relative_url }})

Using the same method works great on JSON fields as well, in this case I had a layer with a JSON field containing the Israeli Knesset election results, and what I wanted to get was a single party's share of the votes stored in the field.

![]({{ '/assets/img/blog/qgis_expression_1_json_6.png' | relative_url }})

This method is used to either split up a layer by a field that exists in only some of the extra tags or to add new fields based on these json/hstore fields.