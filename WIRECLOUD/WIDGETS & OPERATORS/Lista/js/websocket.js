var MODELO = {
	urlConeccion : "ws://localhost:8080/WebSockets/websocket/chat",
	websocket : function(nameFunctionCallback) {
		if (MODELO.websocket.singleInstance)
			return Webskt.singleInstance;
		var that = this;
		MODELO.websocket.singleInstance = that;
		if (MODELO.urlConeccion) {
			that.conn = new WebSocket(MODELO.urlConeccion);
			that.conn.onopen = function() {
				console.log('connected!');
			};
			that.conn.onerror = function(error) {
				console.log("webSocket Error " + error);
			};
			//Acciones a realizar cuando se recibe un mensaje
			that.conn.onmessage = function(e) {
				console.log(e);
				if ( nameFunctionCallback instanceof Function) {
					var datos = [{
						"id" : 1,
						"description" : "item 1"
					}, {
						"id" : 2,
						"description" : "text_description2"
					}, {
						"id" : 3,
						"description" : "text_description3"
					}];
					// TODO: quitar comentario
					//nameFunctionCallback(e);
					nameFunctionCallback(datos);
				} else {
					console.log("fn No es una funcion válida");
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
