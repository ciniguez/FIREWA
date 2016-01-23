/*jshint browser:true*/
/*global MashupPlatform StyledElements Vcard NGSI*/

(function() {

	"use strict";
	var user_Data = null;
	var url = null;

	function init() {
		//tomo la url de conexión desde preferencias
		var urlPreferencias = MashupPlatform.prefs.get('urlServicio');
		if(urlPreferencias==null){
			this.url="http://localhost:8080/2-ProveedorRest/rest/vcf/cromosomas";
		}
		url = urlPreferencias;

		presentarGrafico();
		//Registro lo que ingresa como Preferencia (la url del servicio)
		MashupPlatform.prefs.registerCallback(function(new_values) {
			if ('urlServicio' in new_values) {
				url = MashupPlatform.prefs.get('urlServicio');
				presentarGrafico();
			}
		});

	}

	function presentarGrafico() {
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
		MashupPlatform.widget.log("Ingreso a presentar_datos: "+ user_data.varianteXCromosoma.length, MashupPlatform.log.INFO);
		for(var i=0; i<user_data.varianteXCromosoma.length;i++){
			Console.log(user_data.variante[i].chr);
		}
	}

	document.addEventListener('DOMContentLoaded', init.bind(this), true);

})();
