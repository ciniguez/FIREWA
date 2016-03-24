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
	var url = null;
	// atributo 1 para el grafico
	var attr1 = "";
	// atributo 2 para el grafico
	var attr2 = "";
	// tipo de gráfico
	var typeGraph = "";
	// funcion de agregacion
	var prefAggregate = "";
	// cromosoma (parametro de entrada)
	var pch = null;
	// filtro (parametro de entrada)
	var pfil = null;
	// allelo (parametro de entrada)
	var pal = null;
	// posicion (parametro de entrada)
	var ppos = null;
	//Alelo (parametro de entrada)
	var inAllele = null;
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "";
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	//Indicador para ejecucion en Wirecloud o fuera de wirecloud
	var boolPresentacionWirecloud = false;
	//Variable WebSocket
	var ws;

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Obtener los atributos desde preferencias
		if (boolPresentacionWirecloud) {
			url = obtenerAtributoPreferencias('urlServicio');
			typeGraph = obtenerAtributoPreferencias('typeGraph');
			attr1 = obtenerAtributoPreferencias('attr1');
			attr2 = obtenerAtributoPreferencias('attr2');
			prefAggregate = obtenerAtributoPreferencias('aggregate');
			//Variable para saber si se ejecuta en Ambiente de producción o debug
			//(debug muestra los mensajes de código)
			environment = obtenerAtributoPreferencias('environment');
		} else {
			url = obtenerAtributoPreferencias('undefined');
			typeGraph = obtenerAtributoPreferencias('undefined');
			attr1 = obtenerAtributoPreferencias('undefined');
			attr2 = obtenerAtributoPreferencias('undefined');
			prefAggregate = obtenerAtributoPreferencias('undefined');
			//Variable para saber si se ejecuta en Ambiente de producción o debug
			//(debug muestra los mensajes de código)
			environment = obtenerAtributoPreferencias('undefined');

			url = "ws://localhost:8080/WebSockets/websocket/chat";
			typeGraph = "pieChart";
			environment = "dev";
		}

		//REGISTRO DE WIRING
		if (boolPresentacionWirecloud) {
			/* Add register to wiring the Cromosome input value*/
			MashupPlatform.wiring.registerCallback("inputChromosome", handlerSlotChromosome.bind(this));
			/* Add register to wiring the Filter input value*/
			MashupPlatform.wiring.registerCallback("inputFilter", handlerSlotFilter.bind(this));
			/* Add register to wiring the Allele value */
			MashupPlatform.wiring.registerCallback("inputAllele", handlerSlotAllele.bind(this));
			/* Add register to wiring the Position value */
			MashupPlatform.wiring.registerCallback("inputPos", handlerSlotPosition.bind(this));
		}

		//----------------------------------------------------------------------------------
		//--------------------------- CONEXION WEB SOCKET --------------------------------------
		//----------------------------------------------------------------------------------

		logg("init", "Conectando a WebSocket con: " + url, 95);
		ws = new MODELO.websocket(url, presentarDatos, noData, "ChromosomevsVariant");
		//----------------------------------------------------------------------------------

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
				if ('aggregate' in new_values) {
					parametroCambiado = "attr2";
					prefAggregate = obtenerAtributoPreferencias('aggregate');
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

	function presentarDatos(data) {

		$(".chart svg").empty();
		logg("init", "Tipo grafico: " + typeGraph, 147);
		var chart;
		try {
			if (typeGraph === null) {
				throw "Graph type nos selected!!";
			}
			if (typeGraph === "pieChart") {
				chart = pieChart(data);
			}
			if (typeGraph === "discreteBarChart") {
				chart = discreteBarChart(data);
			}
			nv.addGraph(chart);
		} catch(error) {
			noData(error);
		}
	}

	/**
	 * Return a Pie Chart with data given
	 */
	function pieChart(data) {
		if (data === null || !( data instanceof Array)) {
			//Default data
			data = [{
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
		}
		logg("init", "Data pieChart" + data, 187);

		$(".chart svg").empty();

		var chart = nv.models.pieChart().x(function(d) {
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
			logg("init", "pulsacion pieChar: " + e, 207);
			var obj = [e.index.toString()];
			logg("init", "transformacion obj: " + obj, 163);
			ws.conn.send(JSON.stringify(obj));
		});

		return chart;

	}

	/**
	 * Return a Discrte Bar Chart with data given
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
		}).staggerLabels(false).tooltips(false).showValues(true).duration(250);

		chart.yAxis.axisLabel('Price change in USD');

		d3.select('.chart svg').datum(data).call(chart);
		nv.utils.windowResize(chart.update);
		chart.discretebar.dispatch.on("elementClick", function(e) {
			logg("init", "pulsacion bar char: " + e, 163);
			var obj = [e.index.toString()];
			logg("init", "transformacion obj: " + obj, 163);
			ws.conn.send(JSON.stringify(obj));
		});
		return chart;

	}

	/**
	 * Transforma los datos recibidos por el servidor a datos que entiende el gráfico de Barras.
	 * @param {Object} datos Datos del servidor.
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
			console.log(datos);
			json = JSON.parse(datos);

			//preparar json en formato que absorve el gráfico
			for (var i = 0; i < json.length; i++) {
				var v = new Object();
				v.label = json[i].chromosomeId;
				v.value = json[i].sizeCalledVariations;
				v.color = '#00b19d';
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
			console.log(error);
			return null;
		}

	}

	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 */
	var handlerSlotChromosome = function handlerSlotChromosome(itemString) {
		pch = itemString;
		dispararCambio(itemString);
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 */
	var handlerSlotFilter = function handlerSlotFilter(itemString) {
		pfil = itemString;
		dispararCambio(itemString);
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 */
	var handlerSlotPosition = function handlerSlotPosition(itemString) {
		ppos = itemString;
		dispararCambio(itemString);
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 */
	var handlerSlotAllele = function handlerSlotAllele(itemString) {
		pal = itemString;
		dispararCambio(itemString);
	};
	/**
	 * Llamada al Websocket por demanda.
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

