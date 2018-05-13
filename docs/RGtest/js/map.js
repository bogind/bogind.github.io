
				
				// Add OpenStreetMap tile layer variables
				// need to check about creating a local tile server
				var OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
				var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				});
				
				
				
				
				var baseMaps = {
				"<span style='color: #777777'>Open Street Map</span>": OSM,
				"Esri World Imagery": Esri_WorldImagery
				};
				
				
				var customOptions = {
								maxWidth: 500,
								minWidth : 300
								}
				
				
				// Function to create the popups for the GeoJSON layer
				// needs editing to match migrashim data
				function onEachFeature(feature, layer) {
				if (feature.properties && feature.properties.pt_address) {
				layer.bindPopup(
								'<p style="font-size:18px; white-space: nowrap ; width:250; color:#00e699"><b>RG Streets</b></p>' +
								"<b>Address:  </b>" + 
								feature.properties.pt_address 
								,
								customOptions
								);
					}else
				if (feature.properties && feature.properties.ST_NAME){
					layer.bindPopup(
							'<p style="font-size:14px; white-space: nowrap ; width:250; color:#00e699"><b>RG Addresses</b></p>' +
								"<b>Street name #:  </b>" + 
								feature.properties.ST_NAME,
								customOptions
						);
					}
				}
					
				var geojsonMarkerOptions = {
						radius: 15,
						fillColor: "#ff7800",
						color: "rgba(255,255,255,0)",
						weight: 1,
						opacity: 1,
						fillOpacity: 0
					};

				var addr = L.geoJson(addresses, {
							onEachFeature: onEachFeature,
							pointToLayer: function (feature, latlng) {
								return L.circleMarker(latlng, geojsonMarkerOptions);
							}
						});
				
				
				var stre = L.geoJSON(streets, {
				onEachFeature: onEachFeature,
				style:{
					color:'black'
				}
				});
				
				var lyrs = {
				//"<span style='color: #008ae6'>Addresses</span>": addr,
				"Streets":stre
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
				{center: [32.06561, 34.82287], 
				zoom: 14,
				layers: [OSM, addr, stre]
				});
				
				$.getJSON("../data/Streets.geojson", function(data) {
					L.geoJSON(data).addTo(map);
				});
				
				
				
				L.control.layers(baseMaps, lyrs).addTo(map);

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
				
					//sample data values for populate map
				
				
				

				var addfound;

				function searchAddresses(){
						
						$("#search").click(function(){
						
					  var inText = document.getElementById("addIn").value.toString().trim()
						for (var i=0 ; i < addresses.features.length ; i++)
						{
							if (addresses.features[i].properties["pt_address"] == inText) {
								if (addfound != undefined) {
								  map.removeLayer(addfound);
								};
								console.log("success");
									coords = [addresses.features[i].geometry.coordinates[1],addresses.features[i].geometry.coordinates[0]]
									addfound = L.marker(coords).addTo(map);
									map.setView(coords, 16); 
					
							}
						}


				  });
				};

				var searchCtrl = L.control.fuseSearch()
				searchCtrl.addTo(map);
				searchCtrl.indexFeatures(addresses, ['pt_address']);




