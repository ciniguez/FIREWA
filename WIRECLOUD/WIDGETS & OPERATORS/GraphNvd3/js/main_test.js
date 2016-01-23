/**
 * Función de test
 * Probar sin necesidad de inyectar en wirecloud.
 * Probar en un browser la dirección local de archivo:
 * GraphNvd3/index.html
 */
(function() {

	var user_data = [{
		"chr" : "1",
		"numVariante" : "2562"
	}, {
		"chr" : "10",
		"numVariante" : "1604"
	}, {
		"chr" : "11",
		"numVariante" : "1518"
	}, {
		"chr" : "12",
		"numVariante" : "1368"
	}, {
		"chr" : "13",
		"numVariante" : "1161"
	}, {
		"chr" : "14",
		"numVariante" : "954"
	}, {
		"chr" : "15",
		"numVariante" : "915"
	}, {
		"chr" : "16",
		"numVariante" : "1040"
	}, {
		"chr" : "17",
		"numVariante" : "861"
	}, {
		"chr" : "18",
		"numVariante" : "891"
	}, {
		"chr" : "19",
		"numVariante" : "670"
	}, {
		"chr" : "2",
		"numVariante" : "2411"
	}, {
		"chr" : "20",
		"numVariante" : "625"
	}, {
		"chr" : "21",
		"numVariante" : "566"
	}, {
		"chr" : "22",
		"numVariante" : "319"
	}, {
		"chr" : "3",
		"numVariante" : "2047"
	}, {
		"chr" : "4",
		"numVariante" : "2233"
	}, {
		"chr" : "5",
		"numVariante" : "1531"
	}, {
		"chr" : "6",
		"numVariante" : "1582"
	}, {
		"chr" : "7",
		"numVariante" : "1303"
	}, {
		"chr" : "8",
		"numVariante" : "1586"
	}, {
		"chr" : "9",
		"numVariante" : "1398"
	}, {
		"chr" : "X",
		"numVariante" : "717"
	}, {
		"chr" : "Y",
		"numVariante" : "145"
	}];

	function init() {
		console.log("inicia");
		angular.module('myApp', ['nvd3']).controller('myCtrl', function($scope) {
			$scope.options = {
				chart : {
					type : 'pieChart',
					height : 500,
					x : function(d) {
						return d.chr;
						//Here put the KEY name from array
					},
					y : function(d) {
						return d.numVariante;
						// Here put the KEY name from the array
					},
					showLabels : true,
					duration : 500,
					labelThreshold : 0.01,
					labelSunbeamLayout : true,
					legend : {
						margin : {
							top : 5,
							right : 35,
							bottom : 5,
							left : 0
						}
					},

					//chart events
					pie : {
						dispatch : {
							elementClick : function(e) {
								console.log(e.data.chr);
							}
						}
					}

				}
			};
			$scope.$on('elementClick.directive', function(angularEvent, event) {
				console.log("clock");
			});

			$scope.data = user_data;

		});
	}

	/*
	 * document.addEventListener Attach an event to the document.
	 * Syntax: document.addEventListener(event, function, useCaputre)
	 * where:
	 * event = Required. A string that specifies the name of the event.
	 * function = Required, Specifies the function to run when the event occurs.
	 * useCapture = Optional. A Boolean value that specifies whether the event should be
	 * executed in the capturing or in the bubbling phase. True, if the event handler
	 * is executed in the CAPTURING phase, otherwise it will be exceuted int
	 * the BUBBLING phase (default).
	 *
	 * Bind, create a linked function with the same original body function.In the linked
	 * function, the object THIS reference to the Object passe on.
	 *
	 * DOMContentLoaded.- It`s am event that is fired when the initial HTML document has
	 * been completely loaded and parsed, without waiting for stylesheets, images and subframes
	 * to finish loading. In contrast, the LOAD event detect a fully-loaded page, including all resources.
	 * I have changed DOMContentLoaded for load, beacouse I need load all resources on the web page to works!
	 */
	document.addEventListener('load', init.bind(this), true);
})();

