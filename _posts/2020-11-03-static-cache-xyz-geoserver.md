---
layout: post
title: Creating A Static Cache of XYZ tiles with GeoServer
tags: [XYZ tiles,GeoServer,tiling,cache,caching]
thumbnail-img: /assets/img/blog/xyz_cache_6.png
share-title: Creating A Static Cache of XYZ tiles with GeoServer
share-description: Create a static cache of XYZ (slippy) tiles from GeoServer
share-img: /assets/img/blog/xyz_cache_6.png
comments: true
author: Dror Bogin
---

<p><span style="font-family: arial;">TL;DR : skip to the guide, follow the pretty pictures, create static cache for image or vector tiles in any format. <br /></span></p><p><span style="font-family: arial;">&nbsp;This one is more of a virtual post-it note than anything else.<br />The first time I had to create a static cache of tiles (vector or image) from GeoServer I had to scrape each tile with a python script, that both took a long time, and made me work way too hard. That was because before <a href="http://blog.geoserver.org/2020/04/21/geoserver-2-17-0-released/" rel="nofollow" target="_blank">GeoServer 2.17.0</a> it wasn't possible to create a cache like that directly from GeoServer.</span></p><p><span style="font-family: arial;">That does not mean you couldn't serve tiles in XYZ formatting <code>({zoom}/{x}/{y}.{extension})</code>, <a href="https://gis.stackexchange.com/questions/242389/serve-geoserver-tiles-in-xyz-format" rel="nofollow" target="_blank">you could</a>, but not generate a static cache you could just throw up on S3 and make available everywhere without needing to startup the actual server.</span></p><h4 style="text-align: left;"><span style="font-family: arial;">What Changed in GeoServer 2.17?</span></h4><p><span style="font-family: arial;">&nbsp;The developers added some GeoWebCache love as they called it.</span></p><p><span style="font-family: arial;">meaning four things:<br /></span></p>
<ul>
<li><span style="font-family: arial;">Much better startup performance when integrated in GeoServer, 
the time to load the tiled layers configuration is a fraction of what it
 used to be.</span></li>
 <li><span style="font-family: arial;">Much faster tile layer listing in the GeoServer “tile layers” page</span></li>
 <li><span style="font-family: arial;"><u>File system tile layout can be configured between classic (small folders), XYZ and TMS (for static cache generation)</u></span></li>
 <li><span style="font-family: arial;">Better
 control over failed tile seed operations. Seeding threads used to stop 
at the first failure, now error tolerance can be configured on the 
single thread and across the seed job</span></li></ul><p><span style="font-family: arial;">&nbsp;Unfortunately there wasn't a guide that could explain how...<br />So I had to learn it, and the first time it took me about a day until i figured out how and got my cache set up.&nbsp;</span></p><p><span style="font-family: arial;">Then I forgot how to do it.</span></p><p><span style="font-family: arial;">Last week I came across this question : <a href="https://gis.stackexchange.com/questions/377256/generate-geojson-tile-layers-from-shapefile" rel="nofollow" target="_blank">Generate GeoJSON tile layers from Shapefile.</a></span></p><p><span style="font-family: arial;">And then I noticed that even though I knew it was possible, and even though the question had a bounty, nobody answered it.</span></p><p><span style="font-family: arial;">So after relearning how to create a XYZ tile cache (which s also called SLIPPY, something I should remember next time) I answered the question and got my bounty.</span></p>
<p><span style="font-family: arial;">&nbsp;<span></span></span></p><!--more--><p></p><h3 style="text-align: left;"><span style="font-family: arial;">How It's Done?</span></h3><p><span style="font-family: arial;">&nbsp;<br /></span></p><p><span style="font-family: arial;">After publishing a layer in Geoserver, meaning:</span></p>
<p><span style="font-family: arial;"><br />1. Created or used an existing workspace.</span></p>
<p><span style="font-family: arial;">2. Created a data store (can be file or DB based)</span></p>
<p><span style="font-family: arial;">3. Published a Layer from the data store.</span></p>
<p><span style="font-family: arial;">(Guides for all this can be found here: <a href="https://docs.geoserver.org/stable/en/user/gettingstarted/shapefile-quickstart/index.html" rel="nofollow" target="_blank">Publishing A Shapefile</a>, <a href="https://docs.geoserver.org/stable/en/user/gettingstarted/postgis-quickstart/index.html" rel="nofollow" target="_blank">Publishing a PostGIS table</a>)</span></p>
<p><span style="font-family: arial;">What you need to do is go to <b>Tile Caching</b> &rarr; <b>BlobStores<br /></b></span></p>
<div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/xyz_cache_0.png' | relative_url }})

</div>
<p><span style="font-family: arial;">And create a new File Blobstore with the following settings:<br /></span></p><ul style="text-align: left;"><li><span style="font-family: arial;">A Base directory where all the new layer/layer groups folder will be created.</span></li><li><span style="font-family: arial;">Tiles directory layout should be <b><u>SLIPPY</u></b>, not GeoWebCache Default which can't be translated directly without GeoWebCache and not TMS Which uses a reverse Y coordinate.<br /></span></li></ul><p></p><div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/xyz_cache_1.png' | relative_url }})

</div>
<p><span style="font-family: arial;"></span></p><p><span style="font-family: arial;"></span></p><p><span style="font-family: arial;"></span></p><p><span style="font-family: arial;"></span></p><p><span style="font-family: arial;"><br /></span></p><p><span style="font-family: arial;">What you need to do is go to the layer (or layer group) you want to create tiles from.<br />And set that layer to use the blobstore you created.<br />While You are there, make sure that the format you want to consume the tiles in is switched on.<br /></span></p><p></p><div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/xyz_cache_2.png' | relative_url }})

</div>
<p><span style="font-family: arial;">You can now seed your static cache and find your files inside the folder of the blob store.</span></p><p><span style="font-family: arial;">In this example the guy asked about creating a geojson tile cache, but you can just change the format. <br /></span></p><div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/xyz_cache_3.png' | relative_url }})

![]({{ '/assets/img/blog/xyz_cache_4.png' | relative_url }})

![]({{ '/assets/img/blog/xyz_cache_5.png' | relative_url }})


<p><span style="font-family: arial;">The&nbsp; end result can be uploaded as is anywhere to be used as a static cache.</span></p><div class="separator" style="clear: both; text-align: center;">

![]({{ '/assets/img/blog/xyz_cache_6.png' | relative_url }})

<p><span style="font-family: arial;">And that's it, a bit roundabout but gets the job done.<br /></span></p><div><p><span style="font-family: arial;"> </span></p></div>