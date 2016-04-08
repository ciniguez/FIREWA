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
	if (MODELO.websocket.singleInstance.conn) {
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
	// atributo 1 para el grafico
	var attr1 = null;
	// atributo 2 para el grafico
	var attr2 = null;
	// tipo de gráfico
	var typeGraph = null;
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "";
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	//Indicador para ejecucion en Wirecloud o fuera de wirecloud
	var boolPresentacionWirecloud = true;
	//Variable WebSocket
	var ws = null;
	//Nombre identificador del websocket para conexion al servidor
	var identificadorWebSocket = null;
	//Bandera para especificar bajo que ambiente se trabaja
	var flagWorkspace = null;

	/**
	 * Inicialización de variables
	 * @author Carlos iniguez
	 */
	function init() {

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
			if ('typeGraph' in new_values) {
				typeGraph = obtenerAtributoPreferencias('typeGraph');
				parametroCambiado = "tipoGrafico";
			}
			if ('attr1' in new_values) {
				attr1 = obtenerAtributoPreferencias('attr1');
				parametroCambiado = "attr1";
			}
			if ('attr2' in new_values) {
				parametroCambiado = "attr2";
				attr2 = obtenerAtributoPreferencias('attr2');
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
				crearWebSocket();
			} else {
				settingToLocal();
			}
			
		} else {
			logg("init", "Se requiere URL para iniciar. Configure y Reinicie el Widget!!.", 82);
		}
	}

	function settingToLocal() {
		//TODO: Aqui poner algo en pantalla indicando que se requiere configurar y quitar todo lo que esta aqui abacjo
		logg("init", "Configurando como local.", 94);
		//local settings only by testing
		//typeGraph = "pieChart";
		typeGraph = "discreteBarChart";
		environment = "dev";
		attr1 = "chromosome";
		attr2 = "Variant";
		identificadorWebSocket = getIdentificadorWebSocket();
	}

	function settingToWirecloud() {
		logg("init", "Configurando como Wirecloud.", 105);
		url = obtenerAtributoPreferencias('urlServicio');
		typeGraph = obtenerAtributoPreferencias('typeGraph');
		attr1 = obtenerAtributoPreferencias('attr1');
		attr2 = obtenerAtributoPreferencias('attr2');
		identificadorWebSocket = getIdentificadorWebSocket();
		//Variable para saber si se ejecuta en Ambiente de producción o debug
		//(debug muestra los mensajes de código)
		environment = obtenerAtributoPreferencias('environment');
		

	}

	function getIdentificadorWebSocket() {
		var identificador = null;
		if (attr1 !== null && attr2 !== null) {
			identificador = attr1 + "Vs" + attr2;
		}
		logg("getIdentificadorWebSocket", identificador, 180);
		return identificador;
	}

	/**
	 * Presenta mensajes en la parte inferior del grafico (utilizada para feedback al usuario)
	 * @author Carlos iniguez
	 */
	function noData(msg) {
		//$("#msg").empty();
		//$("#msg").append("<p>Faults!</br>App says: <span>" + msg + "</span></p>");
		//$("#msg").fadeOut(5000);
		logg("noData", "Gendomus says: " + msg, 191);
	}

	/**
	 * Presenta los datos en los graficos estadisticos
	 * @param data Objeto Javascript.
	 * @author Carlos iniguez
	 */
	function presentarDatos(data) {
		logg("init", "Tipo grafico: " + typeGraph, 147);
		$(".chart svg").empty();

		var chart = null;
		if (data != null) {
			data = JSON.stringify(data);
		}
		if (typeGraph === null) {
			throw "Graph type no selected!!";
		}
		if (typeGraph === "pieChart") {
			chart = pieChart(data);
		}
		if (typeGraph === "discreteBarChart") {
			chart = discreteBarChart(data);
		}
		nv.addGraph(chart);

	}

	/**
	 * Return a Pie Chart with data given
	 * @param data Objeto JSON con los datos a presentar
	 * @author Carlos iniguez
	 */
	function pieChart(data) {
		logg("pieChart", "Ingreso a PieChart", 217);
		if (data === null) {
			//Default data
			var data = [{
				"label" : "One",
				"value" : 29.765957771107
			}, {
				"label" : "Two",
				"value" : 0
			}, {
				"label" : "Three",
				"value" : 32.807804682612
			}, {
				"label" : "Four",
				"value" : 196.45946739256
			}];

			logg("pieChart", "No hay datos. Seteando Default data", 233);
		} else {
			data = JSON.parse(transformadorDataPieChar(data));
			logg("pieChart", "Datos nulos obtenidos en Servidor, ...iniciando con datos por defecto!", 236);
		}

		$(".chart svg").empty();

		var chart = null;

		chart = nv.models.pieChart().x(function(d) {
			return d.label;
		}).y(function(d) {
			return d.value;
		}).showLabels(true)//Display pie labels
		.labelThreshold(.05)//Configure the minimum slice size for labels to show up
		.labelType("percent")//Configure what type of data to show in the label. Can be "key", "value" or "percent"
		.donut(true)//Turn on Donut mode. Makes pie chart look tasty!
		.donutRatio(0.35)//Configure how big you want the donut hole size to be.
		;

		d3.select(".chart svg").datum(data).transition().duration(350).call(chart);
		nv.utils.windowResize(chart.update);

		chart.pie.dispatch.on("elementClick", function(e) {
			var obj = [e.index.toString()];
			logg("init", "transformacion obj: " + JSON.stringify(obj), 163);
			//Envio datos por wiring
			if (boolPresentacionWirecloud) {
				//wiring the chromosome number
				MashupPlatform.wiring.pushEvent('outputVar', JSON.stringify(obj));
			}
			if (ws) {
				ws.conn.send(JSON.stringify(obj));
			}

		});
		return chart;

	}

	/**
	 * Return a Discrte Bar Chart with data given
	 * @param data Objeto JSON con los datos a presentar
	 * @author Carlos iniguez
	 */
	function discreteBarChart(data) {
		if (data === null) {
			//default data
			data = [{
				key : "Cumulative Return",
				values : [{
					"label" : "A Label",
					"value" : -29.765957771107
				}, {
					"label" : "B Label",
					"value" : 0
				}, {
					"label" : "C Label",
					"value" : 32.807804682612
				}]
			}];
		} else {
			data = JSON.parse(transformadorDataDiscreteBarChar(data));
		}

		$('.chart svg').empty();

		var chart = nv.models.discreteBarChart().x(function(d) {
			return d.label;
		}).y(function(d) {
			return d.value;
		}).staggerLabels(false).showValues(true).duration(250);

		chart.yAxis.axisLabel('Price change in USD');
		chart.tooltip.enabled();

		d3.select('.chart svg').datum(data).call(chart);
		nv.utils.windowResize(chart.update);

		chart.discretebar.dispatch.on("elementClick", function(e) {
			logg("init", "pulsacion bar char: " + e, 163);
			var obj = [e.index.toString()];
			logg("init", "transformacion obj: " + obj, 163);

			//Envio datos por wiring
			if (boolPresentacionWirecloud) {
				//wiring the chromosome number
				MashupPlatform.wiring.pushEvent('outputVar', e.index.toString());
			}
			if (ws) {
				ws.conn.send(JSON.stringify(obj));
			}

		});
		return chart;

	}

	/**
	 * Transforma los datos recibidos por el servidor a datos que entiende el gráfico de Torta.
	 * @param {Object} datos Datos del servidor.
	 * @author Carlos iniguez
	 */
	function transformadorDataPieChar(datos) {
		var bandera = false;
		var json;

		var valuesToDataGrafico = Array();

		try {
			if ( typeof datos === "undefined") {
				throw "Tipo de datos enviados por Servidor son undefined!";
			}

			json = JSON.parse(datos);
			if (json !== null) {
				//preparar json en formato que absorve el gráfico
				for (var i = 0; i < json.length; i++) {
					var v = new Object();
					v.label = json[i].id;
					v.value = json[i].size;
					//v.color = '#00b19d';
					valuesToDataGrafico.push(v);
				}

				//convertir el objeto Javascript a una expresión JSON
				json = JSON.stringify(valuesToDataGrafico);
			}

			return json;

		} catch(error) {
			console.log(error);
			return null;
		}

	}

	/**
	 * Transforma los datos recibidos por el servidor a datos que entiende el gráfico de Barras.
	 * @param {Object} datos Datos del servidor.
	 * @author Carlos iniguez
	 */
	function transformadorDataDiscreteBarChar(datos) {
		var bandera = false;
		var json;

		var arrayContendor = new Array();
		var objDataGrafico = new Object();
		var valuesToDataGrafico = Array();

		try {
			if ( typeof datos === "undefined") {
				throw "Tipo de datos enviados por Servidor son undefined!";
			}

			json = JSON.parse(datos);
			logg("transformadorData", "Numero de datos :" + json.length, 382);
			//preparar json en formato que absorve el gráfico
			for (var i = 0; i < json.length; i++) {
				var v = new Object();
				v.label = json[i].id;
				v.value = json[i].size;
				v.color = dame_color_aleatorio();

				valuesToDataGrafico.push(v);
			}
			//Agrego las propiedades key y values del objeto total
			objDataGrafico.key = 'Cumulative Return';
			objDataGrafico.values = valuesToDataGrafico;
			//Agregar el objeto total al array raiz
			arrayContendor.push(objDataGrafico);

			//convertir el resultado en cadena de texto
			json = JSON.stringify(arrayContendor);

			return json;

		} catch(error) {
			logg("transformadorData", "error :" + error, 405);
			return null;
		}
	}

	/**
	 * Establece la conexión con el servidord a traves de WebSocket
	 * @author Carlos iniguez
	 */
	function crearWebSocket() {

		//Para la conexion con WebSocket se requiere el nombre identificador del widget para enviarlo al servidor.
		if (identificadorWebSocket !== null && url !== null) {
			logg("crearWebSocket", "Conectando a WebSocket con: " + url, 423);
			ws = new MODELO.websocket(url, presentarDatos, noData, identificadorWebSocket);
		} else {
			logg("crearWebSocket", "You must set the websocket url or identifier!", 466);
			presentarDatos(null);
		}
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
		if (cadena === "attr1" || cadena === "attr2") {
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

	function dame_color_aleatorio() {
		var hexadecimal = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
		var color_aleatorio = "#";
		var posarray;
		for (var i = 0; i < 6; i++) {
			posarray = aleatorio(0, hexadecimal.length);
			color_aleatorio += hexadecimal[posarray];
		}
		return color_aleatorio;
	}

	function aleatorio(inferior, superior) {
		var numPosibilidades = superior - inferior;
		var aleat = Math.random() * numPosibilidades;
		aleat = Math.floor(aleat);
		return parseInt(inferior) + aleat;
	};

	/**
	 * Llamada a la función (init() como inicializador)
	 * NOTE: I have changed "DOMContentLoaded" for "load" beacause I need the whole HTML and resources loaded.
	 * @author Carlos iniguez
	 */
	document.addEventListener('load', init.bind(this), true);

})();

