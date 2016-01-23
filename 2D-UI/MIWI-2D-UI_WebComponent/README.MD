# Polymer-Chat #

- Extract the downloaded file to your local file system or use a web server.

ZIP contains 3 examples of a chat -web component created with Polymer library version 0.1.1.
- index.html
- dynamic.html
- vulcanized.html

Inside bower_components -folder is the Polymer project.
Follow current version of Polymer Project at [https://github.com/polymer/polymer GitHub].

The chat -folder contains the implemented example of chat -web component which has a name polymer-chat.

## polymer-chat in index.html ##

When the index.html -file is opened in a browser you can see a chat application written as a Polymer web component.

To use this polymer-chat -web component first reference platform.js and import polymer.js which is included in polymer.html to your page <head> -section:

    <script src="bower_components/platform/platform.js"></script>
    <link rel="import" href="bower_components/polymer/polymer.html">

Then import the Polymer web component created:

    <link rel="import" href="chat/polymer-chat.html">

If you look inside the imported polymer-chat.html you can find it importing a polymer-collapse.html and referencing a css -file.

At last put the template tag to your page inside <body> tag:

    <polymer-chat></polymer-chat>

The source code of example page is as follows:

	<html>
	  <head>
	    <script src="bower_components/platform/platform.js"></script>
	    <link rel="import" href="bower_components/polymer/polymer.html">
	    <link rel="import" href="chat/polymer-chat.html">
	  </head>
	  <body>
	    <polymer-chat></polymer-chat>
	  </body>
	</html>


Inside the index.html source code you can also find how to use the polymer-chat:

	<script>
	  //Simple example to use polymer with javascript
	  window.addEventListener('WebComponentsReady', function(e) {
	      var pchat = document.querySelector('polymer-chat');
	      pchat.clientusername = "User 1";
	      pchat.addUser("test", "1");
	      pchat.addUser("test2", "2");
	
	      //Connect to polymer fired event
	      pchat.addEventListener('chatmessage', function(e)
	      {
	          console.log("Event fired in polymer component : "+e.detail.uname+"-"+e.detail.message);
	      });
	
	      pchat.onServerMessage("ChatInfoMessage|Server:Message from server.");
	  });
	</script>


## polymer-chat in vulcanized.html ##

This example file is similar to the index.html except it uses vulcanized import file. Vulcanize concatenates a set of Polymer Web Components into one file [https://github.com/Polymer/vulcanize GitHub].
Instead of importing polymer-chat.html we now import polymer-chat-full.html which as vulcanized set of polymer-chat and polymer-collapse.

	<link rel="import" href="chat/polymer-chat-full.html">


If you look inside the polymer-chat-full.html file you can see all templates, css and scripting as a one file.

## polymer-chat in dynamic.html ##

One of the biggest issues with Polymer is the lack of ability to load web components dynamically. However all needed functions are already there but the Polymer Project itself
has not yet created a convinient way of using them. This is discussed topic inside the project and will be part of the project in the future.
In this example we show a way to do it currently.

The difference to other examples is that this has to be installed on a web server. The example sets default paths to http://localhost. When trying remember to change these paths accordingly.
Change the paths in dynamic.html and polymer-chat-dynamic.html -files.

In this example we use jQuery to download the component therefore a link to jQuery library is needed:

	<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>


Next we download the polymer-chat-dynamic.html and create the polymer-chat -element on the fly. The content of downloaded file is
put to innerHTML of the newly created component and then added to document body -section.


	//Download polymer dynamically and at tag to page.
	$.get( "http://localhost/polymer/chat/polymer-chat-dynamic.html", function( data ) {
		var element = document.createElement("polymer-chat");
		element.innerHTML = data;
		$("body").append(element);
	});


Next we will wait for WebComponentsReady event and start to hook things up. We also have to wait for the polymer-chat component itself to inform that it
is ready. For this we wait for polymerchatready -event which is fired when the polymer-chat -component has been fully initialized and ready to use. You can find
this piece of code inside the polymer-chat-dynamic.html -file:

	ready : function()
	{
		console.log("Polymer Chat is ready!");
		this.fire("polymerchatready");
	}


Below is the complete script:

    //Wait for WebComponentsReady event
	window.addEventListener('WebComponentsReady', function(e) {
	  	var pchat = document.querySelector('polymer-chat');
		//Wait for PolymerChat being ready
		pchat.addEventListener('polymerchatready', function(e)
		{
		  pchat.clientusername = "User 1";
		  pchat.addUser("test", "1");
		  pchat.addUser("test2", "2");
		
		  //Connect to polymer fired event
		  pchat.addEventListener('chatmessage', function(e)
		  {
		      console.log("Event fired in polymer component : "+e.detail.uname+"-"+e.detail.message);
		
		  });
		
		  pchat.onServerMessage("ChatInfoMessage|Server:Message from server.");
		
		});
	});


Since Polymer is at pre-alpha stage all these examples may broke up if the Polymer version is being updated.