This is a widget developed to show statistical graphs based on Angular directives for Nvd3.

It has been designed to be fully functionall according to research proposes.

In this version has been implemented the Pie and Discrete Chart only. More features will be developed according to the research needs.However, it will be likely to be implemented with others requirements.
Initially a bare widget is created begining with an empty skeleton. Widget code includes the concepts described on: [krispo](http://krispo.github.io/angular-nvd3/#/pieChart)

This basic widget is added some properties, where the user can indicate:
1.- the webService path, which provides data.
2.- the principal and second variable to graph
3.- the operation will be computed between above two variables.
4.- Yes or NOT to observe logs on development or production environments.


HOW TO:
1.- Add GraphNvd3.wgt to Wirecloud Resources 
2.- In your Dashboard, click Add button to add new widgets. Select GraphNvd3.
3.- A graph will be showed on Dashboard. Select "Configuration" option on top of window graph.
4.- Configure paremeters as you decide.
5.- Refresh (ReLoad) the window graph.

Note: GraphNvd3 functionality is implemented using wiring to send and receive _messages_ to other instance of the same widget. This allows showing how to use wiring, both for sending messages and for subscribing to them.
Finally, users place graphs on wirecloud dashboard.  
