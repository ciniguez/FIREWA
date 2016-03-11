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
	var url = "http://server:puerto/appName/getlista?cmp=“campo";
	// atributo 1 para el grafico
	var attr1 = "chr";
	// Variable para saber si el widget se ejecuta en Producción o en Desarrollo.
	var environment = "dev";
	// cadena para almacenar el parametro cambiado
	var parametroCambiado = null;
	var boolCambio = false;

	/**
	 * Inicialización de variables
	 */
	function init() {

		//Obtener los atributos desde preferencias
		url = obtenerAtributoPreferencias('urlServicio');
		attr1 = obtenerAtributoPreferencias('attr1');
		//Variable para saber si se ejecuta en Ambiente de producción o debug
		//(debug muestra los mensajes de código)
		environment = obtenerAtributoPreferencias('environment');

		//------------------------ HANDLERS PARA DETECTAR CAMBIOS EN PREFERENCIAS ----------
		//----------------------------------------------------------------------------------
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

		//----------------------------------------------------------------------------------
		//--------------------------- CARGA DE DATOS  --------------------------------------
		//----------------------------------------------------------------------------------

		//------------ !!!!! QUITAR CUANDO HAYA SERVIDOR -----------------------------------
		url = null;
		//----------------------------------------------------------------------------------

		//--------------------------- CARGA DE DATOS  --------------------------------------
		//----------------------------------------------------------------------------------

		obtenerDatos();
		logg("init", "entra en init", 82);
		boolCambio= true;
	}

	/**
	 * Enviar los datos al servidor
	 */
	function enviarDatosAlServidor(datosJSON) {

		//Generar la URL con todos los parametros de consulta
		var urlResultado = generarParametrosEnURL(url);
		logg("obtenerDatos", "trabajando con url: " + urlResultado, 129);

		if (urlResultado !== null) {
			//Realizar la llamada al Servicio Web REST
			MashupPlatform.http.makeRequest(urlResultado, {
				method : 'POST',
				postBody : datosJSON,
				contentType : "application/json",
				onSuccess : function(response) {
					logg("enviarDatosAlServidor", "Envio al Servidor con Exito", 114);
				},
				onError : function() {
					MashupPlatform.widget.log("Error en Envio a Server", MashupPlatform.log.ERROR);
					onError();
				}
			});
		} else {
			MashupPlatform.widget.log("Error: ObtenerDatos->La URL es NULA", MashupPlatform.log.ERROR);
		}
	}

	/**
	 * Recuperar los datos desde el servicio web
	 */
	function obtenerDatos() {

		//Generar la URL con todos los parametros de consulta
		//TODO Cambiar cuando haya servidor
		//var urlResultado = generarParametrosEnURL(url);
		var urlResultado = null;
		//FIN CAMBIO

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
						presentar_datos(user_Data);
					}
				},
				onError : function() {
					MashupPlatform.widget.log("Error en Procesamiento - final", MashupPlatform.log.ERROR);
					onError();
				}
			});
		} else {
			//MashupPlatform.widget.log("Error: ObtenerDatos->La URL es NULA", MashupPlatform.log.ERROR);
			//TODO eliminar cuando haya servidor
			var data = [];
			data.push({
				"id" : 1,
				"description" : "Sample 1"
			});
			data.push({
				"id" : 2,
				"description" : "Sample 2"
			});
			data.push({
				"id" : 3,
				"description" : "Sample 3"
			});
			presentar_datos(data);
			// FIN TODO
		}
	}

	/**
	 * Swith between the graph options based on the two parameters.
	 */
	function presentar_datos(data) {

		
		if (boolCambio) {
			logg("presentar_datos", data, 173);
			//Borro todo item de lista. Dejar limpia la lista
			$('#selectable').empty();
			//Por cada item en los datos se agrega un item de lista
			for (var i = 0; i < data.length; i++) {
				$("#selectable").append('<li id="item_' + data[i].id + '" class="ui-widget-content">' + data[i].description + '</li>');
			}
			var arrayItemsSeleccionados = [];
			//Pongo el comportamiento
			$("#selectable").selectable({
				stop : function() {
					arrayItemsSeleccionados.length=0;
					$(".ui-selected", this).each(function() {
						var index = $("#selectable li").index(this);
						arrayItemsSeleccionados.push($(this).attr("id").split("_")[1]);
					});
					logg("presentar_datos", "Wiring: " + JSON.stringify(arrayItemsSeleccionados), 163);
					//wiring the chromosome number
					MashupPlatform.wiring.pushEvent('outputItem', JSON.stringify(arrayItemsSeleccionados));
					//Envio los datos al servidor
					//enviarDatosAlServidor(JSON.stringify(arrayItemsSeleccionados));
				}
			});
			boolCambio = false;
		}

	}

	/**
	 * Llama a OntenerDatos(). Funciona como un punto de encuentro común y seteo de variable.
	 */
	function dispararCambio(cadena) {
		logg("dispararCambio", "Obteniendo datos concadena :" + cadena, 179);
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

			//Si attr1 es nulo, se comunica al usuario la
			//falta de parametros fundamentales (attr1)
			if (attr1 === null) {
				throw "El atributo 1 es nulo !!";
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

			//Se agrega a la URL el parametro
			urlResultante = urlResultante.concat("?cmp=" + attr1);
			return urlResultante;

		} catch(err) {

			MashupPlatform.widget.log(err, MashupPlatform.log.ERROR);
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
