/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

(function() {

	"use strict";
	var user_Data = null;

	var url = null;

	function init() {
		//tomo la url de conexión desde preferencias
		url = MashupPlatform.prefs.get('urlServicio');
		
		var btnEnviar = document.getElementById("btnEnviar");
		btnEnviar.addEventListener("click", btnEnviarClick, false);

		llenarLista();
		//Registro lo que ingresa como Preferencia (la url del servicio)
		MashupPlatform.prefs.registerCallback(function(new_values) {
			if ('urlServicio' in new_values) {
				url = MashupPlatform.prefs.get('urlServicio');
				llenarLista();
			}
		});

	}

	function llenarLista() {
		MashupPlatform.http.makeRequest(url, {
			method : 'GET',
			onSuccess : function(response) {
				//MashupPlatform.widget.log("RESPUESTA" + response.responseText, MashupPlatform.log.INFO);
				var user_data = JSON.parse(response.responseText);

				if (user_data.error) {
					MashupPlatform.widget.log("Error en Procesamiento", MashupPlatform.log.ERROR);
					onError();
				} else {
					MashupPlatform.widget.log("Procede a mostrar datos", MashupPlatform.log.INFO);
					user_Data = user_data;
					presentar_datos(user_data);
				}
			},
			onError : function() {
				MashupPlatform.widget.log("Error en Procesamiento - final", MashupPlatform.log.ERROR);
				onError();
			}
		});
	}

	function presentar_datos(user_data) {
		//MashupPlatform.widget.log("Ingreso a presentar_datos: "+ user_data.person.length, MashupPlatform.log.INFO);
		//document.getElementById('lista').innerHTML = user_data.person[0].nombre;
		var tabla = document.getElementById("tabla");
		var i = 0;
		for ( i = 0; i < user_data.person.length; i++) {
			var row = tabla.insertRow(i);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			cell1.innerHTML = user_data.person[i].nombre + " " + user_data.person[i].apellido;
			cell2.innerHTML = user_data.person[i].dni;
		}
		//MashupPlatform.widget.log("Salio de FOR ", MashupPlatform.log.INFO);

	}

	function btnEnviarClick(e) {
		
		var valorParaEnviar = document.getElementById("dato_envio").value;
		MashupPlatform.widget.log("Se envío el dato: "+valorParaEnviar, MashupPlatform.log.INFO);
		MashupPlatform.wiring.pushEvent('outputItem', valorParaEnviar);
	}


	document.addEventListener('DOMContentLoaded', init.bind(this), true);

})();
