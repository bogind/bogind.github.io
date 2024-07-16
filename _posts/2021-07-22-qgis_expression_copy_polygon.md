---
layout: post
title: "Invasion! or How To Copy Polygons With Expressions in QGIS"
tags: [Geometry Generator,QGIS,Expressions]
thumbnail-img: /assets/img/blog/invasion_copy_polygon_1.png
cover-img: /assets/img/blog/invasion_copy_polygon_1.png
share-title: "Invasion! or How To Copy Polygons With Expressions in QGIS "
share-description: Use expressions to copy geometries in QGIS.
share-img: /assets/img/blog/invasion_copy_polygon_1.png
comments: true
author: Dror Bogin
---

> [!NOTE]
> This is an old post, I have since learned a lot about the QGIS expression engine and how to use it to its full potential.
> I'll leave this post here for posterity, but I would recommend jumping to the [end](#end) of the post to see what I've learned since then about doing this right.  





How do you invade using your country's polygon?

I got to this thinking that if it might be [possible in JavaScript](https://bogind.com/2020-11-17-polygon-markers/) than the QGIS expression engine should be able to do it too.

And it is totally possible.

![]({{ '/assets/img/blog/invasion_copy_polygon_1.png' | relative_url }})


The basis for this is pretty similar to what I did for the flights dataset in the post about "[Using Polygons As Markers](https://bogind.com/2020-11-17-polygon-markers/)" with the polygon of the plane. 
Except here I use one polygon from the layer and the geometry generator.

In the JavaScript post I took the centroid of geometry I wanted to use and calculated pairs of bearing and distance for each point (node) in the polygon, 
using these pairs I could recreate the polygon around any point I wanted with [Turf.js' destination](https://turfjs.org/docs/#destination) function that takes and original point (our centroid), a bearing (for direction), and a distance, and uses those to create a new point.  
Now the main problem here, is QGIS doesn't have a function like that*.

<div class="note" style='background-color:#d1ecf1; color: rgb(12, 84, 96); border-left: solid #bee5eb 4px; border-radius: 4px; padding:0.7em; padding-bottom:0.1em; margin-bottom: 1rem;'>
<span>
<p style='margin-left:1em;'>
<b>This is not true:</b> the QGIS expression engine has a function called <b><u>project</u></b> which takes a geometry, a distance and an azimuth ( in radians clockwise, where 0 corresponds to north) and returns a new geometry.</p>
</div>


![]({{ '/assets/img/blog/polygon_markers_1.png' | relative_url }})

However, you can also express the distance between points (on a 2D plane(no pun intended)) by the pythagorean theorem, or if you don't want the distance but the actual point you can find it using a formula like:

```sql
 Point( X(Centroid) - X(pointN), Y(Centroid) - Y(pointN))
```

And if we can recreate all points this way, we can copy our geometry.  

Since we need to do this for all the points, we'll use an array. 
We can use the `generate_series`` function to make an array of numbers the same length as the number of points in our geometry:

```sql
generate_series( 1,
num_points(
     geometry(get_feature( 'countries','name','Israel'))
))
```

Here I used Israel from the  Natural Earth [Admin-0 Countries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/) layer. 
What I do is get the specific feature, extract its geometry, count the points and use generate_series to create and array that looks like this:

![]({{ '/assets/img/blog/invasion_copy_polygon_2.png' | relative_url }})

Now what we do, is use the `array_foreach` function to do something for each number (yes, these are still numbers, not points) in the array.  
What I do is use `make_point` which takes only an X and Y coordinates, and into that function we add two expressions.  
We take the centroid of the geometry we want to replace (or if it's a point we can just take the geometry) and we take the distance between the centroid of our copied geometry and pointN (pointN being the first node for the first number in the array, the second for the second and so on).  
Now the distance here between the X (or Y) coordinate of the centroid and the X coordinate of pointN.  
So the calculation of for the X coordinate of each element will look like this:

```sql
 x(centroid($geometry))-
               (
                x(centroid(geometry(get_feature( 'countries','name','Israel')))) -
                x(point_n(geometry(get_feature( 'countries','name','Israel')),@element))
                )
```

Now we should a have a new array, having all the points we need to recreate our original polygon and our (somewhat cumbersome) expression will look like this:

```sql
  array_foreach(
          generate_series( 1, num_points(
         geometry(get_feature( 'countries','name','Israel'))
          )),
          make_point(
          x(centroid($geometry))-
               (
                x(centroid(geometry(get_feature( 'countries','name','Israel'))))-
               x(point_n(geometry(get_feature( 'countries','name','Israel')),@element))
            ),
           y(centroid($geometry))-
               (
                y(centroid(geometry(get_feature( 'countries','name','Israel'))))-
               y(point_n(geometry(get_feature( 'countries','name','Israel')),@element))
               )
           )
       )
```

Now this is a bit annoying but you can't create a polygon straight from an array of points in the QGIS expression engine,
but you **can** create a line and you **can** create a polygon from a closed line (which our line will be since it's a recreated polygon), so we only have to wrap our expression in `make_line`` and wrap that in `make_polygon``.  
So our final expression would look like this: 

```sql
make_polygon(
       make_line(
         array_foreach(
              generate_series( 1, num_points(
             geometry(get_feature( 'countries','name','Israel'))
              )),
          make_point(
              x(centroid($geometry))-
                   (
                    x(centroid(geometry(get_feature( 'countries','name','Israel'))))-
                   x(point_n(geometry(get_feature( 'countries','name','Israel')),@element))
                ),
               y(centroid($geometry))-
                   (
                        y(centroid(geometry(get_feature( 'countries','name','Israel'))))-
                       y(point_n(geometry(get_feature( 'countries','name','Israel')),@element))
                   )
                  )
               )
           )
       )
```

Now I don't recommend replacing all the geometries with this expression, unless you:

a. don't have a lot of geometries and 
b. the geometry you are recreating is not very complex.

What I did (and that's why the colors are different) was use a rule based symbology for each geometry I want to replace and used a simple selection for the rule.

![]({{ '/assets/img/blog/invasion_copy_polygon_3.png' | relative_url }})

Enjoy using this neat party trick, obviously this would also work if you want to copy a specific polygon to a specific point, but remember that it can crash your QGIS instance, so use it wisely.

<a name="end"></a>
### New Knowledge

Using the chance of moving this post to the new blog, I saw that no only could this be done in a much simpler way, but I also talked about it in a QGIS Open Day on January 2023.

You can see the [whole video](https://www.youtube.com/live/ybx_OKnD_pM?si=I_hAUK_BLkj0RzGu) or jump to where I talk about [copying geometries](https://www.youtube.com/live/ybx_OKnD_pM?t=750s), I recommend seeing the whole thing, or at least skipping to where I show the actual expressions.  

Short version, what I described in this post is a way to **recreate** geometries, this is not as efficient as simply **copying** them.  
Recreation doesn't work well with multi-part geometries, and doesn't handle polygons with holes well.  
What we can do, is use the `translate` function with the distances between the geometry you want to copy and the geometry you want to "replace".  

The expression in the video is a bit more advanced, and I will not go into explaining it here, but it's much simpler than the one I described here, but we can have it here with the same feature geometry.

```sql
with_variable(
    'original', -- this is the geometry we are copying
    geometry(get_feature( 'countries','name','Israel')),
    with_variable(
      'distances', -- this is the distances between the two geometries' centroids
      map(
        'dx', x(centroid($geometry))-x(centroid(@original)),
        'dy', y(centroid($geometry))-y(centroid(@original))
      ),
      translate($geometry,@distances['dx'],@distances['dy'])
    )
)
```

A lot shorter, more elegant and more efficient.  
I hope you enjoyed this post, and I hope you can use this new knowledge to make your work easier and more efficient.
  

- [All of the posts tagged with #expressions](https://bogind.com/tags/#Expressions)