This is a widget developed to show statistical graphs based on Angular directives for Nvd3.

It has been designed to be fully functionall according to research proposes.

In this version has been implemented the Pie and Discrete Chart only. More features will be developed according to the research needs.However, it will be likely to be implemented with others requirements.
Initially a bare widget is created begining with an empty skeleton. Widget code includes the concepts described on: [krispo](http://krispo.github.io/angular-nvd3/#/pieChart)

This basic widget is added some properties, where the user can indicate:
1.- the webService path, which provides data.
2.- the principal and second variable to graph
3.- the operation will be computed between above two variables.
4.- Yes or NOT to observe logs on development or production environments.


HOW TO:
1.- Add GraphNvd3.wgt to Wirecloud Resources 
2.- In your Dashboard, click Add button to add new widgets. Select GraphNvd3.
3.- A graph will be showed on Dashboard. Select "Configuration" option on top of window graph.
4.- Configure paremeters as you decide.
5.- Refresh (ReLoad) the window graph.

Note: GraphNvd3 functionality is implemented using wiring to send and receive _messages_ to other instance of the same widget. This allows showing how to use wiring, both for sending messages and for subscribing to them.
Finally, users place graphs on wirecloud dashboard.  

SETTINGS
Url conecion: "ws://host:port/project_name/websocket_name"
Example: "ws://localhost:8080/WebSockets/websocket/chat"
INPUT DATA FORMAT.
	[
		{"id": id_item_1, "description": text_description,"calledVariations":null,"size":0},
		{"id": id_item_2, "description": text_description,"calledVariations":null,"size":0}
		{"id": id_item_3, "description": text_description,"calledVariations":null,"size":0}
	]
OUTPUT DATA FORMAT.
	[id_item_seleccionado_1,id_item_seleccionado_2,id_item_seleccionado_n ]


Credits:
Icon made by [author link] from www.flaticon.com 
E.g.: Icon made by Freepik from www.flaticon.com 

<div>Icons made by <a href="http://www.flaticon.com/authors/popcic" title="Popcic">Popcic</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>