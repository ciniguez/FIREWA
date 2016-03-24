var MODELO = {
	/***
	 * @param {Object} urlWebSocket Url  WebSocket de conexión al servidor
	 * @param {Object} nameFunctionCallback Función a ejecutarse cuando se reciba cdatos del servidor
	 * @param {Object} nameFunctionCallbackError Functión a ejecutarse cuando se reciba error del servidor
	 * @param {Object} idWebSocket Nombre identificativo del Websocket para que el Servidor lo almacene.
	 */
	websocket : function(urlWebSocket, nameFunctionCallback, nameFunctionCallbackError, idWebSocket) {
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
			nameFunctionCallbackError("La URL de conexión no es válida.");
		}
	},
	/**
	 * Transforma los datos recibidos por el servidor a datos que entiende el gráfico de Barras.
	 * @param {Object} datos Datos del servidor.
	 */
	transformadorData : function(datos) {
		var json;
		var bandera = true;
		try {
			json = JSON.parse(datos);
		} catch(error) {
			console.log(error);
			bandera = false;
		} finally {
			if (!bandera) {
				json = [{
					"chromosomeId" : 1,
					"name" : "Chromosome 1",
					"referenceId" : "Reference 1",
					"curatedVariations" : null,
					"calledVariations" : null,
					"sizeCuratedVariations" : 0,
					"sizeCalledVariations" : 12
				}, {
					"chromosomeId" : 2,
					"name" : "Chromosome 2",
					"referenceId" : "Reference 2",
					"curatedVariations" : null,
					"calledVariations" : null,
					"sizeCuratedVariations" : 0,
					"sizeCalledVariations" : 24
				}];
			}
		}
		return json;
	}
};
