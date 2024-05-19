---
layout: post
title: Using URL Parameters in GeoServer Views
tags: [Views,PostGIS,GeoServer,SQL]
thumbnail-img: /assets/img/blog/geoserver_view_param_0.png
share-title: Using URL Parameters in GeoServer Views
share-description: How to create views in GeoServer that can pass URL parameters to the SQL query
share-img: /assets/img/blog/geoserver_view_param_0.png
comments: true
author: Dror Bogin
---

<p>&nbsp;This method is great when trying to serve a layer with a lot of detailed features that covers a large area, like land parcels.</p>
<p>Instead of getting the full layer for your web map, you can just limit visibility of the layer for specific zoom levels and query the view as GeoJSON whenever the user finishes moving within those zoom levels.<br />I added some sample leaflet code for updating your layer every move or zoom end at the bottom, but that's not the main part of this piece.</p>
<h3 style="text-align: left;">How It's Done?</h3>
<h4 style="text-align: left;">Creating A View Layer In GeoServer</h4><p style="text-align: left;">When creating a new layer from a PostGIS datastore&nbsp; you have the option to<b>Configure a new SQL view</b>.
<br />
This will let you define a SQL query from PostGIS that will generate your new layer.<br /><b></b></p>
<div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/geoserver_view_param_0.png' | relative_url }})

</div>

<p>This can be used for a simple query in you want to just show a part of your layer, whether showing some of the columns or using the where clause to show just part of the rows. This view can be something permanent that updates itself whenever the database gets updates <b>OR</b> you can use parameters to query which allow you to use thing like:</p>
<p>1. Using a bound box to query the layer</p>
<p>2. Using geometry from another layer to query your layer</p>
<p>3. Using text to select specific attributes.<br /><br /></p>
<div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/geoserver_view_param_1.png' | relative_url }})

</div>
<p>You can limit the parameters with regex (which can be both very specific and a bit uncomfortable), in this example I'll use the regex validation to get only floats in all my parameters.</p>
<p>You can practice using <u>regex</u> on sites like <a href="https://regexr.com/">https://regexr.com/</a> which also explains what you are doing, and what you are doing wrong.</p>


<h4 style="text-align: left;">Adding Parameters To The Query</h4>

<p style="text-align: left;">To add a parameter within your query you can simply add the parameter name between precent signs (%) like so:<br /></p><p style="text-align: left;"></p><p style="text-align: left;"></p><div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/geoserver_view_param_2.png' | relative_url }})

</div>
<h4 style="text-align: left;">Validating The Parameters<br /></h4><p>If I wanted to limit my <b>ID</b> parameter just to positive or negative numbers, than the regex validtion expression will be something like this:

`^-?[\d.]+$`


<h4 style="text-align: left;">Getting The Features within Bounding Box<br /></h4>
<p style="text-align: left;">&nbsp;To limit the features from my layer to operate within the bounding box, we need 8 parameters, which are actually 4 sets of coordinates, the last set we'll need to repeat since polygons need the first and last coordinate to be the same.</p>
<p style="text-align: left;">Our query will look something like this:
</p>

```sql
SELECT id,
       geom
FROM buildings
WHERE ST_Within(geom, ST_GeomFromText('POLYGON((%X1% %Y1%,
                                                %X2% %Y2%,
                                                %X3% %Y3%,
                                                %X4% %Y4%,
                                                %X1% %Y1%))', 4326))
```

<p style="text-align: left;">With this query I can query which features in my layer are within (not intersecting) my web map's bounding box.</p><p style="text-align: left;"><br /></p><div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/geoserver_view_param_3.png' | relative_url }})

</div><br /><p style="text-align: left;"><br /></p><h3 style="text-align: left;">&nbsp;</h3><p style="text-align: left;">To use multiple parameters in the query url we'll use the <b>viewparams</b> key and seperate the parameters with '<b>;</b>'. for more info on querying A GeoServer layer as WFS GeoJSON look at the leaflet example.</p>
<p style="text-align: left;">GeoServer Views can be powerfull tools, combining GeoServer's ease of access and verstility for publishing spatial data and PostGIS' powerfull processing into one easy to use tool with GeoServer acting as another gateway to your PostGIS data.<br /></p><span><!--more--></span><h3 style="text-align: left;"><br /></h3><h3 style="text-align: left;">Leaflet Example<br /></h3>

```javascript
const gsip = 'localhost'
const gsport = '8080'
const workspace = 'workspace'
const layer = 'layer'
let parcels = L.geoJson()

function updateLayer(){
    let zoom = map.getZoom()
    
    let bounds = map.getBounds()
    let rectangle = L.rectangle(bounds)
    let coords = rectangle.toGeoJSON().geometry.coordinates[0]

    if(zoom >= 14){

        let queryUrl = `http://${gsip}:${gsport}/geoserver/${workspace}/\
        ows?service=WFS&version=1.0.0&request=GetFeature&typeName=\
        ${workspace}:${layer}&outputFormat=application%2Fjson&\
        viewparams=X1:${coords[0][0]};\
                    Y1:${coords[0][1]};\
                    X2:${coords[1][0]};\
                    Y2:${coords[1][1]};\
                    X3:${coords[2][0]};\
                    Y3:${coords[2][1]};\
                    X4:${coords[3][0]};\
                    Y4:${coords[3][1]}`

        fetch(queryUrl)
        .then(response => response.json())
        .then(data => {
            if(map.hasLayer(parcels)){map.removeLayer(parcels)}
            parcels = L.geoJson(data).addTo(map)
        })

     }
} 
map.on('zoomend',updateLayer)
map.on('moveend',updateLayer)

```

