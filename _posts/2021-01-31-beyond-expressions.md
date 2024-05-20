---
layout: post
title: "Beyond Expressions: What To Do When QGIS Expressions Go Too Far And Get Too Complex?"
tags: [Views,QGIS,Expressions,SQL]
thumbnail-img: /assets/img/blog/beyond_expressions_1.png
cover-img: /assets/img/blog/beyond_expressions_1.png
share-title: "Exploring The QGIS Expression Engine, Part 3: Writing Custom Expression Functions"
share-description: Write your own functions for the QGIS expression engine
share-img: /assets/img/blog/beyond_expressions_1.png
comments: true
author: Dror Bogin
---

I got to writing this after having tried grouping points in polygons with expressions for too long, even with aggregate.
so what do you do when expressions fail you? 

<center>SQL to the rescue.</center>


<ins>**TL;DR** version</ins>: You can use SQL and Spatial SQL (In this case SQLite and not PostGIS functions, although most are very similar) directly on layers in QGIS.

<ins>**Just long enough** version</ins>: I recently re-discovered this fact (apparently, I already upvoted the [answer that led me here](https://gis.stackexchange.com/questions/70886/how-to-group-and-count-attribute-data)) when trying to group and count point within polygon for an atlas table. 

What you can do for something like that, or any other workflow that feels easier for you to perform in spatial SQL, 
is simply open the DB Manager and scroll down to Virtual layers, what you'll find there is your project layers.

You can then open a new SQL Window where you can just write whatever query you want.

![]({{ '/assets/img/blog/beyond_expressions_1.png' | relative_url }})

A short example using Natural Earth's Countries and Airports layers.  
What it does is count the number of airports in each country.

```sql
SELECT c.NAME ,COUNT(a.name) n_airports
FROM Airports a, Countries_50m c
WHERE ST_Within(a.geometry, c.geometry)
GROUP BY c.name
```

The same way I used **ST_Within**, You could use any other spatial SQL function, like transforming your data, getting its coordinates or checking relationships.  
I would recommend checking the superb [Introduction to PostGIS](https://postgis.net/workshops/postgis-intro/) free workshop which is a terrific introduction to everything SQL and spatial SQL.  

The original query I wrote gives us a table with our grouped values, 
we can load this table as a new virtual layer (without geometry, just as a table).

![]({{ '/assets/img/blog/beyond_expressions_2.png' | relative_url }})

We can also add the geometry for the countries to get this new layer as a new countries layer with a minimal table (only the countries name and how many airports does it have).  
All you have to do to load this layer (or just the table) is check the <ins>*Load as new layer*</ins> checkbox and click on Load.

![]({{ '/assets/img/blog/beyond_expressions_3.png' | relative_url }})


<ins>**Bonus**</ins>: We can later edit our Query Layer's SQL statement by right clicking the layers name in the Layers panel and click on Edit Virtual Layer..., you can then edit the query, for example check only the countries in Africa.

![]({{ '/assets/img/blog/beyond_expressions_4.png' | relative_url }})

![]({{ '/assets/img/blog/beyond_expressions_5.png' | relative_url }})

```sql
SELECT c.NAME ,COUNT(a.name) n_airports
FROM Airports a, Countries_50m c
WHERE continent="Africa" AND ST_Within(a.geometry, c.geometry)
GROUP BY c.name
```

And that's it, you can now use SQL directly on your layers in QGIS.

### Some helpful links


- [SpatiaLite latest SQL functions reference list](http://www.gaia-gis.it/gaia-sins/spatialite-sql-latest.html) - The virtual layers use Spatialite SQL functions
- The [Introduction to PostGIS](https://postgis.net/workshops/postgis-intro/) Workshop.
- Anita Graser's [Answer](https://gis.stackexchange.com/questions/70886/how-to-group-and-count-attribute-data) that led me to explore this option.

