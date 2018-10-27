// center of the map
var center = [45, 20];

// Create the map
var map = L.map('map').setView(center, 5);

// Set up the OSM layer
L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);
     
var tileLayer = L.geoPackageFeatureLayer([], {
      geoPackageUrl: 'https://ngageoint.github.io/GeoPackage/examples/rivers.gpkg',
      layerName: 'rivers',
      filter:function (feature,layer){
      	 if (feature.properties.property_1 == 'Danube') {
          return  'true'
    		 }
      },
      style: function (feature) {
        return {
          color: "#F00",
          weight: 2,
          opacity: 1
        };
      },
      onEachFeature: function (feature, layer) {
        var string = '<span class="labelTitle">Filter just the Danube</span><br>';
        for (var key in feature.properties) {
          string += '<div class="item"><span class="label">' + key + ': </span><span class="value">' + feature.properties[key] + '</span></div>';
        }
        layer.bindPopup(string);
      }
  }).addTo(map);
  
  var tileLayer2 = L.geoPackageFeatureLayer([], {
      geoPackageUrl: 'https://ngageoint.github.io/GeoPackage/examples/rivers.gpkg',
      layerName: 'rivers',
      filter:function (feature,layer){
      	 if (feature.properties.property_0 == '6') {
          return  'true'
    		 }
      },
      style: function (feature) {
        return {
          color: "#00f",
          weight: 1.4,
          opacity: 0.5
        };
      },
      onEachFeature: function (feature, layer) {
        var string = '<span class="labelTitle">Filter by type</span><br>';
        for (var key in feature.properties) {
          string += '<div class="item"><span class="label">' + key + ': </span><span class="value">' + feature.properties[key] + '</span></div>';
        }
        layer.bindPopup(string);
      }
  }).addTo(map);
