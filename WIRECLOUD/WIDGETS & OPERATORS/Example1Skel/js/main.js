/*global MashupPlatform*/

(function () {

    "use strict";

    var API_KEY = '<API_KEY>'; // TODO add here your Weather Underground API KEY

    var getForecastByCoord = function getForecastByCoord(coord, onSuccess, onError) {
        // TODO request forecast info
    };

    var updateWeatherForecast = function updateWeatherForecast(forecast_data) {
        var current_status_icon, current_status_label, i, forecastday, day_block;

        current_status_icon = forecast_data.current_observation.icon;
        if (forecast_data.current_observation.weather !== '') {
            current_status_label = forecast_data.current_observation.weather;
        } else {
            current_status_label = current_status_icon[0].toUpperCase() + current_status_icon.substr(1);
        }

        document.getElementById('title').textContent = forecast_data.current_observation.display_location.full;
        // TODO send a event when the user clicks the title element

        document.getElementById('current_status_icon').src = 'http://icons.wxug.com/i/c/a/' + current_status_icon + '.gif';
        document.getElementById('current_status_label').textContent = current_status_label;

        document.getElementById('current_temp').textContent = forecast_data.current_observation.temp_c + ' ºC';
        document.getElementById('current_feelslike').textContent = forecast_data.current_observation.feelslike_c + ' ºC';

        for (i = 0; i < 4; i += 1) {
            forecastday = forecast_data.forecast.simpleforecast.forecastday[i];
            day_block = document.getElementById('day' + i);

            day_block.getElementsByClassName('title')[0].textContent = forecastday.date.weekday;
            day_block.getElementsByClassName('status_icon')[0].src = 'http://icons.wxug.com/i/c/a/' + forecastday.icon + '.gif';
            day_block.getElementsByClassName('temp')[0].textContent = forecastday.high.celsius + ' ºC';
            day_block.getElementsByClassName('status_label')[0].textContent = forecastday.conditions;
        }

        document.getElementById('forecast').className = 'forecast';
        document.getElementById('noforecast').className = 'noforecast hide';
    };

    var clearWeatherForecast = function clearWeatherForecast() {
        document.getElementById('forecast').className = 'forecast hide';
        document.getElementById('noforecast').className = 'noforecast';
    };

    var startLoadingAnimation = function startLoadingAnimation() {
        document.getElementById('loading').className = '';
    };

    var stopLoadingAnimation = function stopLoadingAnimation() {
        document.getElementById('loading').className = 'hide';
    };

    // TODO listen to events incoming through the location_coord input endpoint
})();
