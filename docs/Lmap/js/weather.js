var weather = null;
var url = null;
var response = null;
			
var url = "https://api.openweathermap.org/data/2.5/forecast?lat=31.251155&lon=34.790096&APPID=af8e5cb5dff6f10ae68f0ab2470991cb&units=metric";
			
			$.ajax({
				  type: 'GET',
				  url: url,
				  success: function(resp) {
					var weather = resp;
					$("#weather-icon").html("<img src='http://openweathermap.org/img/w/"+weather.list[0].weather[0]["icon"]+".png' width='25' height='25'/>");
					$("#clouds").html(" Cloud Cover: "+ weather.list[0].weather[0].description + ", " + weather.list[0].clouds["all"]+"%");
					$("#temp").html(" Temperature: "+ weather.list[0].main.temp + "&#176" +
							"<br> Humidity: " + weather.list[0].main.humidity+"%" );
					if('rain' in weather.list[0] & '3h' in weather.list[0].rain){
						if(typeof w.responseJSON.list[0].rain["3h"] === "undefined"){
						$("#rain").html("");
						}else{
						$("#rain").html(" Precipitation: "+ weather.list[0].rain["3h"]);
						}
					}
					
				  },
				  error: function() {
				   console.log('error')
				  }
				});
