---
layout: post
title: 'Exploring The QGIS Expression Engine, Part 2: What's Missing From Select By Location'
tags: [QGIS,Expressions,Select Within Distance,aggregate]
thumbnail-img: /assets/img/blog/qgis_expression_2_dwithin_1.png
cover-img: /assets/img/blog/qgis_expression_2_dwithin_1.png
share-title: 'Exploring The QGIS Expression Engine, Part 2: What's Missing From Select By Location'
share-description: How to select within distance with the QGIS expression engine
share-img: /assets/img/blog/qgis_expression_2_dwithin_1.png
comments: true
author: Dror Bogin
---

### How To Select Within Distance

For some reason the QGIS **select by location** tool does not allow selecting within a distance, that's something that bothered me over the last few years I've been using QGIS, but creating a buffer and then intersecting wasn't that bad. I mean, even ArcMap has that feature, but no way was I gonna open that mess again.

![]({{ '/assets/img/blog/qgis_expression_2_dwithin_2.png' | relative_url }})

This is something done in a not very complicated way with the expression engine, with **select by expression**.

### How It's Done

I'm going to use only the Countries 1:50M data from natural earth. What I want to achieve is to select all the countries you can reach (Intersecting) with a 3 degrees buffer from the Netherlands. Why use the Netherlands?  because it's surrounded by both land and sea and will look interesting.

The first part of my expression will be `get_feature` which will get me the feature for the Netherlands. We can use the `NAME` field to get the specific country, if you know the ID of the feature you want to get you can also use `get_feature_by_id`.

```javascript
get_feature('Countries_50m',
            'NAME',
            'Netherlands')
```

Now note that the output of this expression is the feature (or row) itself, and not the geometry.

![]({{ '/assets/img/blog/qgis_expression_2_dwithin_3.png' | relative_url }})

To get the geometry for that feature, which is the first parameter needed for the `buffer` function, we'll have to wrap the first function with the `geometry` function which accepts a feature.

```javascript
geometry(
    get_feature('Countries_50m',
        'NAME',
        'Netherlands')
)
```

Since my layer is in WGS84 any buffer I create is in degrees (~111 Kilometers) which is fine for testing around but calculations tend to be a bit more accurate on the local scale with a local UTM or using Web Mercator which has global coverage and uses meters.

Adding the buffer will be like this:

```javascript
buffer(
    geometry( 
        get_feature('Countries_50m',
            'NAME',
            'Netherlands')
    ),
    3)
```



![Our buffer in purple, visualized with a geometry generator expression]({{ '/assets/img/blog/qgis_expression_2_dwithin_1.png' | relative_url }})

We now have the geometry of the buffer we want to use for comparison all we have to do is use an expression for selecting intersecting geometries from our layer.
Derived attributes of a feature (not a layer) are marked with `$` which we can see in the `$geometry` attribute.
It's important to remember that the expression engine uses row-wise calculations, so the `$geometry` in the expression is the geometry of each feature in our layer.

```javascript
intersects( 
    $geometry, 
    buffer(
        geometry( 
            get_feature('Countries_50m',
                'NAME',
                'Netherlands')
        ),
        3)
)
```

This will select all the countries that intersect with the buffer we created around the Netherlands.

Now, this method is great for comparing to one feature, but what if we want to select by all features in a layer?

### Using Aggregate Functions

I'll use the lakes and airports layer from natural earth for this example.

I want to select all the airports within a 1 degree buffer from any lake that borders on more than one country, Like Lake Superior which borders on both the United Stated and Canada.

![The lakes in red are within one country, the airports in black are further away then our rule]({{ '/assets/img/blog/qgis_expression_2_dwithin_4.png' | relative_url }})


But I don't want just Lake Superior, I want all lakes that have that condition. So I'll use the admin field and check for the admin-0 or admin-0 more values.

Now to get all the features in the lakes layer which correspond to our condition, what we'll use for that is the aggregate function.

A few important points about the aggregate function:

1. Within the **aggregate** function, when you use a layer attribute (like
**$geometry**) you are referring to the attribute of the layer you are aggregating, meaning even if the expression is on the airports layer, but we are aggregating the lakes layer, than **$geometry** will be of the lakes
2. If we wanted to use the airports layer, we'll have to use the functions that extract attributes, functions like **geometry()**,**area()**,**attirbute()** etc... and use the **@parent** variable to refer to our layer. This applies only within the **aggregate** function.
3. It's important to make sure you are using the right *aggregate* parameter inside the **aggregate** function, if you want to count features, use *count*, if you want the sum of an expression, use *sum*, and if you want the actual geometries use *collect*.

Now that we understand that, let's write the aggregate expression to get us the geometry of all lakes with our condition.

The first parameter is the layer, in our case 'lakes' if we had multiple layers with the same name, we would have had to get the layer name from the Map Layers of the expression builder window. 

The second parameter is which aggregate function we'll use, we enter that as a string of the function name, you can use the aggregate function help to check which function names are acceptable.

The third parameter is the expression, meaning over what to apply the
aggregate function, if I wanted to sum, then I would have to use the expression to specify what to sum up for exmaple $area, "population" field or any other numeric output. The collect function expects a geometry input.

The filter parameter is optional, and can filter which part of the input layer we want to use, that's where we insert our condition, the same way we would have used it in a **select by expression** window.

```javascript
aggregate( 
        layer:='lakes',
        aggregate:='collect',
        expression:=$geometry,
        filter:="admin" in ('admin-0', 'admin-0 more')
    )
```

since the collect aggregate both accepts and outputs geometry, we can simply use that in a buffer function and use that to check our airports layer.  
We can also use an expression like:
    
```javascript
    expression:=buffer($geometry,1)
```

to aggregate a multi polygon of the buffers and not get a multi geometry of our layer and then buffer it.

Wrap all of that in a within function and we got our selection. 

```javascript
within(
    $geometry,
    buffer(
         aggregate( 
            layer:='lakes',
            aggregate:='collect',
            expression:=$geometry,
            filter:="admin" in ('admin-0', 'admin-0 more')
            )
    ,1)
)
```

This selection can also be used within a rule based style like in the images so you could both keep the expression handy and not lose your selection over any accidental click on the map.