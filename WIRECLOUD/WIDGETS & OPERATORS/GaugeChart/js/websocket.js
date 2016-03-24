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
				try {
					var json = e.data;
					if ( nameFunctionCallback instanceof Function && nameFunctionCallbackError instanceof Function) {
						if ( json instanceof Array) {
							//Se envia los datos a la funcion respectiva (callback)
							nameFunctionCallback(json);
						}else{
							nameFunctionCallbackError("Los datos provistos no son Arrays =>" + json);
							//Se envia los datos a la funcion respectiva (callback) con null
							nameFunctionCallback(null);
						}
					} else {
						nameFunctionCallbackError("fn No es una funcion válida");
					}
				} catch(error) {
					nameFunctionCallbackError(error);
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
};
