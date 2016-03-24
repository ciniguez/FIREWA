var MODELO = {
	/***
	 * @param {Object} urlWebSocket Url  WebSocket de conexión al servidor
	 * @param {Object} nameFunctionCallback Función a ejecutarse cuando se reciba cdatos del servidor
	 * @param {Object} nameFunctionCallbackError Functión a ejecutarse cuando se reciba error del servidor
	 * @param {Object} idWebSocket Nombre identificativo del Websocket para que el Servidor lo almacene.
	 */
	websocket : function(urlWebSocket,nameFunctionCallback, nameFunctionCallbackError, idWebSocket) {
		if (MODELO.websocket.singleInstance)
			return Webskt.singleInstance;
		var that = this;
		MODELO.websocket.singleInstance = that;
		if (urlWebSocket) {
			that.conn = new WebSocket(urlWebSocket);
			that.conn.onopen = function() {
				console.log('connected!');
				that.conn.send(idWebSocket);
			};
			that.conn.onerror = function(error) {
				console.log("webSocket Error " + error);
			};
			//Acciones a realizar cuando se recibe un mensaje
			that.conn.onmessage = function(e) {
				var json;
				if ( nameFunctionCallback instanceof Function && nameFunctionCallbackError instanceof Function) {
					json = MODELO.transformadorData(e.data);
					//Se envia los datos a la funcion respectiva (callback)
					nameFunctionCallback(JSON.parse(json));
				} else {
					nameFunctionCallbackError("fn No es una funcion válida");
				}
			};
			//Cuando se cierra la conexión se llama a onclose donde e es el motivo del cierre.
			that.conn.onclose = function(e) {
				console.log("webSocket Closed " + e.data);
			};

		} else {
			console.log("imposible conectar, no se ha provisto una URL válida.");
		}
	},

	/**
	 * Transforma los datos recibidos por el servidor a datos que entiende el gráfico de Barras.
	 * @param {Object} datos Datos del servidor.
	 */
	transformadorData : function(datos) {
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
			bandera = true;

		} catch(error) {
			//console.log(error);
			nameFunctionCallbackError(error);
		} finally {

			if (!bandera) {
				//Creacion de un objeto No Data por Default
				var v = new Object();
				v.label = "No Data";
				v.value = 1;
				v.color = '#00b19d';

				//agregacion al array general
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
		}

	}
};
