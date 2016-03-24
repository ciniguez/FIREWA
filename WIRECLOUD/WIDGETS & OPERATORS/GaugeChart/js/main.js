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
 */
(function() {

	/**
	 * Variables globales de la función
	 */
	"use strict";
	// url de servicio web consultada
	var url = "";
	// atributo 1 para el grafico. Por default se tomará "chr"
	// puede tomar los siguientes valores:chr, referenceAllele", altAlleles, quality, filter, format
	var domain = "";
	//Indicador para ejecucion en Wirecloud o fuera de wirecloud
	var boolPresentacionWirecloud = false;
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "";
	//Variable WebSocket
	var ws;

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Obtener los atributos desde preferencias
		if (boolPresentacionWirecloud) {
			url = obtenerAtributoPreferencias('urlServicio');
			domain = obtenerAtributoPreferencias('attr1');
			//Variable para saber si se ejecuta en Ambiente de producción o debug
			//(debug muestra los mensajes de código)
			environment = obtenerAtributoPreferencias('environment');
		} else {
			url = obtenerAtributoPreferencias('undefined');
			domain = obtenerAtributoPreferencias('undefined');
			//Variable para saber si se ejecuta en Ambiente de producción o debug
			//(debug muestra los mensajes de código)
			environment = obtenerAtributoPreferencias('undefined');

			url = "ws://localhost:8080/WebSockets/websocket/chat";
			domain = "chr";
			environment = "dev";
		}

		//REGISTRO DE WIRING
		if (boolPresentacionWirecloud) {
			/* Add register to wiring the Cromosome input value*/
			MashupPlatform.wiring.registerCallback("inputDominio", handlerSlotDomine.bind(this));
		}

		//----------------------------------------------------------------------------------
		//--------------------------- CONEXION WEB SOCKET ----------------------------------
		//----------------------------------------------------------------------------------

		logg("init", "Conectando a WebSocket con: " + url, 95);
		ws = new MODELO.websocket(url, presentar_datos, noData, "gauge1");

		//----------------------------------------------------------------------------------
		//--------------------------- CONFIGURACION DE GRAFICO----------------------------------
		//----------------------------------------------------------------------------------

		var gauge = c3.generate({
			bindto : "#gauge",
			data : {
				columns : [['data', 91.4]],
				type : 'gauge',
				/*
				 onclick : function(d, i) {
				 console.log("onclick", d, i);
				 },
				 */
				onmouseover : function(d, i) {
					//console.log("onmouseover", d, i);
				},
				onmouseout : function(d, i) {
					//console.log("onmouseout", d, i);
				}
			},
			gauge : {
				//        label: {
				//            format: function(value, ratio) {
				//                return value;
				//            },
				//            show: false // to turn off the min/max labels.
				//        },
				//    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
				//    max: 100, // 100 is default
				units : ' %'
				//    width: 39 // for adjusting arc thickness
			},
			color : {
				pattern : ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
				threshold : {
					//            unit: 'value', // percentage is default
					//            max: 200, // 100 is default
					values : [30, 60, 90, 100]
				}
			},
			size : {
				height : 90
			}
		});

		setTimeout(function() {
			gauge.load({
				columns : [['data', 100]]
			});
		}, 5000);

		/*
		 * Registro lo que ingresa como Preferencia
		 * Si existe un cambio en un parámetro de preferencias, este método se dispara
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
					domain = obtenerAtributoPreferencias('attr1');
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

	function noData(msg) {
		$("#msg").empty();
		$("#msg").append("<p>Faults!</br>App says: <span>" + msg + "</span></p>");
		$("#msg").fadeOut(5000);
	}

	/**
	 * Llamada al Websocket por demanda.
	 */
	function dispararCambio(cadena) {
		logg("dispararCambio", "Obteniendo datos concadena :" + cadena, 179);
		MODELO.websocket.conn.send(cadena);
	}

	/**
	 * Swith between the graph options based on the two parameters.
	 */
	function presentar_datos(data) {
		if (data === null || !( data instanceof Array)) {
			//Cargo el Gauge con la nueva data
			data = {
				columns : [['data', data.valor]]
			};
		}

		gauge.load(data);
	}

	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 */
	var handlerSlotDomine = function handlerDomine(itemString) {
		domain = itemString;
		dispararCambio(itemString);
	};
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
