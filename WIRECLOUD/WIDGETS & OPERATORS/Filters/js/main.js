/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

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
	var boolPresentacionWirecloud = false;
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
		//Obtener los atributos desde preferencias
		if (boolPresentacionWirecloud) {
			url = obtenerAtributoPreferencias('urlServicio');
			environment = obtenerAtributoPreferencias('environment');
			identificadorWebSocket = obtenerAtributoPreferencias('websocketIdentifier');
			flagWorkspace = obtenerAtributoPreferencias('flagWorkspace');
		} else {
			url = obtenerAtributoPreferencias('undefined');
			environment = obtenerAtributoPreferencias('undefined');
			identificadorWebSocket = obtenerAtributoPreferencias('undentified');

			//url = "ws://localhost:8080/WebSockets/websocket/chat";
			url = "ws://158.42.185.198:8080/graphws2";
			environment = "dev";
			identificadorWebSocket = "reset";
			//Crear WebSocket
			crearWebSocket();
			logg("init", "iniciando en Local", 173);
		}

		//----------------------------------------------------------------------------------
		//------------------------ HANDLERS PARA DETECTAR CAMBIOS EN PREFERENCIAS ----------
		//----------------------------------------------------------------------------------
		/*
		 * Registro lo que ingresa como Preferencia
		 * Si existe un cambio en un parámetro de preferencias, el método se dispara
		 * para obtener el nuevo valor y llama a presentar los datos en el gráfico
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
				if ('flagWorkspace' in new_values) {
					parametroCambiado = "flagWorkspace";
					flagWorkspace = obtenerAtributoPreferencias('flagWorkspace');
					if (flagWorkspace === "wirecloud") {
						boolPresentacionWirecloud = true;

						url = obtenerAtributoPreferencias('urlServicio');
						environment = obtenerAtributoPreferencias('environment');
						crearWebSocket();
					}
					logg("init", "Configuracion:" + flagWorkspace, 173);
				}

				//llamo a que se ejecute la obtención de datos desde el servidor
				logg("init", "parametro cambiado: " + parametroCambiado, 111);
				dispararCambio(parametroCambiado);

			});
		}

		if (boolPresentacionWirecloud) {
			//REGISTRO DE WIRING
			/* Add register to wiring the Cromosome input value*/
			MashupPlatform.wiring.registerCallback("inputChr", handlerSlot);
			/* Add register to wiring the Phenotype input value*/
			MashupPlatform.wiring.registerCallback("inputPheno", handlerSlot);
			/* Add register to wiring the Clinical Significance input value*/
			MashupPlatform.wiring.registerCallback("inputClinical", handlerSlot);
		}
	}

	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 * @author Carlos iniguez
	 */
	var handlerSlot = function handlerSlot(itemString) {
		var valorRecibido = null;
		switch(itemString) {
		case "inChr":
			valorRecibido = itemString;
			break;
		case "inPheno":
			valorRecibido = itemString;
			break;
		case "inClinical":
			valorRecibido = itemString;
			break;
		}
		if (itemString !== "" || itemString !== null) {
			presentar_datos(itemString, valorRecibido);
		} else {
			logg("handlerSlot", "No existe emparejamiento con la preferencia solicitada", 357);
		}
	};
	function presentar_datos(wiringNameVariableRecibed, valueRecibed) {
		logg("init", "ingresa a function de presentacion de datos con datos", 90);
		var label = "";
		var id = "all";

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
			label = "Cln. Significance ";
			id = "clinicalSignificance";
			break;
		}
		$("#filterList").append('<li><div id="' + id + '" class="fondoGradado filtro"><div class="item">' + label + '</div><div class="item"><span class="valorFiltro">' + valueRecibed + '</span></div><div class="item"><div class="btnRemove"></div></div></div></li>');
		$("#" + id + " .btnRemove").on("click", function() {
			$("#" + id).fadeOut("3000", function() {
				var datoEnvio = $(this).attr('id');
				logg("Envio Datos", JSON.stringify(datoEnvio), 150);
				ws.send(JSON.stringify(datoEnvio));
				$(this).parent().remove();

			});

		});
	}

	/**
	 * Esta funcion es llamada cuando no se encontró datos en el servidor.
	 */
	function noData(msg) {
		logg("noData", msg, 87);

		//$('#selectable').empty();
		//$("#selectable").append('<li id="item_' + 0 + '" class="ui-widget-content">NO DATA</li>');
	}

	/**
	 * Esta funcion es llamada cuando no se encontró datos en el servidor.
	 */
	function recepcionServer(msg) {
		logg("noData", msg, 87);

		//$('#selectable').empty();
		//$("#selectable").append('<li id="item_' + 0 + '" class="ui-widget-content">NO DATA</li>');
	}

	/**
	 * Otiene el valor del atributo desde preferencias, basado en el nombre del atributo enviado como parámetro.
	 * @atributo Valor del atributo configurado en Preferencias. Si no encuentra el valor, retorna NULL.
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
	 * Establece la conexión con el servidord a traves de WebSocket
	 * @author Carlos iniguez
	 */
	function crearWebSocket() {
		logg("crearWebSocket", "Conectando a WebSocket con: " + url, 432);
		//Para la conexion con WebSocket se requiere el nombre identificador del widget para enviarlo al servidor.
		if (identificadorWebSocket !== null && url !== null && ws == null) {
			ws = new MODELO.websocket(url, recepcionServer, noData, identificadorWebSocket);
		} else {
			logg("init", "Se requiere configurar el identificador de Websocket o su URL", 103);
			noData("You must set the websocket url or identifier!");
		}
	}

	/**
	 * Function utilizada para los mensajes de DEBUG ( tipo INFORMACION), en el caso de que se ejecute el Widget en modo "development"
	 * @param nombreFuncion Nombre de la funcion de donde se lanza el mensaje
	 * @param mensaje Texto a mostrar en el mensaje de salida
	 * @param linea Número de Linea de codigo correspondiente donde se ejecuta el mensaje
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
	 */
	document.addEventListener('load', init.bind(this), true);

})();
