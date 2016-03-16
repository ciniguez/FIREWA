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
	//data a obtener desde un servicio web
	var user_Data = null;
	// url de servicio web consultada
	var url = null;
	//var url = "http://localhost:8080/2-ProveedorRest/rest/vcf/graph?at1=chr&&agg=COUNT&&at2=idVariant_Called";
	// atributo 1 para el grafico
	var attr1 = "chr";
	// atributo 2 para el grafico
	var attr2 = "chr";
	// tipo de gráfico
	var typeGraph = "pieChart";
	// funcion de agregacion
	var prefAggregate = "COUNT";
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
	var environment = "dev";
	//Modulo de Angular.js
	var app = null;
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	var boolCambio = false;

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Obtener los atributos desde preferencias
		url = obtenerAtributoPreferencias('urlServicio');
		typeGraph = obtenerAtributoPreferencias('typeGraph');
		attr1 = obtenerAtributoPreferencias('attr1');
		attr2 = obtenerAtributoPreferencias('attr2');
		prefAggregate = obtenerAtributoPreferencias('aggregate');
		//Variable para saber si se ejecuta en Ambiente de producción o debug
		//(debug muestra los mensajes de código)
		environment = obtenerAtributoPreferencias('environment');

		//REGISTRO DE WIRING
		/* Add register to wiring the Cromosome input value*/
		MashupPlatform.wiring.registerCallback("inputChromosome", handlerSlotChromosome.bind(this));
		/* Add register to wiring the Filter input value*/
		MashupPlatform.wiring.registerCallback("inputFilter", handlerSlotFilter.bind(this));
		/* Add register to wiring the Allele value */
		MashupPlatform.wiring.registerCallback("inputAllele", handlerSlotAllele.bind(this));
		/* Add register to wiring the Position value */
		MashupPlatform.wiring.registerCallback("inputPos", handlerSlotPosition.bind(this));

		//----------------------------------------------------------------------------------
		//--------------------------- OBJETOS GRAFICOS--------------------------------------
		//----------------------------------------------------------------------------------

		logg("presentar_datos", "Registro de Modulo Angular", 165);

		//----------------------------------------------------------------------------------
		//--------------------------- GRAFICOS NVD3--------------------------------------------
		//----------------------------------------------------------------------------------

		obtenerDatos1();

		/*
		 * Registro lo que ingresa como Preferencia
		 * Si existe un cambio en un parámetro de preferencias, este método se dispara
		 * para obtener el nuevo valor y llama a presentar los datos en el gráfico
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

	function obtenerDatos1() {
		logg("init", "Tipo grafico: " + typeGraph, 130);

		if (typeGraph === "discreteBarChart") {

			nv.addGraph(function() {
				$('.bar-chart svg').empty();
				var historicalBarChart = [{
					key : 'Cumulative Return',
					values : [{
						'label' : 'A Label',
						'value' : -29.765957771107,
						'color' : '#00b19d'
					}, {
						'label' : 'B Label',
						'value' : 50,
						'color' : '#ef5350'
					}, {
						'label' : 'C Label',
						'value' : 32.807804682612,
						'color' : '#3DDCF7'
					}, {
						'label' : 'D Label',
						'value' : 196.45946739256,
						'color' : '#ffaa00'
					}, {
						'label' : 'E Label',
						'value' : 15.79434030906893,
						'color' : '#81c868'
					}, {
						'label' : 'F Label',
						'value' : -98.079782601442,
						'color' : '#dcdcdc'
					}, {
						'label' : 'G Label',
						'value' : -13.925743130903,
						'color' : '#333333'
					}, {
						'label' : 'H Label',
						'value' : -5.1387322875705,
						'color' : '#3bafda'
					}]
				}];
				var barChart = nv.models.discreteBarChart().x(function(d) {
					return d.label;
				}).y(function(d) {
					return d.value;
				}).staggerLabels(true).tooltips(false).showValues(true).duration(250);
				barChart.yAxis.axisLabel('Price change in USD');
				d3.select('.bar-chart svg').datum(historicalBarChart).call(barChart);
				nv.utils.windowResize(barChart.update);
				return barChart;
			});
		}
		if (typeGraph === "pieChart") {

			//Regular pie chart example
			nv.addGraph(function() {
				$('.bar-chart svg').empty();
				var chart = nv.models.pieChart().x(function(d) {
					return d.label;
				}).y(function(d) {
					return d.value;
				}).showLabels(true);

				d3.select('.bar-chart svg').datum(exampleData).transition().duration(1200).call(chart);

				return chart;
			});
		}
	}

	/**
	 * Recuperar los datos desde el servicio web
	 */
	function obtenerDatos() {

		//Generar la URL con todos los parametros de consulta
		var urlResultado = generarParametrosEnURL(url);
		logg("obtenerDatos", "trabajando con url: " + urlResultado, 129);

		if (urlResultado !== null) {
			//Realizar la llamada al Servicio Web REST
			MashupPlatform.http.makeRequest(urlResultado, {
				method : 'GET',
				onSuccess : function(response) {
					//Obtener los datos
					user_Data = JSON.parse(response.responseText);

					if (user_Data.error) {
						MashupPlatform.widget.log("Error en Procesamiento", MashupPlatform.log.ERROR);
						onError();
					} else {
						//Presentar los Datos en el Gráfico
						presentar_datos();
					}
				},
				onError : function() {
					MashupPlatform.widget.log("Error en Procesamiento - final", MashupPlatform.log.ERROR);
					onError();
				}
			});
		} else {
			user_Data = dataShowCase;
			MashupPlatform.widget.log("Error: ObtenerDatos->La URL es NULA. Se trabajará con datos de prueba locales", MashupPlatform.log.ERROR);
			presentar_datos();

		}
	}

	/**
	 * Swith between the graph options based on the two parameters.
	 */
	function presentar_datos() {
		if (app !== null && boolCambio) {
			//recupero el módulo de angular y cambio un atributo para que se dispare
			//la funcion apply de cambio de datos
			var controllerElement = document.querySelector('[ng-controller=myCtrl]');
			var controllerScope = angular.element(controllerElement).scope();
			controllerScope.datoCambiado = parametroCambiado;
			controllerScope.selectChange();
			boolCambio = false;
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
	function dispararCambio(cadena) {
		logg("dispararCambio", "Obteniendo datos concadena :" + cadena, 311);
		boolCambio = true;
		obtenerDatos1();
	}

	/**
	 * Genera la URL de consulta conlos parametros
	 * @param urlSinFormato URL para agregar parámetros.
	 * @return url URL completa y formateada o NULO si existe problemas en generación
	 */
	function generarParametrosEnURL(urlSinFormato) {
		var urlResultante = null;
		try {

			if (urlSinFormato === 'undefined' || urlSinFormato === null || urlSinFormato.length == 0) {
				urlSinFormato = null;
				throw "La URL proporcionada es NULA o UNDEFINED";
			}

			//Si attr1 y attr2 son nulos, se comunicar a usuario la
			//falta de parametros fundamentales (attr1 y attr2)
			if (attr1 === null || attr2 === null) {
				throw "Los atributos 1 y 2 son nulos !!";
			}

			//Si la URL está mal formada, es arreglada dejándola en estado fundamental
			// (sin parámetros, tomándo en cuenta el signo ?)
			if (urlSinFormato.indexOf("?") != -1) {
				var splitUrl = urlSinFormato.split("?");
				// esta es la cadena limpia sin ?
				urlResultante = splitUrl[0];
			} else {
				urlResultante = urlSinFormato;
			}

			//Por cada uno de los parametros diferente de nulo, se agrega a la URL
			urlResultante = urlResultante.concat("?at1=" + attr1 + "&&at2=" + attr2);

			if (prefAggregate != null) {
				urlResultante = urlResultante.concat("&&agg=" + prefAggregate);
			}
			if (pch != null) {
				urlResultante = urlResultante.concat("&&pch=" + pch);
			}
			if (pfil != null) {
				urlResultante = urlResultante.concat("&&pfil=" + pfil);
			}
			if (ppos != null) {
				urlResultante = urlResultante.concat("&&ppos=" + ppos);
			}
			return urlResultante;

		} catch(err) {

			MashupPlatform.widget.log("Error: URL no bien formada: " + urlResultante, MashupPlatform.log.INFO);
			return urlResultante;
		}
	};
	/**
	 * Otiene el valor del atributo desde preferencias, basado en el nombre del atributo enviado como parámetro.
	 * @atributo Valor del atributo configurado en Preferencias. Si no encuentra el valor, retorna NULL.
	 */
	function obtenerAtributoPreferencias(nombreAtributo) {
		var atributo = MashupPlatform.prefs.get(nombreAtributo);
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
			MashupPlatform.widget.log("DEBUG: " + nombreFuncion + "->" + mensaje + " in line: " + linea, MashupPlatform.log.INFO);
		}
	};
	/**
	 * Llamada a la función (init() como inicializador)
	 * NOTE: I have changed "DOMContentLoaded" for "load" beacause I need the whole HTML and resources loaded.
	 */

	//Pie chart example data. Note how there is only a single array of key-value pairs.
	function exampleData() {
		return [{
			"label" : "One",
			"value" : 29.765957771107,
			"color" : "#00b19d"
		}, {
			"label" : "Two",
			"value" : 60,
			'color' : '#ef5350'
		}, {
			"label" : "Three",
			"value" : 39.69895,
			'color' : '#3ddcf7'
		}, {
			"label" : "Four",
			"value" : 160.45946739256,
			'color' : '#ffaa00'
		}, {
			"label" : "Five",
			"value" : 89.02525,
			'color' : '#81c868'
		}, {
			"label" : "Six",
			"value" : 98.079782601442,
			'color' : '#dcdcdc'
		}, {
			"label" : "Seven",
			"value" : 98.925743130903,
			'color' : '#3bafda'
		}];
	}


	document.addEventListener('load', init.bind(this), true);

})();

