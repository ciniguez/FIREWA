/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

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
			if ('flagWorkspace' in new_values) {
				parametroCambiado = "flagWorkspace";
				flagWorkspace = obtenerAtributoPreferencias('flagWorkspace');
				if (flagWorkspace !== "wirecloud") {
					boolPresentacionWirecloud = false;
				}
			}

			//llamo a que se ejecute la obtención de datos desde el servidor
			logg("init", "parametro cambiado: " + parametroCambiado, 111);
			dispararCambio(parametroCambiado);

		});
		//_---------------------------------------
		if (url !== null) {
			//Tomamos los valores desde preferencias config.xml
			flagWorkspace = obtenerAtributoPreferencias('flagWorkspace');
			if (flagWorkspace === "wirecloud") {
				boolPresentacionWirecloud = true;
				settingToWirecloud();
			} else {
				settingToLocal();
			}
		} else {
			logg("init", "Se requiere URL para iniciar. Configure y Reinicie el Widget!!.", 82);
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
				if ('websocketIdentifier' in new_values) {
					parametroCambiado = "identificadorWebSocket";
					identificadorWebSocket = obtenerAtributoPreferencias('websocketIdentifier');
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

	}

	function settingToLocal() {
		//Ocultar mensaje de desconexion
		$("#no-data").show();
		//TODO: Aqui poner algo en pantalla indicando que se requiere configurar y quitar todo lo que esta aqui abacjo
		logg("init", "Configurando como local.", 94);
		//local settings only by testing
		environment = "dev";
	}

	function settingToWirecloud() {
		//Ocultar mensaje de desconexion
		$("#no-data").hide();

		logg("init", "Configurando como Wirecloud.", 105);
		url = obtenerAtributoPreferencias('urlServicio');
		environment = obtenerAtributoPreferencias('environment');
		identificadorWebSocket = getIdentificadorWebSocket();

		logg("init", "iniciando en Wirecloud", 42);
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

	function presentarDatos(wiringNameVariableRecibed, valueRecibed) {
		logg("init", "ingresa a function de presentacion", 90);
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
		case "inSam":
			label = "Sample";
			id = "sample";
			break;
		}

		var idControl = wiringNameVariableRecibed + valueRecibed;
		$("#list").append('<li>' + '<div id="item_' + idControl + '" data-id="' + valueRecibed + '">' + '<div class="label">' + label + '</div>' + '<div class="btnDelete control"><a href="#">Delete</a></div>' + '</div>' + '</li>');

		//Asignacion de evento
		$("#item_" + idControl + " .btnDelete a").on("click", function() {
			var id = $(this).parent().parent().attr("data-id");
			logg("noData", "Enviado al Servidor y Borrado de :" + id, 259);
			ws.send(JSON.stringify(id));

			$(this).parent().parent().parent().addClass("onDeleteLi");
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
		$('#list').empty();
		$("#list").append('<li id="item_' + 0 + '" class="ui-widget-content">NO DATA</li>');
	}

	/**
	 * Esta funcion es llamada cuando no se encontró datos en el servidor.
	 */
	function recepcionServer(msg) {
		logg("recepcionServer", msg, 251);
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

	function getIdentificadorWebSocket() {
		identificadorWebSocket = getIdentificadorWebSocket();
		return identificadorWebSocket;
	}

	/**
	 * Establece la conexión con el servidord a traves de WebSocket
	 * @author Carlos iniguez
	 */
	function crearWebSocket() {

		//Para la conexion con WebSocket se requiere el nombre identificador del widget para enviarlo al servidor.
		if (getIdentificadorWebSocket() !== null && url !== null) {
			if (ws !== null) {
				ws.conn.close();
				ws = null;
				logg("crearWebSocket", "There already is a connection alive!. I will close it and start a newer", 466);
			} else {
				logg("crearWebSocket", "Conectando a WebSocket con: " + url, 423);
				ws = new MODELO.websocket(url, presentarDatos, noData, identificadorWebSocket);
			}
		} else {
			logg("crearWebSocket", "You must set the websocket url or identifier!", 466);
			presentarDatos(null);
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
