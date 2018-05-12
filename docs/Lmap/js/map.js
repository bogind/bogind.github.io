
				
				// Add OpenStreetMap tile layer variables
				// need to check about creating a local tile server
				var OSM = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
				var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				});
				var rbm = L.tileLayer('file://tiles/{z}/{x}/{y}.png');
				
				
				
				var baseMaps = {
				"<span style='color: #777777'>Open Street Map</span>": OSM,
				"Esri World Imagery": Esri_WorldImagery,
				"Rahat Municipality Layer": rbm
				};
				
				
				
				var customOptions = {
								maxWidth: 500,
								minWidth : 300
								}
				
				
				// Function to create the popups for the GeoJSON layer
				// needs editing to match migrashim data
				function onEachFeature(feature, layer) {
				if (feature.properties && feature.properties.Neighborho) {
				layer.bindPopup(
								'<p style="font-size:18px; white-space: nowrap ; width:250; color:#99003d"><b>Rahat Municipality</b></p>' +
								"<b>Neighborhood:  </b>" + 
								feature.properties.Neighborho+
								"</br><b> Lot #: </b>" +
								feature.properties.PlotNum,
								customOptions
								);
					}
				}
				
				// coloring functions
				function getColor(d) {
							if(d == '0') return '#9e0000'; else
							if(d == '1') return '#00bfff'; else
							if(d == '10') return '#9e4f00'; else
							if(d == '11') return '#9e7700'; else
							if(d == '12') return '#9e9e00'; else
							if(d == '13') return '#779e00'; else
							if(d == '14') return '#4f9e00'; else
							if(d == '15') return '#289e00'; else
							if(d == '17') return '#009e77'; else
							if(d == '17-18') return '#009e9e'; else
							if(d == '18') return '#00779e'; else
							if(d == '19') return '#004f9e'; else
							if(d == '2') return '#0000a0'; else
							if(d == '20') return '#4f009e'; else
							if(d == '21') return '#77009e'; else
							if(d == '22') return '#9e009e'; else
							if(d == '2-3') return '#9e0077'; else
							if(d == '24') return '#9e004f'; else
							if(d == '25') return '#9e0000'; else
							if(d == '26') return '#ffd966'; else
							if(d == '27') return '#ffff66'; else
							if(d == '28') return '#9e0000'; else
							if(d == '29') return '#9e2800'; else
							if(d == '3') return '#9e4f00'; else
							if(d == '30') return '#9e7700'; else
							if(d == '31') return '#9e9e00'; else
							if(d == '32') return '#779e00'; else
							if(d == '34') return '#4f9e00'; else
							if(d == '38') return '#289e00'; else
							if(d == '4') return '#009e77'; else
							if(d == '41') return '#009e9e'; else
							if(d == '5') return '#00779e'; else
							if(d == '56') return '#004f9e'; else
							if(d == '7') return '#0000a0'; else
							if(d == '8') return '#4f009e'; else
							if(d == '9') return '#77009e'; else
							if(d == 'מער') return '#9e009e'; else
								return '#b3b3b3';
						}

				function style(feature) {
					return {
						fillColor: getColor(feature.properties.Neighborho),
						weight: 0.5,
						opacity: 0.3,
						color: 'white',
						dashArray: '3',
						fillOpacity: 0.5
					};
				}						
				
				
				// Get GeoJSON layer ready
				var rahat2 = L.geoJSON(rahat, {
				onEachFeature: onEachFeature,
				style: style });
				
				var rht = {
				"<span style='color: #008ae6'>Rahat Lots</span>": rahat2
				};	
				
				var options = {
				 position: 'bottomleft' ,
				 primaryLengthUnit: 'meters',
				 secondaryLengthUnit: 'kilometers',
				 primaryAreaUnit: 'sqmeters', 
				 secondaryAreaUnit: 'hectares',
				 completedColor: '#C8F2BE',
				 popupOptions: { className: 'leaflet-measure-resultpopup', autoPanPadding: [10, 10] },
				 captureZIndex: 10000,
				 decPoint: '.', thousandsSep: ','
				}
				
				
				
				//create map
				var map = L.map('map', 
				{center: [31.389502, 34.756515], 
				zoom: 14,
				layers: [OSM, rahat2]});
				

				L.control.layers(baseMaps, rht).addTo(map);

				var measureControl = new L.Control.Measure({
					primaryLengthUnit: 'meters',
					secondaryLengthUnit: 'kilometers',
					primaryAreaUnit: 'sqmeters',
					secondaryAreaUnit: 'hectares'
				});
				measureControl.addTo(map);
				
				
				L.control.mousePosition().addTo(map);
				
				
				var osmGeocoder = new L.Control.OSMGeocoder({
					collapsed: false,
					position: 'topright',
					text: 'Search',
				});
				osmGeocoder.addTo(map);

function roundToFive(num) {    
					return +(Math.round(num + "e+5")  + "e-5");
				}
				
function mapClick(e) {
    
    // Get clicked coordinates
    var coords = e.latlng;
	var zoom = map.getZoom();

    $("#last-click").html( "<br><p>You last clicked the map at -<br><b>lat:</b> " + 
            roundToFive(e.latlng.lat) + 
            "<br><b>Long:</b> " + 
            roundToFive(e.latlng.lng)+"</p>"+
           "<span>see this location on <a target='_blank' href='https://www.google.com/maps/?q="+ 
		   e.latlng.lat +","+ e.latlng.lng +
		   "' ><img src='https://vignette.wikia.nocookie.net/logopedia/images/3/35/Googlemapsicon2015.png/revision/latest/scale-to-width-down/173?cb=20150901185327' height='25' width='25'/></a>"+
		   "</span><br>"+
		   "<span>see this location on <a target='_blank' href='https://wego.here.com/?map="+
		   e.latlng.lat +","+ e.latlng.lng +
		   ","+zoom+",normal'>"+
		   "<img src='https://www.here.com/sites/all/themes/herecorporate/build/img/here-logo.svg'  height='25' width='25'/>"+
			"</span>")
};

map.on("click", mapClick);
