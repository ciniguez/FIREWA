var MODELO = {
	//urlConeccion : "ws://localhost:8080/WebSockets/websocket/chat",
	urlConeccion : "ws://158.42.185.198:8080/graphws",
	websocket : function(nameFunctionCallback, nameFunctionCallbackError) {
		if (MODELO.websocket.singleInstance)
			return Webskt.singleInstance;
		var that = this;
		MODELO.websocket.singleInstance = that;
		if (MODELO.urlConeccion) {
			that.conn = new WebSocket(MODELO.urlConeccion);
			that.conn.onopen = function() {
				console.log('connected!');
				that.conn.send("SamplevsVariant");
			};
			that.conn.onerror = function(error) {
				console.log("webSocket Error " + error);
			};
			//Acciones a realizar cuando se recibe un mensaje
			that.conn.onmessage = function(e) {
				if ( nameFunctionCallback instanceof Function) {

					var json = JSON.parse(e.data);
					console.log(json);
					
					nameFunctionCallback(json);
					/*
					if ( json instanceof Array) {
						nameFunctionCallback(e.data);
					} else {

						var datos = [{
							"id" : 1,
							"description" : "NO DATA"
						}];
						nameFunctionCallback(datos);
						nameFunctionCallbackError(e.data);

					}
					*/

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
	}
};
