---
layout: post
title: "Exploring The QGIS Expression Engine, Part 4: Selecting By Attributes And Location With One Expression"
tags: [Select By Location,QGIS,Expressions,Select By Attribute]
thumbnail-img: /assets/img/blog/qgis_expression_4_combined_1.png
cover-img: /assets/img/blog/qgis_expression_4_combined_1.png
share-title: "Exploring The QGIS Expression Engine, Part 4: Selecting By Attributes And Location With One Expression"
share-description: Use expressions to select features based on both their attributes and their location in QGIS.
share-img: /assets/img/blog/qgis_expression_4_combined_1.png
comments: true
author: Dror Bogin
---

I recently encountered a Facebook post asking whether any GIS software can select by both attributes and location with one tool. My answer:

> Yeah, wanna guess which software?

To which the person answered, knowing me, `"QGIS with python🐍?"`.  
This is where I could clarify, you don't need python for that.  
I then referred them to my second post about the expression engine: [Exploring The QGIS Expression Engine, Part 2: What's Missing From Select By Location](https://bogind.com/2020-12-03-qgis-expression-engine-2-dwithin/),
in it I perform both a spatial selection which is based on an attribute selection inside one expression (I select all the countries intersecting a 3 degree buffer from the Netherlands). 
Now that was a relatively complex expression since it used a reference geometry from within the same layer.  

An expression using a features geometry can be used just as easily as using the attributes from its table. 
For example, using the Natural Earth [Admin-0 Countries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/)  layer, 
if you would want to select a country by name or continent your expression would look like this:

```sql
  "NAME" =  'Angola' OR "CONTINENT" = 'Europe'
```

![Yeah, it's not the same image as the original post because no one (me included) noticed that it didn't show the same selection (Angola was missing)]({{ '/assets/img/blog/qgis_expression_4_combined_1.png' | relative_url }})

But what if you want to select using the geometry of a country?  

We can use either the geometry itself, and interpolate it to get a specific node, the centroid, the X/Y coordinate or a derived attribute like length for lines or area for polygons. Lets use a derived attribute and select all countries larger than 1,000,000 square kilometers. 

```sql
   ($area/1000000) > 1000000
```

Looks pretty simple, diving by 1,000,000 to get square kilometers and selecting using that number.

![Selecting countries larger than 1,000,000 square kilometers]({{ '/assets/img/blog/qgis_expression_4_combined_2.png' | relative_url }})

Now lets try something a bit more complex. 
lets interpolate geometry, and check which countries have a centroid which is west of the prime meridian. 
We are going to slow down and break this process down to how we do that.

1. Get the geometry of each feature:  `$geometry`` -> *returns geometry*
2. Get the centroid of the geometry: `centroid($geometry)` -> *returns a __point__ geometry*
3. Get the X coordinate of the centroid: `x(centroid($geometry))` -> *returns a __number__*
4. Check if the X coordinate is less than 0: `x(centroid($geometry)) < 0` -> *returns a __boolean__* <- This is what we need for a selection expression.

So any x coordinate west of the prime meridian would be smaller than 0 since x coordinates increase going east and decrease going west of the prime meridian. our final expression looks like this:
  
  ```sql
    x(centroid($geometry)) < 0
  ```

![Selecting countries with a centroid west of the prime meridian]({{ '/assets/img/blog/qgis_expression_4_combined_3.png' | relative_url }})

See how simple that was? 
If we wanted to use the geometry of a specific feature from another layer we could use a function like `get_feature` which (in it's simplest, most easy-to-use form) takes three parameters, *layer*, *attribute* and *value* which allow you to select a feature by the value of one of its attributes.

When we have a feature from another layer instead of the geometry of our layer we can use the `geometry(feature)` function instead of the `$geometry` property.
You can also use that on the same layer to use a specific feature.

Let's use all of this to get all the **European** countries that *touch* (share a border) with Russia and have a population (estimate) larger than 10,000,000.

1. First we get the feature for Russia: `get_feature('Countries_50m','NAME','Russia')` -> *returns a __feature__*
2. Now extract the geometry of that feature: `geometry(get_feature('Countries_50m','NAME','Russia'))` -> *returns a __geometry__*
3. Now we can check which countries **touch** that geometry(Remember, the expression is checked for each feature in the layer): `touches(geometry(get_feature('Countries_50m','NAME','Russia')),$geometry)` -> *returns a __boolean__*

We should now have a selection of all the countries that touch Russia.

![Selecting countries that touch Russia]({{ '/assets/img/blog/qgis_expression_4_combined_4.png' | relative_url }})

4. Now we can add the selection based on the Continent:
`touches(geometry(get_feature('Countries_50m','NAME','Russia')),$geometry) and "CONTINENT" = 'Europe'` -> *returns a __boolean__*

This return a true or false value for each country, when true that country would be added to the selection so out of the 14 countries that touch Russia, only 8 are counted as European. 

![Selecting European countries that touch Russia]({{ '/assets/img/blog/qgis_expression_4_combined_5.png' | relative_url }})

5. Finally we select from these countries only those with a population larger than 10,000,000: 

```sql
  touches(geometry(get_feature('Countries_50m','NAME','Russia')),$geometry) and "CONTINENT" = 'Europe' and  "POP_EST" > 10000000
```

This again returns a boolean true or false for each country, and should leave us only Ukraine and Poland (The layers I used for this post was probably old).

![Selecting European countries that touch Russia with a population larger than 10,000,000]({{ '/assets/img/blog/qgis_expression_4_combined_6.png' | relative_url }})

And that's it, we have selected features based on both their attributes and their location using only one expression.  
All we had to do to create a (relatively) complex selection was to break down your expression so using multiple functions in a row won't look as intimidating and you can get results very quickly selecting by both attribute and location.

I hope this post was helpful and that you can use this to make your work easier and more efficient.

Other posts in this series:

- [Exploring The QGIS Expression Engine, Part 1: Getting Values From JSON & HSTORE](https://bogind.com/2020-11-25-qgis-expression-engine-1-json-hstore/)
- [Exploring The QGIS Expression Engine, Part 2: What's Missing From Select By Location](https://bogind.com/2020-12-03-qgis-expression-engine-2-dwithin/)
- [Exploring The QGIS Expression Engine, Part 3: Writing Custom Expression Functions](https://bogind.com/2021-01-19-qgis-expression-engine-3-custom-functions/)

- [All of the posts tagged with #expressions](https://bogind.com/tags/#Expressions)