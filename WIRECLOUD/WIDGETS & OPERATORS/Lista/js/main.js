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
 * Controlador de Widget Lista
 * OBJETIVO: Presentar una lista de items provenientes de la consulta por WebSockets a un servidor indicado.
 * La selección de uno o varios items produce el envío de la información hacia Servidor a través del WebSocket previamente conectado.
 *
 */
(function() {

	/**
	 * Variables globales de la función
	 */
	"use strict";
	// url de servicio web consultada
	var url = null;
	// atributo 1 para el grafico
	var attr1 = null;
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
			if ('attr1' in new_values) {
				attr1 = obtenerAtributoPreferencias('attr1');
				parametroCambiado = "attr1";
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
	}

	function getIdentificadorWebSocket() {
		var identificador = null;
		if (attr1 !== null) {
			identificador = attr1 + "VsVariant";
		}
		logg("getIdentificadorWebSocket", identificador, 180);
		return identificador;
	}

	function settingToLocal() {
		//Ocultar mensaje de desconexion
		$("#no-data").show();
		//TODO: Aqui poner algo en pantalla indicando que se requiere configurar y quitar todo lo que esta aqui abacjo
		logg("init", "Configurando como local.", 94);
		//local settings only by testing
		environment = "dev";
		attr1 = "sample";
		identificadorWebSocket = getIdentificadorWebSocket();
	}

	function settingToWirecloud() {
		//Ocultar mensaje de desconexion
		$("#no-data").hide();

		logg("init", "Configurando como Wirecloud.", 105);
		url = obtenerAtributoPreferencias('urlServicio');
		attr1 = obtenerAtributoPreferencias('attr1');
		environment = obtenerAtributoPreferencias('environment');
		identificadorWebSocket = getIdentificadorWebSocket();

		crearWebSocket();

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
	 * Present UI on screen
	 * @param data Datos para llenar en pantalla. La estructura de la
	 * data debe ser igual a la indicada en la documentación de requerimientos.
	 */
	function presentarDatos(data) {
		//logg("presentar_datos", data, 173);
		data = transformarDatos(data);
		//Borro todo item de lista. Dejar limpia la lista
		$('#list').empty();
		//Por cada item en los datos se agrega un item de lista
		for (var i = 0; i < data.length; i++) {
			//logg("presentar_datos", "datos enviados: " + data[i], 107);
			$("#list").append('<li>' + '<div id="item_' + data[i].id + '" data-id="' + data[i].id + '">' + '<div class="label">' + data[i].name + ' -- ' + data[i].size + '</div>' + '<div class="control">' + '<input class="chk" type="checkbox" checked value="' + data[i].id + '">' + '</div></div>' + '</li>');
		}

		$('.chk').on("change", function() {

			if ($(this).is(":checked")) {
				$(this).parent().parent().parent().addClass("selectedLi");
				//arrayItemsSeleccionados.push($(this).attr("value"));

				var obj = new Object();
				obj.id = $(this).attr("value");
				obj.check = 1;

				logg("presentar_datos", "Data Enviada:" + JSON.stringify(obj), 176);
				ws.conn.send(JSON.stringify(obj));

				if (boolPresentacionWirecloud) {
					logg("presentar_datos", "Envio via Wiring:" + JSON.stringify(obj), 179);
					MashupPlatform.wiring.pushEvent('outputItem', obj.id);
				}

			} else {

				$(this).parent().parent().parent().removeClass("selectedLi");

				var obj = new Object();
				obj.id = $(this).attr("value");
				obj.check = 0;

				logg("presentar_datos", "Data Enviada:" + JSON.stringify(obj), 176);
				ws.conn.send(JSON.stringify(obj));

				if (boolPresentacionWirecloud) {
					logg("presentar_datos", "Envio via Wiring:" + JSON.stringify(obj), 179);
					MashupPlatform.wiring.pushEvent('outputItem', JSON.stringify(obj.id));
				}

			}
		});
	}

/**
	 * Establece la conexión con el servidord a traves de WebSocket
	 * @author Carlos iniguez
	 */
	function crearWebSocket() {

		//Para la conexion con WebSocket se requiere el nombre identificador del widget para enviarlo al servidor.
		if (getIdentificadorWebSocket() !== null && url !== null) {
			if (ws === null) {
				logg("crearWebSocket", "Conectando a WebSocket con: " + url, 423);
				ws = new MODELO.websocket(url, presentarDatos, noData, identificadorWebSocket);
			} else {
				logg("crearWebSocket", "Ya existe un WebSocket Abierto", 315);
			}
		} else {
			logg("crearWebSocket", "You must set the websocket url or identifier!", 466);
			presentarDatos(null);
		}
	}


	/**
	 * Transforma los datos recibidos por el servidor a formato de datos solicitados por el widge.
	 * @param {Object} datos Datos del servidor.
	 */
	function transformarDatos(json) {
		if (json === null || json === 'undefined') {
			json = [{
				"id" : 1,
				"name" : "No data",
				"size" : 12
			}, {
				"id" : 2,
				"name" : "No data",
				"size" : 24
			}];

		}
		return json;
	}

	/**
	 * Llamada al Websocket por demanda.
	 * @author Carlos iniguez
	 */
	function dispararCambio(cadena) {
		if (cadena === "flagWorkspace") {
			if (flagWorkspace !== "wirecloud") {
				settingToLocal();
			} else {
				settingToWirecloud();
			}
		}
		if (cadena === "attr1") {
			identificadorWebSocket = getIdentificadorWebSocket();
			if (ws) {
				//reconexion enviando nuevo nombre
				ws.conn.send(identificadorWebSocket);
			} else {
				crearWebSocket();
			}
		}

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
