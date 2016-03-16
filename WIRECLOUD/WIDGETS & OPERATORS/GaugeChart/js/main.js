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
	var url = "http://localhost:8080/2-ProveedorRest/rest/variacion/cromosoma?chr=1";
	// atributo 1 para el grafico. Por default se tomará "chr"
	// puede tomar los siguientes valores:chr, referenceAllele", altAlleles, quality, filter, format
	var domain = "chr";

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Obtener los atributos desde preferencias
		//url = obtenerAtributoPreferencias('urlServicio');
		//domain = obtenerAtributoPreferencias('attr1');
		//Variable para saber si se ejecuta en Ambiente de producción o debug
		//(debug muestra los mensajes de código)
		//environment = obtenerAtributoPreferencias('environment');

		//REGISTRO DE WIRING
		/* Add register to wiring the Cromosome input value*/
		//MashupPlatform.wiring.registerCallback("inputDominio", handlerSlotDomine.bind(this));

		//logg("presentar_datos", "Registro de Modulo Angular", 165);

		var gauge = c3.generate({
			bindto : "#gauge",
			data : {
				columns : [['data', 91.4]],
				type : 'gauge'
				/*,
				 onclick : function(d, i) {
				 console.log("onclick", d, i);
				 },
				 onmouseover : function(d, i) {
				 console.log("onmouseover", d, i);
				 },
				 onmouseout : function(d, i) {
				 console.log("onmouseout", d, i);
				 }*/
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
				//    units: ' %',
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
				columns : [['data', 10]]
			});
		}, 1000);

		setTimeout(function() {
			gauge.load({
				columns : [['data', 50]]
			});
		}, 2000);

		setTimeout(function() {
			gauge.load({
				columns : [['data', 70]]
			});
		}, 3000);

		setTimeout(function() {
			gauge.load({
				columns : [['data', 0]]
			});
		}, 4000);

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
		/*
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
			obtenerDatos();

		});
		*/

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
					var user_Data = JSON.parse(response.responseText);

					if (user_Data.error) {
						MashupPlatform.widget.log("Error en Procesamiento", MashupPlatform.log.ERROR);
						onError();
					} else {
						//Presentar los Datos en el Gráfico
						presentar_datos(user_Data);
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
	function presentar_datos(data) {
		//Cargo el Gauge con la nueva data
		var datos = {
			columns : [['data', data.valor]]
		};
		gauge.load(datos);
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

			//Si attr1 y attr2 son nulos, se comunica al usuario la
			//falta de parametros fundamentales (attr1 y attr2)
			if (domain === null) {
				throw "El dominio es nulo !!";
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

			if (domain != null) {
				urlResultante = urlResultante.concat("?var="+domain+"&&value="+3);
			}

			return urlResultante;

		} catch(err) {

			MashupPlatform.widget.log("Error: URL no bien formada: " + urlResultante, MashupPlatform.log.INFO);
			return urlResultante;
		}
	};
	/**
	 * Obtener datos enviados al Widget
	 * @param {Object} itemString
	 */
	var handlerSlotDomine = function handlerDomine(itemString) {
		domain = itemString;
		obtenerDatos();
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
