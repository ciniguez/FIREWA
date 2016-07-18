/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

/**
 * Esta función es una función anónima que se ejecuta inmediatamente.
 * La función está compuesta por:
 * 1.- Variables globales de la función
 * 2.- Función init() que inicializa las variables. Principalmente lee de preferencias la URL del Servicio Web del cual se obtendrán los datos
 * 3.- Función obtenerDatos que recupera los datos desde el servicio web. En caso de éxito procede a mostrar los datos
 * 4.- Función presentar_datos() que tiene el código de Angular para mostrar el gráfico con los datos provistos
 * 5.- document.addEventListener('load', init.bind(this), true); que se ejecuta al terminar la carga del HTML completo y
 * llama a la función init() del punto 2.
 * @author Carlos iniguez
 */

//Si se cierra el Navegador, cerrar el WebSocket activo.
window.onbeforeunload = function() {
	if (MODELO.websocket.singleInstance) {
		console.log(MODELO.websocket.singleInstance.conn.readyState);
		if (MODELO.websocket.singleInstance.conn.readyState != WebSocket.CLOSED) {
			MODELO.websocket.singleInstance.conn.close(1000);
			console.log("ws cerrado");
		}
	}
};

(function() {

	/**
	 * Variables globales de la función
	 */
	"use strict";

	// url de servicio web consultada
	var url = null;
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "";
	//Indicador para ejecucion en Wirecloud o fuera de wirecloud
	var boolPresentacionWirecloud = false;
	//Variable WebSocket
	var ws = null;
	//Nombre identificador del websocket para conexion al servidor
	var identificadorWebSocket = null;
	//Tabla de Datos HTML
	var oTable = null;

	/**
	 * Inicialización de variables
	 * @author Carlos iniguez
	 */
	function init() {
		//Obtener los atributos desde preferencias
		if (boolPresentacionWirecloud) {
			url = obtenerAtributoPreferencias('urlServicio');
			typeGraph = obtenerAtributoPreferencias('typeGraph');
			attr1 = obtenerAtributoPreferencias('attr1');
			attr2 = obtenerAtributoPreferencias('attr2');
			prefAggregate = obtenerAtributoPreferencias('aggregate');
			identificadorWebSocket = obtenerAtributoPreferencias('websocketIdentifier');
			//Variable para saber si se ejecuta en Ambiente de producción o debug
			//(debug muestra los mensajes de código)
			environment = obtenerAtributoPreferencias('environment');
		} else {
			url = obtenerAtributoPreferencias('undefined');
			identificadorWebSocket = obtenerAtributoPreferencias('undentified');
			//Variable para saber si se ejecuta en Ambiente de producción o debug
			//(debug muestra los mensajes de código)
			environment = obtenerAtributoPreferencias('undefined');

			//local settings only by testing
			url = "ws://localhost:8080/gembiosoft/gembiosoft";
			//url = "wss://158.42.185.198:8443/graphws2";

			environment = "dev";
			identificadorWebSocket = "resultTable";
		}

		//REGISTRO DE WIRING
		if (boolPresentacionWirecloud) {
			/* Add register to wiring the Cromosome input value*/
			MashupPlatform.wiring.registerCallback("inputChromosome", handlerSlot.bind(this));
			/* Add register to wiring the Filter input value*/
			MashupPlatform.wiring.registerCallback("inputFilter", handlerSlot.bind(this));
			/* Add register to wiring the Allele value */
			MashupPlatform.wiring.registerCallback("inputAllele", handlerSlot.bind(this));
			/* Add register to wiring the Position value */
			MashupPlatform.wiring.registerCallback("inputPos", handlerSlot.bind(this));
		}

		//----------------------------------------------------------------------------------
		//--------------------------- CONEXION WEB SOCKET --------------------------------------
		//----------------------------------------------------------------------------------

		crearWebSocket();

		//----------------------------------------------------------------------------------

		/*
		 * Registro los datos desde Preferencias (fichero config.xml)
		 * Si existe un cambio en un parámetro de preferencias, este método se dispara
		 * para obtener el nuevo valor y llama a presentar los datos en el gráfico
		 * @author Carlos iniguez
		 */
		if (boolPresentacionWirecloud) {
			MashupPlatform.prefs.registerCallback(function(new_values) {
				parametroCambiado = "";
				var boolean_flag = false;
				if ('urlServicio' in new_values) {
					url = obtenerAtributoPreferencias('urlServicio');
					parametroCambiado = "url";
				}
				if ('environment' in new_values) {
					parametroCambiado = "env";
					environment = obtenerAtributoPreferencias('environment');
				}
				if ('websocketIdentifier' in new_values) {
					parametroCambiado = "websocketIdentifier";
					identificadorWebSocket = obtenerAtributoPreferencias('websocketIdentifier');
					//Terminar el WebSocket anterior.
					if (ws) {
						ws.conn.close();
						ws = null;
					}
				}
				//llamo a que se ejecute la obtención de datos desde el servidor
				logg("init", "parametro cambiado: " + parametroCambiado, 111);
				dispararCambio(parametroCambiado);

			});
		}

	}

	function transformadorDatos(jsonObj) {
		var dataJson = JSON.parse(jsonObj);
		var datos = new Array();

		for (var o = 0; o < dataJson.length; o++) {
			var arrayObjeto = new Array();
			/*
			arrayObjeto[0] = dataJson[o].id;
			arrayObjeto[1] = dataJson[o].chromosomeId;
			arrayObjeto[2] = dataJson[o].chromosomeName;
			arrayObjeto[3] = dataJson[o].chromosomePosition;
			arrayObjeto[4] = dataJson[o].referenceAllele;
			arrayObjeto[5] = dataJson[o].alternativeAllele;
			arrayObjeto[6] = dataJson[o].sampleId;
			arrayObjeto[7] = dataJson[o].sampleName;
			arrayObjeto[8] = dataJson[o].clinicalSignificance;
			arrayObjeto[9] = dataJson[o].phenotypeId;
			arrayObjeto[10] = dataJson[o].phenotypeName;
			arrayObjeto[11] = dataJson[o].phenotypeDescription;
			*/
			arrayObjeto[0] = dataJson[o].chromosomeName;
			arrayObjeto[1] = dataJson[o].chromosomePosition;
			arrayObjeto[2] = dataJson[o].referenceAllele;
			arrayObjeto[3] = dataJson[o].alternativeAllele;
			arrayObjeto[4] = dataJson[o].sampleName;
			arrayObjeto[5] = dataJson[o].clinicalSignificance;
			arrayObjeto[6] = dataJson[o].phenotypeName;
			arrayObjeto[7] = dataJson[o].phenotypeDescription;

			datos.push(arrayObjeto);
		}
		return datos;
	}

	/**
	 * Presenta mensajes en la parte inferior del grafico (utilizada para feedback al usuario)
	 * @author Carlos iniguez
	 */
	function noData(msg) {
		$("#msg").empty();
		$("#msg").append("<p>Faults!</br>App says: <span>" + msg + "</span></p>");
		$("#msg").fadeOut(5000);
	}

	/**
	 * Presenta los datos en los graficos estadisticos
	 * @author Carlos iniguez
	 */
	function presentarDatos(data) {

		if (oTable === null) {
			console.log('in if');
			//    oTable.fnClearTable(); // can this be used?
			//jQuery('#datatable').dataTable().fnDestroy();
			// **please note this**
			oTable = $('#datatable').dataTable({
				data : transformadorDatos(data),
				columns : [/*{
					title : "id Variacion"
				}, {
					title : "idCromosoma"
				}, */{
					title : "Name Chr"
				}, {
					title : "Chr Positcion"
				}, {
					title : "Ref"
				}, {
					title : "All"
				}, /*{
					title : "id Sample"
				}, */{
					title : "Name Sample"
				}, {
					title : "Clinical Significance"
				}, /*{
					title : "idGenotipo"
				}, */{
					title : "Name Genotipo"
				}, {
					title : " Genotipo Description"
				}]
			});

		} else {
			console.log('in else');
			// how to change the data contained inside datatable?
			oTable.fnClearTable();
			oTable.fnAddData(transformadorDatos(data));
			oTable.fnAdjustColumnSizing();

		}

	}

	/**
	 * Presenta los datos en los graficos estadisticos
	 * @author Carlos iniguez
	 */
	function __presentarDatos(data) {
		//data = [["Tiger Nixon", "System Architect", "Edinburgh", "5421", "2011/04/25", "$320,800"], ["Garrett Winters", "Accountant", "Tokyo", "8422", "2011/07/25", "$170,750"]];
		if (oTable === null) {
			console.log('in if');
			//    oTable.fnClearTable(); // can this be used?
			//jQuery('#datatable').dataTable().fnDestroy();
			// **please note this**
			oTable = $('#datatable').dataTable({
				data : data,
				columns : [{
					title : "Name"
				}, {
					title : "Position"
				}, {
					title : "Office"
				}, {
					title : "Extn."
				}, {
					title : "Start date"
				}, {
					title : "Salary"
				}]
			});

		} else {
			data[0][0] = "Carlos";
			console.log('in else');
			// how to change the data contained inside datatable?
			oTable.fnClearTable();
			oTable.fnAddData(data);
			oTable.fnAdjustColumnSizing();

		}

	}

	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 * @author Carlos iniguez
	 */
	var handlerSlot = function handlerSlot(itemString) {
		switch(itemString) {
		case "inputChromosome":
			pch = itemString;
			break;
		case "inputFilter":
			pfil = itemString;
			break;
		case "inputAllele":
			pal = itemString;
			break;
		case "inputPos":
			ppos = itemString;
			break;
		case "websocketIdentifier":
			identificadorWebSocket = itemString;
			break;
		}
		if (itemString !== "" || itemString !== null) {
			dispararCambio(itemString);
		} else {
			logg("handlerSlot", "No existe emparejamiento con la preferencia solicitada", 357);
		}
	};
	/**
	 * Establece la conexión con el servidord a traves de WebSocket
	 * @author Carlos iniguez
	 */
	function crearWebSocket() {
		
		//Para la conexion con WebSocket se requiere el nombre identificador del widget para enviarlo al servidor.
		if (identificadorWebSocket !== null) {
			ws = new MODELO.websocket(url, presentarDatos, noData, identificadorWebSocket);
			logg("dispararCambio", "Conectando a WebSocket con: " + url, 372);
		} else {
			logg("init", "init: Se requiere configurar el ¡identificador de Websocket", 103);
			noData("You must set the websocket identifier!");
		}
	}

	/**
	 * Llamada al Websocket por demanda.
	 * @author Carlos iniguez
	 */
	function dispararCambio(cadena) {
		if (ws) {
			ws.conn.send(cadena);
			//MODELO.websocket.conn.send(cadena);
		} else {
			crearWebSocket();
		}

	}

	/**
	 * Otiene el valor del atributo desde preferencias, basado en el nombre del atributo enviado como parámetro.
	 * @atributo Valor del atributo configurado en Preferencias. Si no encuentra el valor, retorna NULL.
	 * @author Carlos iniguez
	 */
	function obtenerAtributoPreferencias(nombreAtributo) {
		var atributo;
		if (boolPresentacionWirecloud) {
			atributo = MashupPlatform.prefs.get(nombreAtributo);
		}
		if ( typeof (atributo) === 'undefined') {
			atributo = null;
		}
		return atributo;
	};
	/**
	 * Function utilizada para los mensajes de DEBUG ( tipo INFORMACION), en el caso de que se ejecute el Widget en modo "development"
	 * @param nombreFuncion Nombre de la funcion de donde se lanza el mensaje
	 * @param mensaje Texto a mostrar en el mensaje de salida
	 * @param linea Número de Linea de codigo correspondiente donde se ejecuta el mensaje
	 * @author Carlos iniguez
	 */
	function logg(nombreFuncion, mensaje, linea) {
		if (environment === "dev") {
			if (boolPresentacionWirecloud) {
				MashupPlatform.widget.log("DEBUG: " + nombreFuncion + "->" + mensaje + " in line: " + linea, MashupPlatform.log.INFO);
			} else {
				console.log("DEBUG: " + nombreFuncion + "->" + mensaje + " in line: " + linea);
			}

		}
	};
	/**
	 * Llamada a la función (init() como inicializador)
	 * NOTE: I have changed "DOMContentLoaded" for "load" beacause I need the whole HTML and resources loaded.
	 * @author Carlos iniguez
	 */
	document.addEventListener('load', init.bind(this), true);

})();

