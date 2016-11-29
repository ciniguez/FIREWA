This is a widget developed to list filters created by other Statistical Graphs.

It has been designed to be fully functionall according to research proposes.

More features will be developed according to the research needs.However, it will be likely to be implemented with others requirements.

Initially a bare widget was created begining with an empty skeleton. Widget code includes the concepts described on: [krispo](http://krispo.github.io/angular-nvd3/#/pieChart)

This basic widget is added some properties, where the user can state:

1.- WebSocket URL: the WebSocket path, which is used to send data to Server.

2.- Environment: the operation will be computed between above two variables (Development or Production). Not as Production, Development option generates log messages on web console.

3.- WebSocket Identifier: The Identifier to Websocket (By default: reset)

4.- Workspace: By default the option is setted to Local-Simple HTML. In order to start the widget operation, it should be setted to "Wirecloud".


HOW TO: 

1.- Add Filter.wgt to Wirecloud Resources
 
2.- In your Dashboard, click Add button to add new widgets. Select Filter.

3.- A List will be showed on Dashboard. Select "Configuration" option on top of window graph.

4.- Configure paremeters as you decide. (See in "Requerimients")

5.- Refresh (ReLoad) the window widget.

Note: Filter functionality is implemented using wiring to receive _messages_ from other instance of the same widget. 



SETTINGS
- Url conecion: "ws://host:port/project_name/websocket_name"
- Example 1: "ws://localhost:8080/WebSockets/websocket/chat"
- Example 2: "ws://158.42.185.198:8080/gembiosoft"


INPUT DATA FORMAT (NOTA: Unicamente se recibe en la creación del componente, más no en su ejecución).
	
	[
	 	chromosome{"nombre_chromosoma1","nombre_chromosoma2",..."nombre_chromosomaN"},	
		phenotype{"nombre_phenotype1", "nombre_phenotype2",...,"nombre_phenotypeN"},
		clinicalSignificance{"clinicalSignificance1","clinicalSignificance2",..., "clinicalSignificanceN"},
	]
	
OUTPUT DATA FORMAT.

	[id,type]
where: 

id = nombre del item seleccionado

type = Cadena de Texto que identifica el grupo al que pertenece el item seleccionado. Puede tomar 1 de los siguientes valores ("chromosome","phenotype", "clinicalsignificance", "all").
	
Credits:
<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>