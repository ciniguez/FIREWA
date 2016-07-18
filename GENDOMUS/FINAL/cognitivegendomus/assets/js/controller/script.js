$(document).ready(function() {
	//console.log($("#AnalisisList-container"));
	//var ctrl = new CtrlCargaDatos('assets/data/Alberto.json', 'assets/data/DataSources.json','http://158.42.185.198:8080/sendselectionsamples','http://158.42.185.198:8080/sendselectiondatasources');
	//var ctrl = new CtrlCargaDatos('http://158.42.185.198:8080/getanalysis', 'http://158.42.185.198:8080/getdatasources');
	var ctrl = new CtrlCargaDatos('https://158.42.185.198:8443/getanalysis', 'https://158.42.185.198:8443/getdatasources');

	
	$('ul li').hover(function() {
		$(this).css("background-color", "#778899");
		$(this).css("color", "#FFFFFF");
	}, function() {
		$(this).css("background-color", "#FFFFFF");
		$(this).css("color", "#000000");
	});
});
