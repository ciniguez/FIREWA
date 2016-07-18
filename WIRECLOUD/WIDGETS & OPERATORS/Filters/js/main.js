/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

//Si se cierra el Navegador, cerrar el WebSocket activo.
window.onbeforeunload = function() {
	if (MODELO.websocket.singleInstance) {
		if (MODELO.websocket.singleInstance.conn.readyState === 1) {
			console.log("Estado Conexión: OPEN");
		}

		if (MODELO.websocket.singleInstance.conn.readyState != WebSocket.CLOSED) {
			MODELO.websocket.singleInstance.conn.close(1000);
			console.log("ws cerrado");
		}
	}
};
/**
 * Controlador de Widget Filters
 * OBJETIVO: Presentar una lista de filtros provenientes de los items pulsados externamente y recibidos por input del Wirin
 * Adicionalmente, permite eliminar los filtros de la lista, provocando el envío de la información a traves de WebSockets a un servidor indicado.
 *
 */
(function() {

	/**
	 * Variables globales de la función
	 */
	"use strict";
	// url de servicio web consultada
	var url = "";
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "dev";
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	// Bandera que identifica si el ambiente de ejecucion (local o wirecloud)
	var boolPresentacionWirecloud = true;
	//variable para el WebSocket
	var ws = null;
	//Bandera para especificar bajo que ambiente se trabaja
	var flagWorkspace = null;
	//Nombre identificador del websocket para conexion al servidor
	var identificadorWebSocket = null;

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Ocultar mensaje de desconexion
		$("#no-data").hide();

		//TODO: Descomentar para trabajar en LOCAL----
		//url = "ws://158.42.185.198:8080/graphws2";
		// -------------------------------------------

		//TODO: Descomentar para trabajar en WIRECLOUD -------------
		url = obtenerAtributoPreferencias('urlServicio');
		identificadorWebSocket = obtenerAtributoPreferencias('websocketIdentifier');

		/*
		 * Registro los datos desde Preferencias (fichero config.xml)
		 * Si existe un cambio en un parámetro de preferencias, este método se dispara
		 * para obtener el nuevo valor y llama a presentar los datos en el gráfico
		 * @author Carlos iniguez
		 */

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
				parametroCambiado = "identificadorWebSocket";
				identificadorWebSocket = obtenerAtributoPreferencias('websocketIdentifier');
			}
			if ('flagWorkspace' in new_values) {
				parametroCambiado = "flagWorkspace";
				flagWorkspace = obtenerAtributoPreferencias('flagWorkspace');
			}

			logg("init", "parametro cambiado: " + parametroCambiado, 111);

			if (flagWorkspace !== "wirecloud" && parametroCambiado === "flagWorkspace") {
				settingToWirecloud();
			} else {
				settingToWirecloud();
			}

		});
		//_---------------------------------------
		if (url !== null) {
			//Getting values from preferences (See more: config.xml)
			flagWorkspace = obtenerAtributoPreferencias('flagWorkspace');
			if (flagWorkspace === "wirecloud") {
				settingToWirecloud();
			} else {
				settingToLocal();
			}
		} else {
			logg("init", "An URL is required to start. Set and Restart the Widget!!.", 82);
		}

	}

	/**
	 * Setting behavior where a local connection is performed.
	 * Show the disconnect image on screen.
	 */
	function settingToLocal() {
		boolPresentacionWirecloud = false;
		//Show the disconnection image
		$("#no-data").show();
		logg("init", "Configurando como local.", 94);
		//local settings only by testing
		environment = "dev";
	}

	/**
	 * Setting behavior where a Wirecloud connection is performed
	 */
	function settingToWirecloud() {
		boolPresentacionWirecloud = true;
		//Hide the disconnection image
		$("#no-data").hide();

		logg("init", "Configurando como Wirecloud.", 105);
		url = obtenerAtributoPreferencias('urlServicio');
		environment = obtenerAtributoPreferencias('environment');
		identificadorWebSocket = getIdentificadorWebSocket();

		//REGISTRO DE WIRING
		/* Add register to wiring the Cromosome input value*/
		MashupPlatform.wiring.registerCallback("inChr", handlerSlotChr);
		/* Add register to wiring the Phenotype input value*/
		MashupPlatform.wiring.registerCallback("inPheno", handlerSlotPheno);
		/* Add register to wiring the Clinical Significance input value*/
		MashupPlatform.wiring.registerCallback("inClinical", handlerSlotClinical);
		/* Add register to wiring the Sample input value*/
		MashupPlatform.wiring.registerCallback("inSam", handlerSlotSample);

		crearWebSocket();

	}

	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 * @author Carlos iniguez
	 */
	var handlerSlotSample = function(itemString) {
		if (itemString !== "" || itemString !== null) {
			presentarDatos("inSam", itemString);
		} else {
			logg("handlerSlotPheno", "No existe emparejamiento con la preferencia solicitada", 357);
		}
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 * @author Carlos iniguez
	 */
	var handlerSlotPheno = function(itemString) {
		if (itemString !== "" || itemString !== null) {
			presentarDatos("inPheno", itemString);
		} else {
			logg("handlerSlot", "No existe emparejamiento con la preferencia solicitada", 357);
		}
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 * @author Carlos iniguez
	 */
	var handlerSlotChr = function(itemString) {
		if (itemString !== "" || itemString !== null) {
			presentarDatos("inChr", itemString);
		} else {
			logg("handlerSlot", "No existe emparejamiento con la preferencia solicitada", 357);
		}
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 * @author Carlos iniguez
	 */
	var handlerSlotClinical = function(itemString) {
		if (itemString !== "" || itemString !== null) {
			presentarDatos("inClinical", itemString);
		} else {
			logg("handlerSlot", "No existe emparejamiento con la preferencia solicitada", 357);
		}
	};
	/**
	 * Show data on screen
	 * @param wiringNameVariableRecibed Variable name to identify the data type to present.
	 * @param objInfoJSONText A string which represent an JSON object (id, label, value), it is the information to show.
	 * @author Carlos Iniguez
	 */
	function presentarDatos(wiringNameVariableRecibed, objInfoJSONText) {
		var label = "";
		var id = "all";
		var objInfo = JSON.parse(objInfoJSONText);

		switch(wiringNameVariableRecibed) {
		case "inChr":
			label = "Chromosome ";
			id = "chromosome";
			break;
		case "inPheno":
			label = "Phenotype ";
			id = "phenotype";
			break;
		case "inClinical":
			label = "Clin. Significance ";
			id = "clinicalSignificance";
			break;
		case "inSam":
			label = "Sample";
			id = "sample";
			break;
		}

		var idControl = wiringNameVariableRecibed + Math.floor(Math.random() * (1000 - 2)) + 2;

		//Add to List, an element <li> with the data to be shown on screen
		$("#list").append('<li>' + '<div id="item_' + idControl + '" data-variable="' + id + '" data-id="' + objInfo.key + '">' + '<div class="label">' + label + ' (' + objInfo.label + ')</div>' + '<div class="btnDelete control"><span>Delete</span></div>' + '</div>' + '</li>');

		//Event assignment to Delete Command (inside <li>)
		$("#item_" + idControl + " .btnDelete span").on("click", function() {
			var objEnvio = new Object();
			objEnvio.id = $(this).parent().parent().attr("data-id");
			objEnvio.type = $(this).parent().parent().attr("data-variable");

			logg("noData", "Send to Server then delete:" + JSON.stringify(objEnvio), 259);
			ws.conn.send(JSON.stringify(objEnvio));
			objEnvio = null;

			//Effect: Add class to element to state it will be deleted.
			$(this).parent().parent().parent().addClass("onDeleteLi");
			//Effect: Fade Out the element then it will be deleted.
			$(this).parent().fadeOut("3000", function() {
				$(this).parent().parent().remove();
			});

		});
	}

	/**
	 * Esta funcion es llamada cuando no se encontró datos en el servidor.
	 */
	function noData(msg) {
		logg("noData", msg, 87);
	}

	/**
	 * Otiene el valor del atributo desde preferencias, basado en el nombre del atributo enviado como parámetro.
	 * @atributo Valor del atributo configurado en Preferencias. Si no encuentra el valor, retorna NULL.
	 * @author Carlos iniguez
	 */
	function obtenerAtributoPreferencias(nombreAtributo) {
		var atributo = null;
		if (boolPresentacionWirecloud) {
			atributo = MashupPlatform.prefs.get(nombreAtributo);
		}
		return atributo;
	};

	/**
	 * Get the Identifier Name of Websocket from prefferences (config.xml).
	 * It is neccesary to difference the several websocket connection on the server.
	 */
	function getIdentificadorWebSocket() {
		if (identificadorWebSocket === null) {
			identificadorWebSocket = obtenerAtributoPreferencias("websocketIdentifier");
		}
		return identificadorWebSocket;
	}

	/**
	 * Stablishing the connection with the server through WebSocket.
	 * The connection through WebSocket requires a name of identifier and the url.
	 * @author Carlos iniguez
	 */
	function crearWebSocket() {
		if (getIdentificadorWebSocket() !== null && url !== null) {
			if (ws === null) {
				logg("crearWebSocket", "Connecting through WebSocket with: " + url, 423);
				ws = new MODELO.websocket(url, noData, noData, identificadorWebSocket);
			} else {
				logg("crearWebSocket", "There already is an open websocket", 315);
			}
		} else {
			logg("crearWebSocket", "Websocket no connected!! A websocket url and an identifier is required!", 466);
		}
	}

	/**
	 * Function utilizada para los mensajes de DEBUG ( tipo INFORMACION), en el caso de que se ejecute el Widget en modo "development"
	 * @param nombreFuncion Nombre de la funcion de donde se lanza el mensaje
	 * @param mensaje Texto a mostrar en el mensaje de salida
	 * @param linea Número de Linea de codigo correspondiente donde se ejecuta el mensaje
	 * @author Carlos iniguez
	 */
	function logg(nombreFuncion, mensaje, linea) {
		if (environment === "dev") {
			if (boolPresentacionWirecloud && identificadorWebSocket) {
				MashupPlatform.widget.log("DEBUG: " + identificadorWebSocket + " : " + nombreFuncion + "->" + mensaje + " in line: " + linea, MashupPlatform.log.INFO);
			} else {
				console.log("DEBUG: " + identificadorWebSocket + " : " + nombreFuncion + "->" + mensaje + " in line: " + linea);
			}

		}
	};
	/**
	 * Llamada a la función (init() como inicializador)
	 * NOTE: I have changed "DOMContentLoaded" for "load" beacause I need the whole HTML and resources loaded.
	 */
	document.addEventListener('load', init.bind(this), true);

})();
