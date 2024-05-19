---
layout: post
title: Using Polygons As Markers
tags: [MapBox GL JS,JavaScript,Turf.js,MapLibre]
thumbnail-img: /assets/img/blog/polygon_markers_0.png
cover-img: /assets/img/blog/polygon_markers_0.png
share-title: Using Polygons As Markers in MapLibre\MapBox GL JS
share-description: How to take a polygon and use it as a marker in MapLibre\MapBox GL JS
share-img: /assets/img/blog/polygon_markers_0.png
gh-repo: bogind/flights
comments: true
author: Dror Bogin
---

![]({{ '/assets/img/blog/polygon_markers_0.png' | relative_url }})

<h3 style="text-align: left;"><u>How I Got Into This</u></h3>
About a year ago my wife's younger brother asked me to help him get started with programming (Thats lasted a week), I suggested he start with JavaScript since you get instant gratification when things work.
<p><span style="font-family: arial;">The kid likes airplanes so I thought a nice project will be making a simple airplanes map, something querying some open API and updating the map at intervals.</span></p>
<p><span style="font-family: arial;">After asking around I got recommended to use <a href="https://opensky-network.org/apidoc/" rel="nofollow" target="_blank">OpenSky-Network's API</a> <br /></span>
</p>
<p><span style="font-family: arial;">Which was a great idea, it's both accessible and gives you the location, barometric altitude, velocity, the bearing (in degrees from north), and whether the plane is on the ground or not.&nbsp;</span></p>
<p><span style="font-family: arial;">So after the kid gave up on actually trying, I wanted to keep making the project and see where it goes. My first idea was using leaflet.js but then I thought, what if the planes were not only in their updated location, but also show them at the correct altitude and facing the right way.</span></p>
<p><span style="font-family: arial;">&nbsp;</span></p>
<h3 style="text-align: left;"><span style="font-family: arial;"><u>The Problems<br /></u></span></h3><p><span style="font-family: arial;">1. Leaflet doesn't do 3D, so I had to switch to MapBox GL JS</span></p>
<p><span style="font-family: arial;">2. MapBox GL JS needs polygons for 3D display, and the API only returns point data.</span></p>
<p><span style="font-family: arial;">3. I also couldn't use an icon of a plane since icons don't have surface when displayed on a map.&nbsp;</span></p>
<p><span style="font-family: arial;">&nbsp;</span></p>
<p><span style="font-family: arial;">MapBox GL JS and Turf.js to the rescue.</span></p>
<p><span style="font-family: arial;">&nbsp;</span><br /></p>
<h3 style="text-align: left;"><span style="font-family: arial;"><u>The Solution</u></span></h3>
<p style="text-align: left;"><span style="font-family: arial;">Since I couldn't use an icon, what I did was open QGIS with the highest resolution aerial photo/satellite imagery I could find of an airport.</span></p>
<p style="text-align: left;"><span style="font-family: arial;">I then digitized an airplane, and rotated the my new polygon layer to face north (more or less) and extracted its coordinates.<br /><br /></span><br /></p>

```javascript
fetch('./plane.geojson')
  .then(response => response.json())
  .then(response => {
    plane = response;
    originalPlane = turf.transformRotate(plane, -31);
    coords = plane.features[0].geometry.coordinates[0]
  })

```

<p style="text-align: left;"><span style="font-family: arial;">To use this polygon with the bearing degrees I get from the API I used Turf.js' <i>transformRotate</i> function to rotate the polygon to the right direction, I also added in <i>transformScale</i> since it's hard to see the actual size of an airplane in a continental web map (150X larger worked)</span></p>
<p style="text-align: left;"><span style="font-family: arial;">To do this, meaning convert the polygon to marker, what i did was create two arrays:</span></p>
<p style="text-align: left;"><span style="font-family: arial;"><br />1. of distances between each coordinate and the centroid of the "template" polygon.</span></p>
<p style="text-align: left;"><span style="font-family: arial;">2. of bearing degrees between the centroid and each of the coordinates.</span></p>
<p style="text-align: left;"><span style="font-family: arial;">What you can do with these two arrays, is determine for each coordinate the direction and distance it should be from the centroid, which is the only coordinate we are getting back from the API.</span></p>
<p style="text-align: left;"><span style="font-family: arial;">&nbsp;</span></p>
<div class="separator" style="clear: both; text-align: center;"><span style="font-family: arial;">

![]({{ '/assets/img/blog/polygon_markers_1.png' | relative_url }})

</span></div><span style="font-family: arial;"><br /><br /></span><p></p>
<p style="text-align: left;"><span style="font-family: arial;">Using turf's <i>destination</i> function we can recreate the coordinates, based on the center of each new polygon, everywhere we want. After we know we can recreate the plane "icon" anywhere we want the thing left is to create a function that does exactly that, I also added the options to rotate and resize the polygon.<br /></span></p>

```javascript
function polygonToMarker(center, coordinates, bearing, scale ){
    let distances = []
    let bearings = []
    let centroid = turf.center(turf.polygon([coordinates]))
    for(i in coordinates){
        to = turf.point(coordinates[i]);
        options = {units: 'kilometers'};
        distanceI = turf.distance(centroid, to, options);
        bearingI = turf.bearing(centroid, to);
        bearings.push(bearingI)
        distances.push(distanceI)
        }
    
    let points = []
    for(j in distances){
        distanceJ = distances[j]
        bearingJ = bearings[j]
        let point = turf.destination(center, distanceJ, bearingJ);
        points.push(point.geometry.coordinates)
    }
    let polygon = turf.polygon([points])
    // Rotate the polygon
    if(bearing){
        polygon = turf.transformRotate(polygon,bearing);
    }
    // Scale the polygon
    if(scale){
        polygon = turf.transformScale(polygon, scale);
    }
    return polygon
}
```


<p style="text-align: left;"><span style="font-family: arial;">Using the base digitized plane polygon and all the point coordinates we get back from the API we can create a GeoJSON of polygon markers on our map anywhere we want, I chose to make them all 20 meters high, just so they'll seem to have some volume.</span></p>
<p style="text-align: left;"><span style="font-family: arial;"><br /></span></p>

```javascript
fetch('https://opensky-network.org/api/states/all')
    .then(response => response.json())
    .then(response => {
        let data = response;
        let geojson = {'type': "FeatureCollection", 'features':[]}
    
        for(p in data.states){
            if(data.states[p][5]){
                var feature  = {
                    type: "Feature",
                    properties:{
                        "icao24" : data.states[p][0],
                        "time_position":formattedTime,
                        "on_ground":data.states[p][8],
                        "velocity":data.states[p][9]*3.6,
                        "center":[data.states[p][5],data.states[p][6]],
                        "bearing":data.states[p][10],
                        "base_height":data.states[p][7],
                        "height":data.states[p][7]+20
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: polygonToMarker([data.states[p][5],data.states[p][6]],coords,data.states[p][10],150)
                    }
                }
                geojson.features.push(feature)
            }
        }
        map.getSource('planes').setData(geojson)
    })

```

The live map is available there as well, if you zoom in on `{lng: 34.8987045, lat: 32.010007}` you can see the original plane I used as a size comparison to all the others :

<p style="text-align: left;"><span style="font-family: arial;"><a href="https://bogind.github.io/flights/">https://bogind.github.io/flights/</a><br /></span></p>
<iframe height="500" src="https://bogind.github.io/flights/" width="500"></iframe>