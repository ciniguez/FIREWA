Introduction
------------

In this example, we are going to implement a Weather Widget as an excuse to
learn how to use the most commonly used features of WireCloud from a point of
view of Widgets. Our intention is to create a Widget capable of making AJAX
request to a external service and of communicating with other widgets in a
mashup. This guide does not cover the development of the widget's user
interface, which doesn't have to do with WireCloud and it's based on standard
HTML, JavaScript and CSS code. 

First of all, download this initial code from this [link][initial_code]. This
code contains a widget example skeleton including basic html/style code.

Also, you will need to create a new API key for the Weather Underground API
using this [link][weatherunderground_api].

[initial_code]: http://conwet.fi.upm.es/docs/download/attachments/1278018/Example1Skel.zip
[weatherunderground_api]: http://www.wunderground.com/weather/api/d/login.html

Making request to Weather Underground
-------------------------------------

Weather Underground provide a rest API for this for this purpose (documented at
http://www.wunderground.com/weather/api/d/docs), but we cannot access this API
using normal AJAX request (using XMLHttpRequest) due browsers applying the [same
origin policy][same_origin_policy] to javascript code. Fortunately, WireCloud
provides the [MashupPlatform.http.makeRequest][http.makeRequest]  method for
dealing with this problem. A possible way to access to this API is by using the
following code:

    :::javascript

    var getForecastByCoord = function getForecastByCoord(coord, onSuccess, onError) {
        var url;
        if ((typeof onSuccess !== 'function') || (typeof onError !== 'function')) {
            throw new TypeError();
        }
        url = 'http://api.wunderground.com/api/' + API_KEY + '/conditions/forecast/q/';
        url += coord.lat + ',' + coord.lon;
        url += '.json';
        MashupPlatform.http.makeRequest(url, {
            method: 'GET',
            onSuccess: function (response) {
                var forecast_data;
                forecast_data = JSON.parse(response.responseText);
                if (forecast_data.error) {
                    onError();
                } else {
                    onSuccess(forecast_data);
                }
            },
            onError: function () {
                onError();
            }
        });
    };

The getForecastByCoord function makes the appropriated request to Weather
Underground and passes the result to the onSuccess callback.

[same_origin_policy]: http://en.wikipedia.org/wiki/Same_origin_policy
[http.makeRequest]: http://conwet.fi.upm.es/docs/display/wirecloud/Javascript+API#JavascriptAPI-MashupPlatformhttpmakeRequest

Adding an input endpoint
------------------------

Input endpoints must be declared into the widget template before it can be used
by the javascript code of the widget. To do so, open `config.xml` and add an
`inputendpoint` element into the `wiring` section. The final result should look
like:

    :::xml

    ...
     
    <wiring>
        <inputendpoint 
            name="coord"
            type="text"
            label="Show forecast by coord"
            description="Shows the weather forecast for a given location (a latitude longitude coordinate)."
            friendcode="location"
        />
    </wiring>
     
    ...
 

* The **name** attribute will be use to reference to the input endpoint when
  using the javascript API.
* The **label** attribute will be used mainly in the Wiring Editor and will be
  the official name by which end users will know the input endpoint. Also, this
  attribute can be translated whereas the name attribute not.
* The **description** attribute is used to provide end user with a description
  of what is going to happen if an event arrives the input endpoint. This
  description is very important for the wiring process as the user needs this
  information for taking decisions on howto wire widgets.
* The **friendcode** is used by the Wiring Editor to provide basic wiring
  recommendations. In this case, we are declaring that we accept data produced
  by output endpoints with a friendcode of "location". The format of this data
  is a string with the longitude and the latitude separated by a comma.

This is how to declare the input endpoint when using RDF (turtle):

    :::rdf

    ...
    wire:hasPlatformWiring [ a <http://WireCloud.conwet.fi.upm.es/ns/widget#PlatformWiring>;
            wire:hasInputEndpoint [ a <http://wirecloud.conwet.fi.upm.es/ns/widget#InputEndpoint>;
                    rdfs:label "Show forecast by coord";
                    dcterms:description "Shows the weather forecast for a given location (a latitude longitude coordinate).";
                    dcterms:title "coord";
                    wire:friendcode "location";
                    wire:type "text" ] ];
    ...
 

Once declared the input endpoint in the widget template, you can register a
callback for this endpoint making use of the
[MashupPlatform.wiring.registerCallback][wiring.registerCallback]  method. In
addition to registering the input endpoint, we need to process event data before
using it and to notify the user that the forecast data for the given location is
being requested. This can be accomplished by using the following code:

    :::javascript

    var searchByCoordListener = function searchByCoordListener(event_data) {
        var tmp, coord;
        tmp = event_data.split(',');
        coord = {
            lat: tmp[1],
            lon: tmp[0]
        };
        startLoadingAnimation();
        getForecastByCoord(coord, function (forecast_data) {
            updateWeatherForecast(forecast_data);
            stopLoadingAnimation();
        }, function () {
            clearWeatherForecast();
            stopLoadingAnimation();
        });
    };
 
    MashupPlatform.wiring.registerCallback("coord", searchByCoordListener);

[wiring.registerCallback]: http://conwet.fi.upm.es/docs/display/wirecloud/Javascript+API#JavascriptAPI-MashupPlatformwiringregisterCallback

Adding an output endpoint
-------------------------

As we did with the input endpoint, we need to declare the new output endpoint in
the weather widget's description. This is the final result of the Wiring section
after adding it:

    :::xml

    ...
     
    <wiring>
        <inputendpoint
            name="coord"
            type="text"
            label="Show forecast by coord"
            description="Shows the weather forecast for a given location (a latitude longitude coordinate)."
            friendcode="location"
        />
        <outputendpoint
            name="location_coord"
            type="text"
            label="Forecast location"
            description="This event is launched when the user clicks on the location name of current forecast."
            friendcode="location"
        />
    </wiring>
 
    ...

Description of the attributes:

* The **name** attribute will be use to reference to the output endpoint when
  using the javascript API.
* The **label** attribute will be used mainly in the Wiring Editor and will be
  the official name by which end users will know the output endpoint. Also, this
  attribute can be translated whereas the name attribute not.
* The **description** attribute is used to describe in which conditions the
  resource (in this case a widget) is going to send events through this
  endpoint. This description is also a good place for providing details about
  the data structure used by events leaving this output endpoint. This
  description is very important for the wiring process as the user needs this
  information for taking decisions on howto wire widgets.
* The **friendcode** is used by the Wiring Editor to provide basic wiring
  recommendations. In this case, we are declaring that we send data aligned with
  the friendcode "location".

This is how to declare the output endpoint when using RDF (turtle):

    :::rdf

    ...
    
    wire:hasPlatformWiring [ a <http://wirecloud.conwet.fi.upm.es/ns/widget#PlatformWiring>;
            wire:hasInputEndpoint [ a <http://wirecloud.conwet.fi.upm.es/ns/widget#InputEndpoint>;
                    rdfs:label "Show forecast by coord";
                    dcterms:description "Shows the weather forecast for a given location (a latitude longitude coordinate).";
                    dcterms:title "coord";
                    wire:friendcode "location";
                    wire:type "text" ] ];
            wire:hasOutputEndpoint [ a <http://wirecloud.conwet.fi.upm.es/ns/widget#OutputEndpoint>;
                    rdfs:label "Forecast location";
                    dcterms:description "This event is launched when the user clicks on the location name of current forecast.";
                    dcterms:title "location_coord";
                    wire:friendcode "location";
                    wire:type "text" ];
    
    ...

After adding the output endpoint to the widget description, we can send data
through it using the [MashupPlatform.wiring.pushEvent][wiring.pushEvent] method.
The following code adds an event listener to the location title that sends the
location of the current forecast:

    :::javascript

    document.getElementById('title').onclick = function (event) {
        var long, lat;
     
        long = forecast_data.current_observation.display_location.longitude;
        lat = forecast_data.current_observation.display_location.latitude;
        MashupPlatform.wiring.pushEvent('location_coord', long + ',' + lat);
    };


[wiring.pushEvent]: http://conwet.fi.upm.es/docs/display/wirecloud/Javascript+API#JavascriptAPI-MashupPlatformwiringpushEvent

Testing it
----------
