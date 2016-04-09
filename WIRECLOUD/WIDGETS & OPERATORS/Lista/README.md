This is a widget developed to show a list of items.

It has been designed to be fully functionall according to research proposes.

Initially a bare widget is created begining with an empty skeleton. Widget code includes the concepts described on: [krispo](http://krispo.github.io/angular-nvd3/#/pieChart)

This basic widget is added some properties, where the user can state:

1.- WebSocket URL: websocket path to connect at server. It is used to receive data from Server or send to data to Server.

2.- Worksapace: States whether widget run either Local or Wirecloud Workspace.

3.- Environment: States whether widget runs on Development (shhowing log messages) or Production.


HOW TO:

1.- Add List.wgt to Wirecloud Resources 

2.- In your Dashboard, click Add button to add new widgets. Select DataList.

3.- A Item List will be showed on Dashboard. Select "Configuration" option on top of window graph.

4.- Configure paremeters as you decide.

5.- Refresh (ReLoad) the window graph.


Note: List functionality is implemented using wiring to send  _messages_ to Filter Widget. We recommend you using Filter Widget too.

SETTINGS
- Url conecion: "ws://host:port/project_name/websocket_name"
- Example: "ws://localhost:8080/WebSockets/websocket/chat"

INPUT DATA FORMAT.
	[
	
	 	{"id": id_item_1, "description": text_description,"calledVariations":null,"size":0},
	 	
		{"id": id_item_2, "description": text_description,"calledVariations":null,"size":0}
		
		{"id": id_item_3, "description": text_description,"calledVariations":null,"size":0}
		
	]
	
OUTPUT DATA FORMAT.

	[id_item_seleccionado_1,id_item_seleccionado_2,id_item_seleccionado_n ]
	
Credits:
<div>Icons made by <a href="http://www.flaticon.com/authors/popcic" title="Popcic">Popcic</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>