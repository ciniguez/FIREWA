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
	var url = "http://localhost:8080/2-ProveedorRest/rest/phenotype?bdd=clinvar";
	// base de datos seleccionada (parametro de entrada)
	var bdd = null;
	// cromosoma (parametro de entrada)
	var pch = null;
	// filtro (parametro de entrada)
	var pfil = null;
	// allelo (parametro de entrada)
	var pal = null;
	// posicion (parametro de entrada)
	var ppos = null;
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "dev";
	//Modulo de Angular.js
	var app = null;
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	var boolCambio = false;
	var contadorLlamadaAsincrona = 0;

	/**
	 * Inicialización de variables
	 */
	function init() {
		//Contador de cargas para minimizar problema de carga de wirecloud.
		contadorLlamadaAsincrona +=1;

		//Obtener los atributos desde preferencias
		url = obtenerAtributoPreferencias('urlServicio');
		bdd = obtenerAtributoPreferencias('bdd');

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

		app = angular.module('moduleTabla', ['ngTouch', 'ui.grid']);
		app.controller('MainCtrl', ['$scope',
		function($scope) {
			if (user_Data === null) {
				user_Data = {
					"entry" : [{
						"codigo" : "0",
						"descripcion" : "NO DATA"
					}]
				};
				boolCambio = true;
			}
			$scope.myData = user_Data.entry;
			$scope.datoCambiado = "";
			//evento para cambio dinamico de datos
			$scope.selectChange = function() {
				$scope.$apply(function() {
					//logg("SelectChange", "entra a SelectChange", 188);
					$scope.myData = user_Data.entry;
				});
			};

		}]);

		/*
		 * Registro lo que ingresa como Preferencia
		 * Si existe un cambio en un parámetro de preferencias, este método se dispara
		 * para obtener el nuevo valor y llama a presentar los datos en el gráfico
		 */
		MashupPlatform.prefs.registerCallback(function(new_values) {
			var boolean_flag = false;
			if ('urlServicio' in new_values) {
				url = obtenerAtributoPreferencias('urlServicio');
				boolean_flag = true;
				parametroCambiado = "url";
			}
			if ('bdd' in new_values) {
				bdd = obtenerAtributoPreferencias('bdd');
				boolean_flag = true;
				parametroCambiado = "bdd";
			}
			if ('environment' in new_values) {
				boolean_flag = true;
				parametroCambiado = "env";
				environment = obtenerAtributoPreferencias('environment');
			}
			//llamo a que se ejecute la obtención de datos desde el servidor
			logg("init", "parametro cambiado: " + parametroCambiado, 111);
			if (boolean_flag) {
				dispararCambio(parametroCambiado);
			}

		});

		logg("obtenerDatos", "Llamada desde init a Obtener Datos: " + contadorLlamadaAsincrona, 127);
		obtenerDatos();
	}

	/**
	 * Recuperar los datos desde el servicio web
	 */
	function obtenerDatos() {
		logg("obtenerDatos", "Llamada Asincrona: " + contadorLlamadaAsincrona, 127);
		if (contadorLlamadaAsincrona==1) {

			//Generar la URL con todos los parametros de consulta
			var urlResultado = generarParametrosEnURL(url);
			logg("obtenerDatos", "trabajando con url: " + urlResultado, 129);

			if (urlResultado !== null) {
				//Realizar la llamada al Servicio Web REST
				MashupPlatform.http.makeRequest(urlResultado, {
					method : 'GET',
					onSuccess : function(response) {
						contadorLlamadaAsincrona=0;
						//Obtener los datos
						user_Data = JSON.parse(response.responseText);

						if (user_Data.error) {
							logg("obtenerDatos", "Error en Procesamiento - final", 139);
							MashupPlatform.widget.log("Error en Procesamiento", MashupPlatform.log.ERROR);
							onError();
						} else {
							presentar_datos();
						}
					},
					onComplete : function() {
						logg("obtenerDatos", "Ingresa a onComplete", 146);
					},
					onException : function() {
						logg("obtenerDatos", "Ingresa a onException", 146);
					},
					onFailure : function() {
						logg("obtenerDatos", "Ingresa a onFailure", 146);
					},
					onError : function() {
						logg("obtenerDatos", "Error en Procesamiento - final", 146);
						MashupPlatform.widget.log("Error en Procesamiento - final", MashupPlatform.log.ERROR);
						onError();
					}
				});
			} else {
				logg("obtenerDatos", "Error: ObtenerDatos->La URL es NULA" + urlResultado, 129);
				MashupPlatform.widget.log("Error: ObtenerDatos->La URL es NULA", MashupPlatform.log.ERROR);
			}
		}
	}

	/**
	 * Swith between the graph options based on the two parameters.
	 */
	function presentar_datos() {
		if (app !== null && boolCambio) {
			logg("presentar_datos", "ingresa a cambio de datos con boolCambio =" + boolCambio, 156);
			//recupero el módulo de angular y cambio un atributo para que se dispare
			//la funcion apply de cambio de datos
			var controllerElement = document.querySelector('[ng-controller=MainCtrl]');
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
			if (bdd === null) {
				throw "El atributo de Base de Datos es nulo !!";
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
			urlResultante = urlResultante.concat("?bdd=" + bdd);

			if (pal != null) {
				urlResultante = urlResultante.concat("&&pal=" + prefAggregate);
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
			MashupPlatform.widget.log("Error: URL no bien formada: " + urlResultante + " error :" + err, MashupPlatform.log.INFO);
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
