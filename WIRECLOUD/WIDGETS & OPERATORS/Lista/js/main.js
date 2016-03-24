/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

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
	var url = "";
	// atributo 1 para el grafico
	var attr1 = "chr";
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "dev";
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	var boolPresentacionWirecloud = false;
	//variable para el WebSocket
	var ws;

	/**
	 * Inicialización de variables
	 */
	function init() {
		//Ocultar el mensaje de errores al iniciar el widget.
		$("#msg").hide();
		//Obtener los atributos desde preferencias
		if (boolPresentacionWirecloud) {
			url = obtenerAtributoPreferencias('urlServicio');
			attr1 = obtenerAtributoPreferencias('attr1');
			environment = obtenerAtributoPreferencias('environment');
			url = "ws://localhost:8080/WebSockets/websocket/chat";
		} else {
			url = obtenerAtributoPreferencias('undefined');
			attr1 = obtenerAtributoPreferencias('undefined');
			environment = obtenerAtributoPreferencias('undefined');

			url = "ws://localhost:8080/WebSockets/websocket/chat";
			environment = "dev";
		}

		//Inicio el WebSocket con la funcion callback, encargada de llenar los datos en pantalla.
		ws = new MODELO.websocket(url, presentar_datos, noData,"SamplevsVariant");

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
				if ('attr1' in new_values) {
					attr1 = obtenerAtributoPreferencias('attr1');
					parametroCambiado = "attr1";
				}
				if ('environment' in new_values) {
					parametroCambiado = "env";
					environment = obtenerAtributoPreferencias('environment');
				}
				//llamo a que se ejecute la obtención de datos desde el servidor
				logg("init", "parametro cambiado: " + parametroCambiado, 111);
				dispararCambio(parametroCambiado);

			});
		}

	}

	/**
	 * Esta funcion es llamada cuando no se encontró datos en el servidor.
	 */
	function noData(msg) {
		$("#msg").empty();
		$("#msg").append("<p>" + msg + "</p>");
		$("#msg").show();

		$('#selectable').empty();
		$("#selectable").append('<li id="item_' + 0 + '" class="ui-widget-content">NO DATA</li>');
	}

	/**
	 * Present UI on screen
	 * @param data Datos para llenar en pantalla. La estructura de la
	 * data debe ser igual a la indicada en la documentación de requerimientos.
	 */
	function presentar_datos(data) {
		logg("presentar_datos", data, 173);
		//Borro todo item de lista. Dejar limpia la lista
		$('#selectable').empty();
		//Por cada item en los datos se agrega un item de lista
		for (var i = 0; i < data.length; i++) {
			logg("presentar_datos", "datos enviados: " + data[i], 107);
			$("#selectable").append('<li id="item_' + data[i].id + '" class="ui-widget-content">' + data[i].description + ' -- ' + data[i].size + '</li>');
		}

		//Comportamiento al hacer click en uno o varios de los items.
		var arrayItemsSeleccionados = [];
		$("#selectable").selectable({
			stop : function() {
				arrayItemsSeleccionados.length = 0;
				$(".ui-selected", this).each(function() {
					var index = $("#selectable li").index(this);
					arrayItemsSeleccionados.push($(this).attr("id").split("_")[1]);
				});
				logg("presentar_datos", "datos enviados: " + JSON.stringify(arrayItemsSeleccionados), 107);
				//Envío de datos al Servidor mediante WebSocket y por Wiring
				logg("presentar_datos", "datos enviados: " + JSON.stringify(arrayItemsSeleccionados), 107);
				ws.conn.send(JSON.stringify(arrayItemsSeleccionados));
				MashupPlatform.wiring.pushEvent('outputItem', JSON.stringify(arrayItemsSeleccionados));
			}
		});

	}

	/**
	 * Llama a OntenerDatos(). Funciona como un punto de encuentro común y seteo de variable.
	 */
	function dispararCambio(cadena) {
		logg("dispararCambio", "Obteniendo datos concadena :" + cadena, 179);
		MODELO.websocket.conn.send(cadena);
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
