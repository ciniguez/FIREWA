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
	var url = "http://localhost:8080/2-ProveedorRest/rest/vcf/graph";
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

		logg("presentar_datos", "Registro de Modulo Angular", 165);

		//----------------------------------------------------------------------------------
		//--------------------------- OBJETOS GRAFICOS--------------------------------------
		//----------------------------------------------------------------------------------
		var PieChart = {
			type : 'pieChart',
			height : 400,
			x : function(d) {
				return d.name;
			},
			y : function(d) {
				return d.valor;
			},
			showLabels : true,
			duration : 500,
			labelThreshold : 0.01,
			labelSunbeamLayout : true,
			legend : {
				margin : {
					top : 5,
					right : 35,
					bottom : 5,
					left : 0
				}
			},
			//chart events
			pie : {
				dispatch : {
					elementClick : function(e) {
						logg("PieChartEvents", "enviando outputCromosome", 230);
						//wiring the chromosome number
						MashupPlatform.wiring.pushEvent('outputCromosome', e.data.name);
					}
				}
			}
		};

		var discreteChart = {
			type : 'discreteBarChart',
			height : 400,
			margin : {
				top : 20,
				right : 20,
				bottom : 50,
				left : 55
			},
			x : function(d) {
				return d.name;
			},
			y : function(d) {
				return d.valor;
			},
			showLabels : true,
			valueFormat : function(d) {
				return d3.format(',.4f')(d);
			},
			duration : 500,
			xAxis : {
				axisLabel : 'X Axis'
			},
			yAxis : {
				axisLabel : 'Y Axis',
				axisLabelDistance : -10
			}

		};

		//----------------------------------------------------------------------------------
		//---------------------------ANGULAR JS --------------------------------------------
		//----------------------------------------------------------------------------------
		app = angular.module('myApp', ['nvd3']);
		app.controller('myCtrl', function($scope) {

			logg("presentar_datos", "presentar_datos: tipoGrafico = " + typeGraph, 163);
			if (typeGraph === "pieChart") {
				$scope.options = {
					chart : PieChart
				};
			}
			if (typeGraph == "discreteBarChart") {
				//Necesario realizar este formateo de datos debido a que la librería acepta el tipo de formato indicado
				//como un array con un objeto, el objeto tiene dos atributos: el primero key con el nombre del gráfico
				//y values con los datos a graficar.
				var user_data = [{
					key : 'titulo Grafico',
					values : user_Data.data
				}];
				user_Data = user_data;
				$scope.options = {
					chart : discreteChart
				};
			}
			//pongo los datos
			if (user_Data === null) {
				user_Data = {
					"data" : [{
						"name" : "NO DATA",
						"valor" : "0"
					}]
				};
				boolCambio = true;
			}
			$scope.data = user_Data.data;
			//Para cuando hace el change
			$scope.datoCambiado = "";
			//cambio la data y el tipo de grafico
			$scope.selectChange = function() {
				$scope.$apply(function() {
					logg("SelectChange", "entra a SelectChange", 188);
					if (typeGraph === "pieChart") {
						$scope.options.chart = PieChart;
						$scope.data = user_Data.data;
					}
					if (typeGraph === "discreteBarChart") {
						$scope.options.chart = discreteChart;
						var datos = [{
							key : 'titulo Grafico',
							values : user_Data.data
						}];
						$scope.data = datos;
					}
				});
			};

		});

		obtenerDatos();

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
			MashupPlatform.widget.log("Error: ObtenerDatos->La URL es NULA", MashupPlatform.log.ERROR);
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
		obtenerDatos();
	}

	/**
	 * Genera la URL de consulta conlos parametros
	 * @param urlSinFormato URL para agregar parámetros.
	 * @return url URL completa y formateada o NULO si existe problemas en generación
	 */
	function generarParametrosEnURL(urlSinFormato) {
		var urlResultante = null;
		try {

			if (urlSinFormato === 'undefined' || urlSinFormato === null) {
				throw "La URL proporcionada es NULA o UNDEFINED";
			}

			//Si attr1 y attr2 son nulos, se comunicar a usuario la
			//falta de parametros fundamentales (attr1 y attr2)
			if (attr1 === null || attr1 === null) {
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
	document.addEventListener('load', init.bind(this), true);

})();
