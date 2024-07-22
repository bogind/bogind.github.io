---
layout: post
title: QGIS Sound Effects Plugin - Behind the Scenes
tags: [QGIS,PyQGIS,PyQt,Plugins,Python]
thumbnail-img: /assets/img/blog/qgis_sound_effects_1.png
share-img: /assets/img/blog/qgis_sound_effects_1.png
share-title: QGIS Sound Effects Plugin - Behind the Scenes
share-description: How a joke became a plugin, and then an actually useful plugin.
comments: true
author: Dror Bogin
---

About 2 weeks ago I saw a tweet by Kate Berg, AKA [Pokato]() about how cool would it be if we could make mods for GIS software, like ones for games.  

<blockquote class="twitter-tweet" data-dnt="true">
<p lang="en" dir="ltr">You know how you can mod video games (like replace all dragons in Skyrim with the shape of Ohio)? 
<br><br>
If you could, how would you mod your desktop GIS software to make it more fun and silly?
<br><br>
I think I&#39;d replace the word &quot;Raster&quot; everywhere to be &quot;Tater&quot; <a href="https://twitter.com/hashtag/gischat?src=hash&amp;ref_src=twsrc%5Etfw">#gischat</a> <a href="https://t.co/FJcsQNi3QG">pic.twitter.com/FJcsQNi3QG</a></p>&mdash; 🥔🗺️ ᴘᴏᴋᴀᴛᴇᴏ ᴍᴀᴘs (@pokateo_maps) <a href="https://twitter.com/pokateo_maps/status/1808576830959440027?ref_src=twsrc%5Etfw">July 3, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>  <br>


My initial response was

> If?  
> Have you never heard of the classic plugin "[QGIS Hats](https://plugins.qgis.org/plugins/qgis_hats/)"? 

Quickly followed by:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Ok, the other comments just gave me a great idea for a plugin.<br>Whenever a processing algorithm fails, play (a free licensed) *womp womp*</p>&mdash; Dror Bogin (@bogind2) <a href="https://twitter.com/bogind2/status/1808713635000156197?ref_src=twsrc%5Etfw">July 4, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

Then I got thinking, how hard would it be to add sound effects to QGIS?  
My initial intuition was that it shouldn't be that much of an issue.

