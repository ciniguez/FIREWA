var MODELO = {
	websocket : function(urlWebSocket, nameFunctionCallback, nameFunctionCallbackError) {
		if (MODELO.websocket.singleInstance)
			return Webskt.singleInstance;
		var that = this;
		MODELO.websocket.singleInstance = that;
		if (urlWebSocket) {
			that.conn = new WebSocket(urlWebSocket);
			that.conn.onopen = function() {
				console.log('connected!');
				that.conn.send("SamplevsVariant");
			};
			that.conn.onerror = function(error) {
				console.log("webSocket Error " + error);
			};
			//Acciones a realizar cuando se recibe un mensaje
			that.conn.onmessage = function(e) {
				var json;
				if ( nameFunctionCallback instanceof Function) {
					try {
						json = JSON.parse(e.data);
						nameFunctionCallback(json);
					} catch(error) {
						nameFunctionCallbackError(error);
					} finally {
						nameFunctionCallbackError(e.data);
					}
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
	}
};
