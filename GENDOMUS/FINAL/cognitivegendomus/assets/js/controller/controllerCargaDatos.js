/**
 * Controlador de la pagina Carga Datos
 * @author Carlos Iniguez 2016
 */

var DatosSesion = (function() {
	var instance;
	function createInstance() {
		var object = new Object();
		object.arraySamplesSeleccionados = new Array();
		object.arrayDataSourcesSeleccionados = new Array();
		return object;
	}

	return {
		getInstance : function() {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};

})();
function CtrlCargaDatos(urlAnalisisWebService, urlWebServiceDataSource, urlAnalisisSendData, urlDatasourceSendData) {
	var that = this;
	//Variable necesaria para saber si se pulso un boton select all
	that.boolSelectAll = false;

	//Efecto acordion
	$('div.acordion').accordion({
		header : "h2",
		heightStyle : "content",
		active : false,
		navigation : true,
		collapsible : true
	});

	//Conecto el Websocket
	var instanciaModelo = new Modelo.Webskt(init);

	//Obtengo variables
	Modelo.Datasource.urlGet = urlWebServiceDataSource;
	Modelo.Sample.urlSend = urlAnalisisSendData;
	Modelo.Sample.urlGet = urlAnalisisWebService;
	Modelo.Datasource.urlSend = urlDatasourceSendData;
	//Refresco el efecto Acordion.
	$('div.acordion').accordion("refresh");

	//Cargar datos del proyecto
	$('#lblNombreProyecto').text("Proyecto Manhatan");
	$('#lblDescripcion').text("Lorem Ipsum es simplemente el texto de relleno de " + "las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar " + "de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) " + "desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. " + "No sólo sobrevivió 500 años");

	/**
	 * Accion Clic para cualquier boton del tipo "Select All/Deselect All"  de contenedor
	 * AnalisisList-container (webComponent).
	 * Se cambia el chek de cada elemento dentro del grupo al que hace referencia "Select All/Deselect All"
	 * Se envia los elementos seleccionados al servidor para que ejecutar creacion, eliminacion o actualizacion.
	 */
	$('#AnalisisList-container .btnSelectAll').click(function() {
		that.boolSelectAll = true;
		banderaON = false;

		if ($(this).text() == "Select All") {
			$(this).text("Deselect All");
			$("#" + $(this).parent().attr("id") + " .btnToogle").bootstrapToggle('on');
			banderaON = true;
		} else {
			$(this).text("Select All");
			$("#" + $(this).parent().attr("id") + " .btnToogle").bootstrapToggle('off');
		}
		//Obtengo los ids de  Samples
		that.arraySamplesSeleccionados.length = 0;
		$("#AnalisisList-container .btnToogle").each(function(index) {
			if (banderaON) {
				//Lo agrego
				that.arraySamplesSeleccionados.push({
					"id" : $(this).attr("id").split("_")[1],
					"name" : $(this).closest('.gdm-item-list').find(".titulo").text()
				});
			}

		});

		that.boolSelectAll = false;
	});
	/**
	 * Accion Clic para cualquier boton del tipo "Select All/Deselect All"  de contenedor
	 * DatasourcesList-container (webComponent).
	 * Se cambia el chek de cada elemento dentro del grupo al que hace referencia "Select All/Deselect All"
	 * Se envia los elementos seleccionados al servidor para que ejecutar creacion, eliminacion o actualizacion.
	 */
	$('#DatasourcesList-container .btnSelectAll').click(function() {
		that.boolSelectAll = true;
		banderaON = false;
		if ($(this).text() == "Select All") {
			$(this).text("Deselect All");
			$("#DatasourcesList-container .btnToogle").bootstrapToggle('on');
			banderaON = true;

		} else {
			$(this).text("Select All");
			$("#DatasourcesList-container .btnToogle").bootstrapToggle('off');
		}
		//Obtengo los ids de  DataSources
		that.arrayDataSourcesSeleccionados.length = 0;
		$("#DatasourcesList-container .btnToogle").each(function(index) {
			that.arrayDataSourcesSeleccionados.push($(this).attr("id").split("_")[1]);
		});
		that.boolSelectAll = false;
	});

	$('#btnEnviar').click(function() {
		//Obtener El objeto Sesion para acceder a los arrays de selecciones
		var lista = DatosSesion.getInstance();

		//Armar el Objeto: {"dnaStudies":[id1,id2,id3], "databases":[databaseId1, databaseId2, etc..]}
		var dnaStudiesVector = [];
		for (var i = 0; i < lista.arraySamplesSeleccionados.length; i++) {
			dnaStudiesVector[i] = lista.arraySamplesSeleccionados[i].id;
		}
		var dnaDatasourcesVector = [];
		for (var i = 0; i < lista.arrayDataSourcesSeleccionados.length; i++) {
			dnaDatasourcesVector[i] = lista.arrayDataSourcesSeleccionados[i].id;
		}

		var objEnvio = new Object();
		objEnvio.samples = dnaStudiesVector;
		objEnvio.databases = dnaDatasourcesVector;

		//Envio al Servidor. Nota: Se podría utilziar Modelo.Datasource.send(objEnvio, true)
		//Esta fue una modificación de última hora que no respeta la arquitectura que se ha
		//propuesto (cada objeto tiene sus operaciones particulares)
		Modelo.Sample.send(JSON.stringify(objEnvio), true);

	});

}

function init(data) {
	cargarListaAnalisisDatos(data.dnaList);
	cargarListaDataSourcesDatos(data.dataList);
}

/**
 * Por cada Analisis indicado en la lista de Analisis, se agrega un h2 con los datos del analisis.
 * Requiere respetar los nombres de los tags de html.
 * @param listaAnalisis Lista de analisis (formato sugerido desde servidor)
 */
function cargarListaAnalisisDatos(listaAnalisis) {

	for (var i = 0; i < listaAnalisis.length; i++) {
		var analisis = listaAnalisis[i];
		var samplesList = listaAnalisis[i].samples;
		if ( typeof samplesList != "undefined") {
			$("#idScript1").append('<h2><div  class="accordion-seccion"><span class="titulo">' + analisis.name + '</span><span class="gdm-cantidad">' + samplesList.length + ' samples</span></div></h2>');
			if (samplesList.length > 0) {
				$("#idScript1").append("<div id=analisis_" + analisis.id + "></div>");
				$("#idScript1 #analisis_" + analisis.id).append('<span class="btnSelectAll"><a href="#">Select All</a></span>');
				$("#idScript1 #analisis_" + analisis.id).append('<ul id="gmd-list-samples"></ul>');

				for (var s = 0; s < samplesList.length; s++) {
					var sample = samplesList[s];
					var html = '<li><div class="gdm-item-list"><span class="titulo">' + sample.name + '</span><span class="gdm-cantidad"><input id="btnSample_' + sample.id + '" class="btnToogle" data-toggle="toggle" type="checkbox"></span></div></li>';
					$('#idScript1 #analisis_' + analisis.id + ' ul').append(html);
					//Asignar el tipo de boton bootstrap al nuevo boton. Si no se hace esto se visualiza un checkbox!!
					$('#btnSample_' + sample.id).bootstrapToggle();

					/**
					 *Asignacion de acciones de boton.
					 */

					$('#btnSample_' + sample.id).on("change", function() {
						var datosSesion = DatosSesion.getInstance();

						if ($(this).prop('checked')) {
							//si está en lista lo dejo, si no lo está, lo pongo
							var bandera = false;

							for (var h = 0; h < datosSesion.arraySamplesSeleccionados.length; h++) {
								if (datosSesion.arraySamplesSeleccionados[h].id === $(this).attr("id").split("_")[1]) {
									bandera = true;
									return;
								}
							}
							if (bandera === false) {
								datosSesion.arraySamplesSeleccionados.push({
									"id" : $(this).attr("id").split("_")[1],
									"name" : $(this).closest('.gdm-item-list').find(".titulo").text()
								});
							}

						} else {
							//si está en lista lo quito, si no lo está, lo dejo
							for (var h = 0; h < datosSesion.arraySamplesSeleccionados.length; h++) {
								if (datosSesion.arraySamplesSeleccionados[h].id === $(this).attr("id").split("_")[1]) {
									datosSesion.arraySamplesSeleccionados.splice(h, 1);
									return;
								}
							}
						}
					});
				}
			}
		}
	}
}

/**
 * Por cada DataSource indicado en la lista de DataSources, se agrega un h2 con los datos del datasource.
 * Requiere respetar los nombres de los tags de html.
 * @param listaDataSources Lista de datasources (formato sugerido desde servidor)
 */
function cargarListaDataSourcesDatos(listaDataSources) {
	if (listaDataSources.length < 0) {
		//Boton select All
		$('#DatasourcesList-container .btnSelectAll').hide();
	}

	//Por cada elemento, se creará un "li" que contendra la informacion del datasource
	for (var i = 0; i < listaDataSources.length; i++) {

		//crear un <li>
		$("#DatasourcesList-container ul").append('<li id="ds_' + listaDataSources[i].id + '"></li>');
		// dentro de <li> crear <div>
		$("#ds_" + listaDataSources[i].id).append('<div class="gdm-item-list"></div>');
		//dentro de <div> crear dos <span>
		$("#ds_" + listaDataSources[i].id + "  div").append('<span class="titulo">' + listaDataSources[i].name + '</span>');
		$("#ds_" + listaDataSources[i].id + "  div").append('<span class="gdm-cantidad"><input id="btnSrc_' + listaDataSources[i].id + '" class="btnToogle" data-toggle="toggle" type="checkbox"></span>');

		//Asignacion de clases de estilos
		$("#ds_" + listaDataSources[i].id + " div").addClass("gdm-item-list");
		//Asignar el estipo de boton bootstrap al nuevo boton. Si no se hace esto se visualiza un checkbox!!
		$('#btnSrc_' + listaDataSources[i].id).bootstrapToggle();
		/**
		 *Asignacion de acciones de boton.
		 */
		$('#btnSrc_' + listaDataSources[i].id).on("change", function() {
			var datosSesion = DatosSesion.getInstance();
			if ($(this).prop('checked')) {
				//si está en lista lo dejo, si no lo está, lo pongo
				var bandera = false;
				for (var h = 0; h < datosSesion.arrayDataSourcesSeleccionados.length; h++) {
					if (datosSesion.arrayDataSourcesSeleccionados[h].id === $(this).attr("id").split("_")[1]) {
						bandera = true;
						return;
					}
				}
				if (bandera === false) {
					datosSesion.arrayDataSourcesSeleccionados.push({
						"id" : $(this).attr("id").split("_")[1],
						"name" : $(this).closest('.gdm-item-list').find(".titulo").text()
					});
				}

			} else {
				//si está en lista lo quito
				//si no lo está, lo dejo
				for (var h = 0; h < datosSesion.arrayDataSourcesSeleccionados.length; h++) {
					if (datosSesion.arrayDataSourcesSeleccionados[h].id === $(this).attr("id").split("_")[1]) {
						datosSesion.arrayDataSourcesSeleccionados.splice(h, 1);
						return;
					}
				}
			}

		});

	}

}

var Modelo = {
	Mode : "WEBSOCKET", //other option is WEBSERVICE,
	WebSocketIdentifier : "firstScreen",
	urlWebSocket : "ws://localhost:8080/gembiosoft/gembiosoft",
	//urlWebSocket : "wss://158.42.185.198:8443/graphws2",
	/**
	 * Conexion a WebSoket
	 * @author: Alberto.
	 */
	Webskt : function(callBackFunction) {
		if (Modelo.Webskt.singleInstance) {
			Modelo.Webskt.singleInstance.functionCallBack = callBackFunction;
			return Modelo.Webskt.singleInstance;
		}
		var that = this;
		Modelo.Webskt.singleInstance = that;
		that.functionCallBack = callBackFunction;

		console.log("conectando con :" + Modelo.urlWebSocket);
		that.conn = new WebSocket(Modelo.urlWebSocket);
		that.conn.onopen = function() {
			console.log("Enviando identificado: " + Modelo.WebSocketIdentifier);
			that.conn.send(Modelo.WebSocketIdentifier);
			console.log('connected!');
			//that.conn.send("getDnaStudies");
		};
		that.conn.onerror = function(error) {
			console.log("webSocket Error " + error);
		};
		//Acciones a realizar cuando se recibe un mensaje
		that.conn.onmessage = function(e) {
			if (that.functionCallBack instanceof Function) {
				//console.log(e);
				that.functionCallBack(JSON.parse(e.data));
			}

		};
		//Cuando se cierra la conexión se llama a onclose donde e es el motivo del cierre.
		that.conn.onclose = function(e) {
			console.log("webSocket Closed " + e.data);
		};

	},

	Sample : {
		urlSend : null,
		urlGet : null,
		/**
		 * Envia los Samples seleccionados al Servidor par que marquen como seleccionados/deseleccionados
		 * @param arryObj Array de Objetos de tipo {k}
		 * @param booleanTipoOperacion TRUE inserta en servidor, FLASE, elimina del servidor
		 */
		send : function(arrayObj, booleanTipoOperacion) {
			if (Modelo.Mode == "WEBSERVICE") {
				console.log("Enviando lista de Samples:" + JSON.stringify(arrayObj) + " bandera:" + booleanTipoOperacion);
				//Envío el sample seleccionado al servidor
				$.ajax({
					url : Modelo.Sample.urlSend,
					type : 'POST',
					data : JSON.stringify(arrayObj),
					async : true,
					dataType : "json",
					contentType : "application/json",
					beforeSend : function(xhr) {
						console.log('antes de envio');
					},
					error : function(xhr, status, error) {
						console.log("error: " + error + " status:" + status + " xhr: " + xhr);
					}
				}).done(function(data) {
					console.log(data);
				});
			}
			if (Modelo.Mode == "WEBSOCKET") {
				var webSocket = new Modelo.Webskt(null);
				if (webSocket.conn.readyState == 1) {

					webSocket.conn.send(arrayObj);
				} else {
					console.log("ERROR: Conexion no está abierta. Imposible enviar datos");
				}

			}
		},
		/**
		 * Obtener Resultados
		 * @param fn Función CallBack que se ejecutará una vez se han obtenido los resultados
		 */
		get : function(fn) {
			if (Modelo.Mode == "WEBSERVICE") {
				$.ajax({
					url : Modelo.Sample.urlGet,
					tye : 'GET',
					async : false,
					dataType : "json",
					beforeSend : function(xhr) {
						//console.log('antes de envio');
					}
				}).done(function(data) {
					fn(data);
				});
			}
			if (Modelo.Mode == "WEBSOCKET") {
				var webSocket = new Modelo.Webskt(fn);
				if (webSocket != null) {
					if (webSocket.conn.readyState == 1) {
						webSocket.conn.send("getDnaStudies");
					} else {
						console.log("ERROR: Conexion no está abierta. Imposible enviar datos");
					}

				}
			}

		}
	},
	Datasource : {
		urlSend : null,
		urlGet : null,

		/**
		 * Envia los DataSources seleccionados al Servidor par que marquen como seleccionados/deseleccionados
		 * @param arryObj Array id correspondientes a los Datasources seleccionados. Ej.{1,2,3,4,...}
		 * @param booleanTipoOperacion TRUE inserta en servidor, FLASE, elimina del servidor
		 */
		send : function(arrayObj, booleanTipoOperacion) {
			if (Modelo.Mode == "WEBSERVICE") {
				console.log("Enviando lista de Samples:" + JSON.stringify(arrayObj) + " bandera:" + booleanTipoOperacion);
				//Envío el sample seleccionado al servidor
				$.ajax({
					url : ModeloDatasource.urlSend,
					type : 'POST',
					data : JSON.stringify(arrayObj),
					async : true,
					dataType : "json",
					contentType : "application/json",
					beforeSend : function(xhr) {
						console.log('antes de envio');
					}
				}).done(function(data) {
					console.log(data);
				});
			}

			if (Modelo.Mode == "WEBSOCKET") {
				if (Modelo.Webskt.conn.readyState == 1) {
					Modelo.Webskt.conn.send(arrayObj);
				}
				console.log("ERROR: Conexion no está abierta. Imposible enviar datos");

			}

		},
		/**
		 * Obtener Resultados
		 * @param fn Función CallBack que se ejecutará una vez se han obtenido los resultados
		 */
		get : function(fn) {
			if (Modelo.Mode == "WEBSERVICE") {
				//Consulto los datos de Lista de DataSources y lleno la lista
				$.ajax({
					url : Modelo.Datasource.urlGet,
					tye : 'GET',
					async : false,
					dataType : "json",
					beforeSend : function(xhr) {
						//console.log('antes de envio');
					}
				}).done(function(data) {
					fn(data);
					//cargarListaDataSourcesDatos(data);
				});
			}

			if (Modelo.Mode == "WEBSOCKET") {
				var webSocket = new Modelo.Webskt(fn);
				if (webSocket != null) {
					if (webSocket.conn.readyState == 1) {
						webSocket.conn.send("getDatabases");

					} else {
						console.log("ERROR: Conexion no está abierta. Imposible enviar datos");
					}

				}
			}

		}
	}
};