I thought that there had to be a GUI event available to the python API to which i could attach a sound effect, and that should be it. Why not? we have messages triggered by the processing algorithms, so why not a signal I could use for the plugin.    
I checked and found that PyQT had a [`QSound`](https://doc.qt.io/qtforpython-5/PySide2/QtMultimedia/QSound.html) class, which should be able to play sound files.  
I figured that it should a quick 1-2 hours of work to combine the two into a plugin when I get my hands on a computer.

{: .box-error}
My initial intuition was wrong.


As i was away from my computer for the weekend, most of my thinking was done in my head, whatever research i could do in , and through various groups or via a [GIS stackexchange question](https://gis.stackexchange.com/q/483452/108903).  

Once I got to my computer, I started working on the plugin.  

It took some time, but I found the [`QgsHistoryProviderRegistry`](https://qgis.org/pyqgis/master/gui/QgsHistoryProviderRegistry.html), which is a class that provides access to the history of other providers from the GUI.  
While this should have been the end of the "hard" part, I soon found that no matter what i did, when any of the `entryAdded` or `entryUpdated` signals triggered a function, QGIS would crash.  

{: .box-note}
Signals are the way that PyQt communicates between objects, they are the equivalent to events in JavaScript.

This is a good place to note, the history registry only has 3 signals, and I didn't really have anything to do with the `historyCleared` signal.

Ok, so first of all, this is a good place to admit that the plugin was already taking **a lot** more time than I initially thought it would.  
Second, I had to find a different way to trigger the sound effects. Mostly because there was no way I was quitting now.

Checking, I found that the `QgsHistoryProviderRegistry` **can** have multiple providers, but only really gets updates from the 
`QgsProcessingHistoryProvider`, which means it basically only gets updates from the processing algorithms.  

I also found that I could use the `QgsHistoryProviderRegistry.queryEntries` method to grab all the entries in the history, and even better, all of the entries between two date-time stamps.  
That's great, it means i can check the history and I know that the history is updated every time a processing algorithm is run.  
So, if I can't get the signals to work (without crashing QGIS, that is), I can just check the history every second or so and see if there are any new entries.  

Seems silly, but it worked.  

So, trying to keep everything "in the family", I used another of the QT classes, `QTimer`, to run a function that check the history every second.  
If the function found a new entry (by ID), it would use the `QSound` class to play a sound effect.  
A simple check to see if the entry had results (meaning the algorithm finished) to play a "Success" sound with an 8-Bit game vibe, and if the entry had an error, it would play a "womp womp womp" sound.  

Wrap all of that up in a plugin and v0.1 was ready.  

It was a nice, silly, little plugin, which worked, but wasn't much use aside from a joke.  
I shared it with the community and got a lot of (love, as well as) suggestions, which I couldn't wait to implement.  

This is what v0.1 looked like (sounded like, there wasn't really anything to see):

[![Version 0.1](https://img.youtube.com/vi/0B2TTya6DOg/hqdefault.jpg)](https://www.youtube.com/embed/0B2TTya6DOg?si=dOo3pfJiFfUzU8em)


### v0.2

First thing I figured would be nice to add was the ability to change the sound effects.  
That would require some sort of UI more advanced than the simple checkbox in the toolbar I had in v0.1 (which only enabled/disabled the plugin).  
Using the Qt Designer that is installed along with QGIS (with all of the QGIS specific widgets), I created a basic form with a row for every "event" that would recieve a sound effect.  
Each row had:
* A label with the name of the event
* A checkbox to enable/disable the sound effect for the event
* A drop down list to select a sound effect from (I added a few to make the choice more meaningful)
* A button to test the sound effect
* A volume slider

{: .box-note}
By now, those of you that went to the Qt PySide documentation should know that `QSound` can't change the volume of the sound it plays.  
But I wanted to give the users more control, and I found that the [`QSoundEffect`](https://doc.qt.io/qtforpython-5/PySide2/QtMultimedia/QSoundEffect.html) is a better fit for my needs.  
As recommended in the documentation, I used the `QSoundEffect` instead of [`QMediaPlayer`](https://doc.qt.io/qtforpython-5/PySide2/QtMultimedia/QMediaPlayer.html) because it is more suited for feedback to user actions.  

I added a button to the toolbar to open the settings dialog, and went to work on adding all of the necesary functions that will have to be connected to the UI elements in the dialog.

After creating a list of all the canvas events I wanted to add sound effects to, and making sure the UI elements of each row were named in a way I could easily identify them for an event, I tried creating a loop that would connect all of the UI elements to the functions that would handle the events.  

That wasn't actually such a big mess, but you know what was?  
Connecting the same elements and their functions to the canvas events.  
Why? Good question.  

Because canvas "events" are actually signals, you have to connect them by name directly, and you can't just loop through them.  
So using something like:
```python
def printHelloThere():
    print("Hello There")

iface.mapCanvas().layersChanged.connect(printHelloThere)
```
is fine, but you can't do something like:
```python
events = ["layersChanged","extentsChanged","scaleChanged"]
for event in events:
    iface.mapCanvas().event.connect(printHelloThere)

# Or
for event in events:
    iface.mapCanvas()[event].connect(printHelloThere)
```

Annoying, but not the end of the world.  
It just meant that each event will have to be handled separately, and that I would have to write a function for each event.  
Writing a function for each event wasn't that bad of an idea anyway, as some of them handle the data accepted from the signal differently.  
For example, there are no "Zoom In" or "Zoom Out" events for the canvas, but there is a "scaleChanged" event, which I can use to check if the scale is larger or smaller than the previous scale.  

After connecting all of the events to their functions, I had to make sure that the plugin would remember the settings between sessions (and within the session itself).  
This was actually already a part of v0.1 but I had to change the way the settings were saved and loaded to accomodate the new settings now available.

All of this (after the details were figured out) took about 2 days of work, and v0.2 was ready.  
And after a couple of bug fixes I got reports on in v0.2 (which only 38 people downloaded) a day later v0.2.1 was ready and up.


[![Version 0.2.1](https://img.youtube.com/vi/fTt_gCD_xW8/hqdefault.jpg)](https://www.youtube.com/embed/fTt_gCD_xW8?si=uED0_QSmRyEykhbP)


The last, and possibly most useful feature I added was adding a processing provider and algorithm that would allow users to play any of the sound effects from the plugin.  
The idea behind this was that users could place the algorithm inside models or scripts to play sound effects at specific points in the process.  
This was easiser than I expected, using 3 different refences to build the provider:
* The [QuickOSM](https://plugins.qgis.org/plugins/QuickOSM/) plugin
* The [Mergin Maps](https://plugins.qgis.org/plugins/Mergin/) plugin
* A simple processing plugin I created with the [Plugin Builder 3 ](https://plugins.qgis.org/plugins/pluginbuilder3/) plugin.

Niether of the approaches were perfect for what I pictured, but combining all 3 of them, and **actually reading the documentation** I was able to create a provider and algorithm that would play a sound effect when run.  


### Future Plans

Working on the plugin was both fun and frustrating, but I learned a lot from it, even though I already had some plugins under my belt.  
This was my first time creating a plugin with a processing provider, and because of the way that `QSoundEffect` works, I had to read the documentation more carefully and understand how to use it properly.  

While it's not in my most urgent tasks, I still have some features in mind I would like to add to the plugin when the time comes:

* Add the ability to add custom sound effects to the plugin
* Allow loops for sound effects
* Split the `layersChanged` event to `layerAdded`, `layerRemoved`
    * Allow the user to select a sound effect for different formats in layer events
* Add the `layerSavedAs` event

If you got this far, and you have other ideas for the plugin, or you want to help me with the plugin, feel free to stop by the plugin repositpry on GitHub [bogind/qgs_sound_effects](https://github.com/bogind/qgs_sound_effects).  

One last point you might find interesting,   
if you are wondering what volume icon I used for all of the icons in the plugin, it's actually something I created in QGIS using the geometry generator and the `Geometry by expression` algorithm and then saved as a geojson.
You can find the geojson [here]({{ '/assets/etc/volume.geojson' | relative_url }}).  


I hope you found the post interesting, and that you can use the plugin to make your work a bit more fun and interesting.