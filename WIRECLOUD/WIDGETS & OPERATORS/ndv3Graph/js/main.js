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
	//Variable WebSocket
	var ws;

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Obtener los atributos desde preferencias
		//TODO: Quitar Comentario
		/*
		url = obtenerAtributoPreferencias('urlServicio');
		typeGraph = obtenerAtributoPreferencias('typeGraph');
		attr1 = obtenerAtributoPreferencias('attr1');
		attr2 = obtenerAtributoPreferencias('attr2');
		prefAggregate = obtenerAtributoPreferencias('aggregate');

		//Variable para saber si se ejecuta en Ambiente de producción o debug
		//(debug muestra los mensajes de código)
		environment = obtenerAtributoPreferencias('environment');
		*/

		//REGISTRO DE WIRING
		/* Add register to wiring the Cromosome input value*/
		//MashupPlatform.wiring.registerCallback("inputChromosome", handlerSlotChromosome.bind(this));
		/* Add register to wiring the Filter input value*/
		//MashupPlatform.wiring.registerCallback("inputFilter", handlerSlotFilter.bind(this));
		/* Add register to wiring the Allele value */
		//MashupPlatform.wiring.registerCallback("inputAllele", handlerSlotAllele.bind(this));
		/* Add register to wiring the Position value */
		//MashupPlatform.wiring.registerCallback("inputPos", handlerSlotPosition.bind(this));

		//----------------------------------------------------------------------------------
		//--------------------------- OBJETOS GRAFICOS--------------------------------------
		//----------------------------------------------------------------------------------

		//logg("presentar_datos", "Registro de Modulo Angular", 165);

		//----------------------------------------------------------------------------------
		//--------------------------- GRAFICOS NVD3--------------------------------------------
		//----------------------------------------------------------------------------------

		ws = new MODELO.websocket(obtenerDatos,noData);

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
		 */

	}

	function noData(msg) {
		$("#msg").empty();
		$("#msg").append("<p>NO DATA SENT</p><p>Have been set DEFAULT DATA</p><p>Server Data obtained==>"+msg+"</p>");
	}

	function obtenerDatos(data) {

		//logg("init", "Tipo grafico: " + typeGraph, 130);

		nv.addGraph(function() {
			$('.bar-chart svg').empty();

			var barChart = nv.models.discreteBarChart().x(function(d) {
				return d.label;
			}).y(function(d) {
				return d.value;
			}).staggerLabels(true).tooltips(false).showValues(true).duration(250);

			barChart.yAxis.axisLabel('Price change in USD');

			d3.select('.bar-chart svg').datum(data).call(barChart);
			nv.utils.windowResize(barChart.update);
			barChart.discretebar.dispatch.on("elementClick", function(e) {
				console.log(e);
				var obj = [e.index.toString()];
				console.log(obj);
				ws.conn.send(JSON.stringify(obj));
			});
			return barChart;
		});
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

