

/**
    Provides mouse and keyboard input state and events.
    @class InputAPI
    @constructor
*/
var InputAPI = Class.$extend(
{
    /**
        Event object description for mouseEvent callbacks.
        @event MouseEvent
        @param {String} type "move" | "press" | "release" | "wheel"
        @param {Number} x Current x position
        @param {Number} y Current y position
        @param {Number} relativeX Relative x movement since last mouse event
        @param {Number} relativeY Relative y movement since last mouse event
        @param {Number} relativeZ Mouse wheel delta
        @param {Boolean} rightDown Is right mouse button down
        @param {Boolean} leftDown Is left mouse button down
        @param {Boolean} middleDown Is middle mouse button down
        @param {String} targetId DOM element id that the mouse event occurred on
        @param {String} targetNodeName HTML node name eg. 'canvas' and 'div'. Useful for detected
        when on 'canvas' element aka the mouse event occurred on the 3D scene canvas and not on top of a UI widget.
        @param {Object} originalEvent Original jQuery mouse event
    */

    /**
        Event object description for keyboard event callbacks.
        @event KeyEvent
        @param {String} type "press" | "release"
        @param {Number} keyCode Key as number
        @param {String} key Key as string
        @param {Object} pressed Currently held down keys. Maps key as string to boolean.
        @param {String} targetId DOM element id that the mouse event occurred on
        @param {String} targetNodeName HTML node name eg. 'canvas' and 'div'. Useful for detected
        when on 'body' element aka the mouse event occurred on the "3D scene" and not on top of another input UI widget.
        @param {Object} originalEvent Original jQuery key event
    */

    __init__ : function(params)
    {
        var that = this;

        InputAPI.instance = this;

        this.browser =
        {
            /**
                If the underlying browser is Google Chrome.
                @property isChrome
                @type Boolean
                @static
            */
            isChrome    : navigator !== undefined ? navigator.userAgent.indexOf("Chrome") > -1 : false,
            /**
                If the underlying browser is Microsoft Internet Explorer.
                @property isExplorer
                @type Boolean
                @static
            */
            isExplorer  : navigator !== undefined ? navigator.userAgent.indexOf("MSIE") > -1 : false,
            /**
                If the underlying browser is Mozilla Firefox.
                @property isFirefox
                @type Boolean
                @static
            */
            isFirefox   : navigator !== undefined ? navigator.userAgent.indexOf("Firefox") > -1 : false,
            /**
                If the underlying browser is Apple Safari.
                @property isSafari
                @type Boolean
                @static
            */
            isSafari    : navigator !== undefined ? navigator.userAgent.indexOf("Safari") > -1 : false,
            /**
                If the underlying browser is Opera.
                @property isOpera
                @type Boolean
                @static
            */
            isOpera     : navigator !== undefined ? navigator.userAgent.indexOf("Presto") > -1 : false,

            isMobileAndroid: navigator !== undefined ? navigator.userAgent.match(/Android/i) != null : false,

            isMobileBlackBerry: navigator !== undefined ? navigator.userAgent.match(/BlackBerry/i) != null : false,
            
            isMobileiOS: navigator !== undefined ? navigator.userAgent.match(/iPhone|iPad|iPod/i) != null : false,
            
            isMobileOpera: navigator !== undefined ? navigator.userAgent.match(/Opera Mini/i) != null : false,

            isMobileWindows: navigator !== undefined ? navigator.userAgent.match(/IEMobile/i) != null || navigator.userAgent.match(/WPDesktop/i) != null : false,

            isMobile: function()
            {
                return (this.isMobileAndroid || this.isMobileiOS || this.isMobileBlackBerry || this.isMobileOpera || this.isMobileWindows);
            }
        };

        /**
            Current mouse state
            <pre>{
                x : Number,
                y : Number
            }</pre>

                overlay.css({
                    top  : input.mouse.y,
                    left : 5
                });

            @property mouse
            @type Object
        */
        this.mouse =
        {
            // Event type: move, press, release, wheel
            type : "",
            // Absolute position
            x : null,
            y : null,
            // Relative position
            relativeX : 0,
            relativeY : 0,
            // Wheel delta
            relativeZ : 0,
            // Button states
            rightDown  : false,
            leftDown   : false,
            middleDown : false,
            // HTML element id that the mouse event occurred on
            targetId : "",
            // HTML node name eg. 'canvas' and 'div'. Useful for detected
            // when on 'canvas' element aka the mouse event occurred on the
            // 3D scene canvas and not on top of a UI widget.
            targetNodeName : "",
            // Original jQuery mouse event
            originalEvent : null
        };

        /**
            Current keyboard state
            <pre>{
                pressed :
                {
                    keyCodeStr : Boolean
                }
            }</pre>

                if (input.keyboard.pressed["w"] === true)
                    console.log("W is down");

            @property keyboard
            @type Object
        */
        this.keyboard =
        {
            // Event type: press, release
            type : "",
            // Event key code
            keyCode : 0,
            // Event key as string
            key : "",
            // If this is a repeat. Meaning the key was already in the pressed state.
            repeat : false,
            // Currently held down keys: maps key as string to 'true' boolean
            // Check with inputApi.keyboard.pressed["w"] or keyEvent.pressed["f"]
            pressed : {},
            // HTML element id that the mouse event occurred on
            targetId : "",
            // HTML node name eg. 'canvas' and 'div'. Useful for detected
            // when on 'body' element aka the mouse event occurred on the "3D scene" and not on top of another input UI widget.
            targetNodeName : "",
            // Original jQuery mouse event
            originalEvent : null
        };

        this.keys =
        {
            8   : 'backspace',
            9   : 'tab',
            13  : 'enter',
            16  : 'shift',
            17  : 'ctrl',
            18  : 'alt',
            20  : 'capslock',
            27  : 'esc',
            32  : 'space',
            33  : 'pageup',
            34  : 'pagedown',
            35  : 'end',
            36  : 'home',
            37  : 'left',
            38  : 'up',
            39  : 'right',
            40  : 'down',
            45  : 'ins',
            46  : 'del',
            91  : 'meta',
            93  : 'meta',
            224 : 'meta'
        };

        this.keycodes =
        {
            106 : '*',
            107 : '+',
            109 : '-',
            110 : '.',
            111 : '/',
            186 : ';',
            187 : '=',
            188 : ',',
            189 : '-',
            190 : '.',
            191 : '/',
            192 : '`',
            219 : '[',
            220 : '\\',
            221 : ']',
            222 : '\''
        };

        if (params.container)
            this.container = $(params.container);

        //Init signals
        this.Signal = signals.Signal;
        //Key signals

        /**
            A signal for registering to all key events. See {{#crossLink "InputAPI/KeyEvent:event"}}{{/crossLink}} for event data.
            @example
                function onKeyEvent(event)
                {
                    // event === KeyEvent
                }

                inputAPI.keyEvent.add(onKeyEvent);

            @property keyEvent
            @type {Signal}
        */
        this.keyEvent = new this.Signal();

        /**
            A signal for registering to key press events. See {{#crossLink "InputAPI/KeyEvent:event"}}{{/crossLink}} for event data.
            @example
                function onKeyPress(event)
                {
                    // event === KeyEvent
                }

                inputAPI.keyPress.add(onKeyPress);

            @property keyPress
            @type {Signal}
        */
        this.keyPress = new this.Signal();

        /**
            A signal for registering to key press events. See {{#crossLink "InputAPI/KeyEvent:event"}}{{/crossLink}} for event data.
            @example
                function onKeyRelease(event)
                {
                    // event === KeyEvent
                }

                inputAPI.keyRelease.add(onKeyRelease);

            @property keyRelease
            @type {Signal}
        */
        this.keyRelease = new this.Signal();
        //Mouse signals

        /**
            A signal for registering to all mouse events. See {{#crossLink "InputAPI/MouseEvent:event"}}{{/crossLink}} for event data.
            @example
                function onMouseEvent(event)
                {
                    // event === MouseEvent
                }

                inputAPI.mouseEvent.add(onMouseEvent);

            @property mouseEvent
            @type {Signal}
        */
        this.mouseEvent = new this.Signal();

        /**
            A signal for registering to mouse move events. See {{#crossLink "InputAPI/MouseEvent:event"}}{{/crossLink}} for event data.
            @example
                function onMouseMove(event)
                {
                    // event === MouseEvent
                }

                inputAPI.mouseMove.add(onMouseMove);

            @property mouseMove
            @type {Signal}
        */
        this.mouseMove = new this.Signal();

        /**
            A signal for registering to mouse button presses. See {{#crossLink "InputAPI/MouseEvent:event"}}{{/crossLink}} for event data.
            @example
                function onMousePress(event)
                {
                    // event === MouseEvent
                }

                inputAPI.mousePress.add(onMousePress);

            @property mousePress
            @type {Signal}
        */
        this.mousePress = new this.Signal();

        /**
            A signal for registering to mouse button releases. See {{#crossLink "InputAPI/MouseEvent:event"}}{{/crossLink}} for event data.
            @example
                function onMouseRelease(event)
                {
                    // event === MouseEvent
                }

                inputAPI.mouseRelease.add(onMouseRelease);

            @property mouseRelease
            @type {Signal}
        */
        this.mouseRelease = new this.Signal();

        /**
            A signal for registering to mouse button clicks. See {{#crossLink "InputAPI/MouseEvent:event"}}{{/crossLink}} for event data.
            @example
                function onMouseClick(event)
                {
                    // event === MouseEvent
                }

                inputAPI.mouseClick.add(onMouseClick);

            @property mouseClick
            @type {Signal}
        */
        this.mouseClick = new this.Signal();

        /**
            A signal for registering to mouse wheel events. See {{#crossLink "InputAPI/MouseEvent:event"}}{{/crossLink}} for event data.
            @example
                function onMouseWheel(event)
                {
                    // event === MouseEvent
                }

                inputAPI.mouseWheel.add(onMouseWheel);

            @property mouseWheel
            @type {Signal}
        */
        this.mouseWheel = new this.Signal();

        //If container is present, register events
        if (this.container)
        {
            //Register key events.
            this.registerKeyboardEvents(this.container);
            this.registerMouseEvents(this.container);
        }

        //InputStates
        this.inputStates = [];
        //Pending inputstates for combined keys and mouse events or time slot
        this.pendingInputStates = {};

        $(window).blur(function(e) {
            that.onBlurInternal(e);
        });

        this.postInit();
    },

    __classvars__ :
    {
        instance : null,

        plugins  : [],

        registerPlugin : function(plugin)
        {
            if (!(plugin instanceof IInputPlugin))
            {
                console.log("[InputAPI]: Cannot register plugin that is not of type IInputPlugin");
                return false;
            }

            InputAPI.plugins.push(plugin);
        }
    },

    postInit : function()
    {
        for (var i = 0; i < InputAPI.plugins.length; i++)
        {
            try
            {
                InputAPI.plugins[i]._start(this.container);
            }
            catch(e)
            {
                console.log("[InputAPI:] Plugin " + InputAPI.plugins[i].name + " start() threw exception: " + e);
            }
        }
    },

    /**
        Removes all registered event listeners and resets all plugins
        @method reset
    */
    reset : function()
    {
        //Keyboard signals
        this.keyEvent.removeAll();
        this.keyPress.removeAll();
        this.keyRelease.removeAll();
        //Mouse signals
        this.mouseEvent.removeAll();
        this.mouseMove.removeAll();
        this.mousePress.removeAll();
        this.mouseRelease.removeAll();
        this.mouseClick.removeAll();
        this.mouseWheel.removeAll();

        for (var i = 0; i < InputAPI.plugins.length; i++)
        {
            try
            {
                InputAPI.plugins[i].reset();
            }
            catch(e)
            {
                console.log("[InputAPI:] Plugin " + InputAPI.plugins[i].name + " reset() threw exception: " + e);
            }
        }

        for (var i = 0; i < this.inputStates.length; i++)
        {
            try
            {
                this.inputStates[i].reset();
            }
            catch(e)
            {
                console.log("[InputAPI:] InputState " + this.inputStates[i].name + " reset() threw exception: " + e);
            }
        }

    },

    onBlurInternal : function(e)
    {
        //Clear keyboard pressed keys when document has no focus
        this.keyboard.pressed = {};
    },

    registerInputState : function(inState)
    {
        if (!(inState instanceof InputState))
        {
            console.log("[InputAPI]: Cannot register input state that is not of type InputState");
            return false;
        }

        if (!inState.name)
        {
            console.log("[InputAPI]: Cannot register input state that has no name");
            return false;
        }

        if (inState.keyBindings.length == 0 && inState.mouseDown == -1)
        {
            console.log("[InputAPI]: Cannot register input state that has no key or mouse bindings");
            return false;
        }

        if (inState.priority > 100 || inState.priority < 0)
        {
            console.log("[InputAPI]: Input state priority must be between 0 and 100");
            return false;
        }

        if (inState.timeslot > 5000 || inState.timeslot < 0)
        {
            console.log("[InputAPI]: Input state time slot must be between 0 and 5000");
            return false;
        }

        if (this.inputStates.length > 0)
        {
            for (var i = 0; i < this.inputStates.length; i++) {
                if (this.inputStates[i].name === inState.name)
                {
                    console.log("[InputAPI]: Input state with same name already exists");
                    return false;
                }
            }
        }

        inState.actionSignal = new this.Signal();
        this.inputStates.push(inState);
        this.inputStates.sort(this.sortInputStates);

        console.log("[InputAPI] registered new input state "+inState.name);

        return inState.actionSignal;
    },

    updateInputState : function(inState)
    {

        this.clearPendingInputStates();
        this.pendingInputStates = {};

        if (this.inputStates.length == 0)
        {
            console.log("[InputAPI]: Cannot update input state. Please register it first");
            return false;
        }

        for (var i = 0; i < this.inputStates.length; i++) {
            if (this.inputStates[i].name === inState.name)
            {
                this.inputStates[i].keyBindings = inState.keyBindings;
                this.inputStates[i].mouseDown = inState.mouseDown;
                this.inputStates[i].timeslot = inState.timeslot;
                this.inputStates[i].priority = inState.priority;
                this.inputStates[i].multiplier = inState.multiplier;
                this.inputStates.sort(this.sortInputStates);
                console.log("[InputAPI]: Input state "+inState.name+" updated");
                return true;
            }
        }

        console.log("[InputAPI]: Cannot update input state. Input state with given name not found.");
        return false;
    },

    clearPendingInputStates : function()
    {
        if (this.pendingInputStates && Object.keys(this.pendingInputStates).length > 0)
        {
            for (var key in this.pendingInputStates)
            {
                if (this.pendingInputStates[key].timeslot != 0 && this.pendingInputStates[key].timeslot < Date.now())
                {
                    delete this.pendingInputStates[key];
                }
            }
        }
    },

    /**
        Get input plugin.

        @method getPlugin
        @param {String} name Name of the plugin.
        @return {IInputPlugin}
    */

    getPlugin : function(pluginName)
    {
        for (var i = 0; i < InputAPI.plugins.length; i++)
        {
            try
            {
                if (InputAPI.plugins[i].name === pluginName)
                {
                    return InputAPI.plugins[i];
                }
            }
            catch(e)
            {
                console.log("[InputAPI:] Plugin " + InputAPI.plugins[i].name + " getPlugin() threw exception: " + e);
            }
        }
        return null;
    },

    supportsEventType : function(signal)
    {
        return this[signal] instanceof signals.Signal;
    },

    registerMouseEvents : function(element)
    {
        var receiver = this;
        var myElement = $(element);
        myElement.mousemove(function(e) {
            receiver.onMouseMoveInternal(e);
        });
        myElement.mousedown(function(e) {
            receiver.onMousePressInternal(e);
        });
        myElement.mouseup(function(e) {
            receiver.onMouseReleaseInternal(e);
        });
        myElement.mousewheel(function(e, delta, deltaX, deltaY) {
            receiver.onMouseWheelInternal(e, delta, deltaX, deltaY);
        });
    },

    registerKeyboardEvents : function(element)
    {
        var myElement = $(element);
        var receiver = this;
        if (myElement[0].tabIndex !== -1)
        {
            $(myElement).keydown(function(e) {
                receiver.onKeyPressInternal(e);
            });
            $(myElement).keyup(function(e) {
                receiver.onKeyReleaseInternal(e);
            });
        }
        else
        {
            console.log("[InputAPI:] Remember to add tabIndex to element, otherwise key events are bind to document.");

            $(document).keydown(function(e) {
                receiver.onKeyPressInternal(e);
            });
            $(document).keyup(function(e) {
                receiver.onKeyReleaseInternal(e);
            });
        }
    },

    onMouseMoveInternal : function(event)
    {
        this.readMouseEvent(event);
        this.mouse.type = "move";

        this.mouseEvent.dispatch(this.mouse);
        this.mouseMove.dispatch(this.mouse);
    },

    onMousePressInternal : function(event)
    {
        this.readMouseEvent(event);
        this.mouse.type = "press";

        this.mouseEvent.dispatch(this.mouse);
        this.mouseClick.dispatch(this.mouse);
        this.mousePress.dispatch(this.mouse);
    },

    onMouseReleaseInternal : function(event)
    {
        this.readMouseEvent(event);
        this.mouse.type = "release";
        this.mouse.leftDown = false;
        this.mouse.rightDown = false;
        this.mouse.middleDown = false;

        this.mouseEvent.dispatch(this.mouse);
        this.mouseRelease.dispatch(this.mouse);
    },

    onMouseWheelInternal : function(event, delta, deltaX, deltaY)
    {
        this.readMouseEvent(event, deltaY);
        this.mouse.type = "wheel";

        this.mouseEvent.dispatch(this.mouse);
        this.mouseWheel.dispatch(this.mouse);
    },

    readMouseEvent : function(event, wheelY)
    {
        // Original jQuery event
        this.mouse.originalEvent = event;

        // Target element
        if (event.target !== undefined && event.target !== null)
        {
            this.mouse.targetNodeName = event.target.localName;
            this.mouse.targetId = event.target.id;
        }
        else
        {
            this.mouse.targetNodeName = "";
            this.mouse.targetId = "";
        }

        // Relative movement
        if (this.mouse.x != null)
            this.mouse.relativeX = event.pageX - this.mouse.x;
        if (this.mouse.y != null)
            this.mouse.relativeY = event.pageY - this.mouse.y;

        // Wheel
        this.mouse.relativeZ = (wheelY != null ? wheelY : 0);

        // Mouse position
        this.mouse.x = event.pageX;
        this.mouse.y = event.pageY;

        // Buttons
        if (this.browser.isFirefox)
        {
            this.mouse.leftDown   = (event.buttons === 1);
            this.mouse.rightDown  = (event.buttons === 2);
            this.mouse.middleDown = (event.buttons === 3);
        }
        else
        {
            this.mouse.leftDown   = (event.which === 1);
            this.mouse.rightDown  = (event.which === 3);
            this.mouse.middleDown = (event.which === 2);
        }

        this.clearPendingInputStates();

        if (event.type === "mousedown")
        {
            //Handle input states
            if (this.inputStates.length > 0)
            {
                for (var i = 0; i < this.inputStates.length; i++) {

                    if (this.inputStates[i].mouseDown == -1)
                        continue;

                    var mdown = 1; //leftDown
                    if (this.mouse.rightDown)
                        mdown = 2;
                    if (this.mouse.middleDown)
                        mdown = 3;

                    var istate = this.inputStates[i];
                    var iname = istate.name;

                    if (mdown == istate.mouseDown)
                    {
                        if (this.pendingInputStates && this.pendingInputStates[iname])
                        {
                            this.pendingInputStates[iname].mouse = true;
                            if (this.pendingInputStates[iname].keyboard)
                            {
                                //Count multiplier
                                if (istate.multiplier > 0)
                                {
                                    this.pendingInputStates[iname].multiplier++;
                                    if (this.pendingInputStates[iname].multiplier == istate.multiplier)
                                    {
                                        istate.actionSignal.dispatch(this.mouse); //Dispatch
                                        delete this.pendingInputStates[iname];
                                    }
                                }
                                else
                                {
                                    istate.actionSignal.dispatch(this.mouse); //Dispatch
                                }

                            }
                        }
                        else
                        {
                            //No key bindings, no timeslot
                            if (istate.keyBindings.length == 0 && istate.multiplier == 0) // && istate.timeslot == 0)
                            {
                                istate.actionSignal.dispatch(this.mouse); //Dispatch
                            }

                            if (istate.keyBindings.length > 0 || istate.timeslot > 0)
                            {
                                //Add to pendings
                                var imouse = true;
                                var ikeyboard = true;
                                var itimeslot = 0;
                                var imultiplier = 0;
                                if (istate.multiplier > 0)
                                    imultiplier = 1;

                                if (istate.timeslot > 0)
                                {
                                    itimeslot = Date.now();
                                    itimeslot += istate.timeslot;
                                }

                                if (istate.keyBindings.length > 0)
                                    ikeyboard = false;

                                this.pendingInputStates[iname] = { mouse : imouse, keyboard : ikeyboard, timeslot : itimeslot, multiplier : imultiplier, inputstate: istate};
                            }
                        }
                    }
                    else
                    {
                        //Clear pending mouse states
                        if (this.pendingInputStates && Object.keys(this.pendingInputStates).length > 0)
                        {
                            for (var key in this.pendingInputStates)
                            {
                                if (this.pendingInputStates[key].keyboard)
                                {
                                    //Set mouse to false
                                    this.pendingInputStates[key].mouse = false;
                                }
                            }
                        }
                    }
                }
            }
        }
        else
        {
            //Delete all pending mouse states
            if (this.pendingInputStates && Object.keys(this.pendingInputStates).length > 0)
            {
                for (var key in this.pendingInputStates)
                {
                    //if (this.pendingInputStates[key].multiplier == 0)
                    if (this.pendingInputStates[key].keyboard && this.pendingInputStates[key].multiplier == 0)
                    {
                        //Set mouse to false
                        this.pendingInputStates[key].mouse = false;
                    }
                }
            }
        }
    },

    onKeyPressInternal : function(event)
    {
        this.readKeyEvent(event);
        this.keyboard.type = "press";

        this.keyEvent.dispatch(this.keyboard);
        this.keyPress.dispatch(this.keyboard);
    },

    onKeyReleaseInternal : function(event)
    {
        this.readKeyEvent(event);
        this.keyboard.type = "release";

        this.keyEvent.dispatch(this.keyboard);
        this.keyRelease.dispatch(this.keyboard);
    },

    readKeyEvent : function(event)
    {
        // Original jQuery event
        this.keyboard.originalEvent = event;

        // Target element
        if (event.target !== undefined && event.target !== null)
        {
            this.keyboard.targetNodeName = event.target.localName;
            this.keyboard.targetId = event.target.id;
        }
        else
        {
            this.keyboard.targetNodeName = "";
            this.keyboard.targetId = "";
        }

        // Key code
        this.keyboard.keyCode = event.which;
        this.keyboard.key = this.characterForKeyCode(event.which);

        // Track currenly held down keys
        this.keyboard.repeat = false;

        this.clearPendingInputStates();

        if (event.type === "keydown")
        {
            if (this.keyboard.pressed[this.keyboard.key] === true)
            {
                this.keyboard.repeat = true;
            }
            else
            {
                this.keyboard.pressed[this.keyboard.key] = true;
            }

            //Handle input states
            if (this.inputStates.length > 0)
            {
                for (var i = 0; i < this.inputStates.length; i++) {

                    if (this.inputStates[i].keyBindings.length == 0)
                        continue;

                    if (this.arraysEqual(Object.keys(this.keyboard.pressed), this.inputStates[i].keyBindings))
                    {
                        var istate = this.inputStates[i];
                        var iname = istate.name;

                        if (this.pendingInputStates && this.pendingInputStates[iname])
                        {
                            this.pendingInputStates[iname].keyboard = true;
                            if (this.pendingInputStates[iname].mouse)
                            {
                                //Count multiplier
                                if (istate.multiplier > 0)
                                {
                                    this.pendingInputStates[iname].multiplier++;
                                    if (this.pendingInputStates[iname].multiplier == istate.multiplier)
                                    {
                                        istate.actionSignal.dispatch(this.keyboard); //Dispatch
                                        delete this.pendingInputStates[iname];
                                    }
                                }
                                else
                                {
                                    istate.actionSignal.dispatch(this.keyboard); //Dispatch
                                }

                            }
                        }
                        else
                        {
                            //No mouse bindings, no timeslot
                            if (istate.mouseDown == -1 && istate.multiplier == 0) // && istate.timeslot == 0)
                            {
                                istate.actionSignal.dispatch(this.keyboard); //Dispatch
                            }

                            if (istate.timeslot > 0)
                            {
                                //Add to pendings
                                var imouse = true;
                                var ikeyboard = true;
                                var itimeslot = 0;
                                var imultiplier = 0;
                                if (istate.multiplier > 0)
                                    imultiplier = 1;

                                if (istate.timeslot > 0)
                                {
                                    itimeslot = Date.now();
                                    itimeslot += istate.timeslot;
                                }

                                if (istate.mouseDown == 1 || istate.mouseDown == 2 || istate.mouseDown == 3)
                                {
                                    imouse = false;
                                }

                                this.pendingInputStates[iname] = { mouse : imouse, keyboard : ikeyboard, timeslot : itimeslot, multiplier : imultiplier, inputstate: istate};
                            }
                        }
                    }
                    else
                    {
                        //Clear pending keyboard states
                        if (this.pendingInputStates && Object.keys(this.pendingInputStates).length > 0)
                        {
                            for (var key in this.pendingInputStates)
                            {
                                if (this.pendingInputStates[key].mouse)
                                {
                                    //Set keyboard to false
                                    this.pendingInputStates[key].keyboard = false;
                                }
                            }
                        }
                    }
                }
            }

        }
        else
        {
            delete this.keyboard.pressed[this.keyboard.key];
            //Delete all pending keyboard states
            if (this.pendingInputStates && Object.keys(this.pendingInputStates).length > 0)
            {
                for (var key in this.pendingInputStates)
                {

                    if (this.pendingInputStates[key].mouse)
                    {
                        //Set keyboard to false
                        this.pendingInputStates[key].keyboard = false;
                    }
                }
            }
        }
    },


    characterForKeyCode : function(keyCode)
    {
        // Special keys
        if (this.keys[keyCode])
            return this.keys[keyCode];
        if (this.keycodes[keyCode])
            return this.keycodes[keyCode];

        // Convert from char code
        /// @todo Fix non ascii keys
        return String.fromCharCode(keyCode).toLowerCase();
    },


    sortInputStates : function(is1, is2) //Sort by priority
    {
        if (is1.priority > is2.priority)
            return -1;
        if (is1.priority < is2.priority)
            return 1;

        return 0;
    },

    arraysEqual : function(arr1, arr2){
        return arr1.toString() === arr2.toString();
    }
});


/**
    Input plugin interface.

    @class IInputPlugin
    @constructor
    @param {String} name Name of the plugin.
*/

var IInputPlugin = Class.$extend(
{
    __init__ : function(name)
    {
        if (name === undefined)
        {
            console.error("[IInputPlugin]: Constructor called without a plugin name!");
            name = "Unknown";
        }
        this.name = name;
        this.running = false;
    },

    __classvars__ :
    {
        register : function()
        {
            var plugin = new this();
            InputAPI.registerPlugin(plugin);
        }
    },

    _start : function(container)
    {
        this.start(container);
        this.running = true;
    },

    start : function()
    {
        console.log("[IInputPlugin]: Plugin '" + name + "' has not implemented start()");
    },

    _stop : function()
    {
        this.stop();
        this.running = false;
    },

    stop : function()
    {
        console.log("[IInputPlugin]: Plugin '" + name + "' has not implemented stop()");
    },

    reset : function()
    {
    }
});


/**
    Input event interface.

    @class IInputEvent
    @constructor
    @param {String} name Event name.
*/
var IInputEvent = Class.$extend(
{
    __init__ : function(name)
    {
        if (typeof name !== "string")
        {
            console.error("IInputEvent cannot be constructed without a name. Given:", name);
            return;
        }

        /*
            Event name.
            @property name
            @type String
        */
        this.name = name;
        /*
            Event type.
            @property type
            @type String
        */
        this.type = "";
        /*
            Event type id.
            @property typeId
            @type Number
        */
        this.typeId = IInputEvent.Type.Unknown;
        /*
            Event absolute position on the X axis.
            @property x
            @type Number
        */
        this.x = null;
        /*
            Event absolute position on the Y axis.
            @property y
            @type Number
        */
        this.y = null;
        /*
            Event absolute position on the Z axis.
            Only used for 3D input devices/sensors.
            @property z
            @type Number
        */
        this.z = null;
        /*
            Event relative movement on the X axis since the last event.
            @property relativeX
            @type Number
        */
        this.relativeX = 0;
        /*
            Event relative movement on the Y axis since the last event.
            @property relativeY
            @type Number
        */
        this.relativeY = 0;
        /*
            Event relative movement on the Z axis since the last event.
            Used for eg. mouse wheel if a 2D input device.
            @property relativeZ
            @type Number
        */
        this.relativeZ = 0;
        /*
            Original event that was used to construct this input event.
            @property originalEvent
            @type Object
        */
        this.target = null;
        /*
            HTML element id that the event occurred on.
            @property targetId
            @type String
        */
        this.targetId = "";
        /*
            HTML node name e.g. "canvas" or "div".
            You can check for "canvas" to know the event occurred
            on top of the 3D rendering and not on a UI element.
            @property targetNodeName
            @type String
        */
        this.targetNodeName = "";
        /*
            Original event that was used to construct this input event.
            @property originalEvent
            @type Object
        */
        this.originalEvent = null;

        // Internal reference to prevert default if differs or not in originalEvent.
        this._preventDefaultFunction = null;
    },

    __classvars__ :
    {
        Type :
        {
            Unknown : -1
        }
    },

    toString : function()
    {
        return "InputEvent{ " + this.basePropertiesToString() + " }";
    },

    clear : function()
    {
        this.clearPosition();
    },

    basePropertiesToString : function()
    {
        return "typeId:" + this.typeId +
            " type:" + this.type +
            " x:" + this.x +
            " y:" + this.y +
            " relativeX:" + this.relativeX +
            " relativeY:" + this.relativeY +
            " relativeZ:" + this.relativeZ +

            " target:" + this.targetNodeName + (this.targetId !== "" ? "#" + this.targetId : "") +
            " originalEvent:" + (this.originalEvent != null ? "valid" :"null");
    },

    /**
        Suppresses the orginal event via preventDefault() and preventPropagation() if applicaple.
        @method suppress
        @param {Boolean} [preventDefault=true] If preventDefault() should be invoked.
        @param {Boolean} [preventPropagation=true] If preventPropagation() should be invoked.
        @return {Boolean} True if original event was valid and successfully suppressed default and/or propagation.
    */
    suppress : function(preventDefault, preventPropagation)
    {
        var success = false;
        if (typeof this.originalEvent === "object")
        {
            preventDefault = (typeof preventDefault === "boolean" ? preventDefault : true);
            if (preventDefault)
            {
                if (typeof this._preventDefaultFunction === "function")
                {
                    this._preventDefaultFunction();
                    success = true;

                    /* A custom prevent default has been set. If preventPropagation is not defined
                       default it to false. We will assume this custom prevention handler also
                       takes care of propagation. */
                    if (typeof preventPropagation !== "boolean")
                        preventPropagation = false;
                }
                else if (typeof this.originalEvent.preventDefault === "function")
                {
                    this.originalEvent.preventDefault();
                    success = true;
                }
            }

            preventPropagation = (typeof preventPropagation === "boolean" ? preventPropagation : true);
            if (preventPropagation && typeof this.originalEvent.preventPropagation === "function")
            {
                this.originalEvent.preventPropagation();
                success = true;
            }
        }
        return success;
    },

    /**
        Returns if provided element is the target of this input event.
        You can pass in a DOM Element, jQuery element or a element id/node name string.
        @method isTarget
        @param {Element|jQuery element/selector object|String} Any number of parameters are accepted, eg. isTarget("div", "h1").
        @return {Boolean}
    */
    isTarget : function()
    {
        var result = false;
        for (var i = 0; i < arguments.length; i++)
        {
            var element = arguments[i];
            if (typeof element === "string")
                result = (element === this.targetId || element === this.targetNodeName);
            else if (element instanceof Element)
                result = (element.id === this.targetId && element.localName === this.targetNodeName);
            else if (typeof element === "object" && typeof element.jquery === "string" && typeof element.get === "function")
            {
                if (element.length > 0)
                    result = this.isTarget(element.get(0));
                else
                    console.error("isTarget: Passed an empty jQuery selector:", element.selector);
            }
            else
                console.error("isTarget: Invalid element parameter:", element);

            if (result === true)
                return result;
        }
        return result;
    },

    /**
        Sets original event and tries to read target id and node name from it.
        @method setOriginalEvent
        @param {Object} event Original event.
        @return {Boolean} True if id and/or node name was read from the event.
    */
    setOriginalEvent : function(e, type)
    {
        this.originalEvent = e;

        /* Generic target element read. Override this function if 
           your event is not read properly with this. */
        if (typeof e.target === "object")
        {
            var hasId = (typeof e.target.id === "string");
            var hasNodeName = (typeof e.target.localName === "string");
            this.targetId = (hasId ? e.target.id : "");
            this.targetNodeName = (hasNodeName ? e.target.localName : "");
            this.target = e.target;
            return (hasId || hasNodeName);
        }
        else
        {
            this.targetNodeName = "";
            this.targetId = "";
            this.target = null;
            return false;
        }
    },

    /**
        Clears absolute and relative position to null. This makes
        automatic relative change tracking work correctly. Needed
        if there are no "contant" feed of events, eg. touch events.
        And eg. mouse should not require this as we always get move
        events.
        @method clearPosition
    */
    clearPosition : function()
    {
        this.setPositionAxis("x", null);
        this.setPositionAxis("y", null);
        this.setPositionAxis("z", null);
    },

    /**
        Clears relative position to be zero. Can be useful
        for reseting 'end' events to not have any movement.
        @method clearRelativePosition
    */
    clearRelativePosition : function()
    {
        this.relativeX = this.relativeY = this.relativeZ = 0;
    },

    /**
        Set x, y, z absolute and update relativeX, relativeY, relativeZ.
        Non 'number' values will result in a null axist and zero relative axis.
        @method setPosition
        @param {Number|undefined} x
        @param {Number|undefined} y
        @param {Number|undefined} z
    */
    setPosition : function(x, y, z)
    {
        this.setPositionAxis("x", x);
        this.setPositionAxis("y", y);
        this.setPositionAxis("z", z);
    },

    /**
        Set axis absolute and update relative value.
        Non 'number' values will result in a null axist and zero relative axis.
        @method setPositionAxis
        @param {String} axis Value must be "x", "y" or "z".
        @param {Number|undefined} value
    */
    setPositionAxis: function(axis, value)
    {
        var relativeAxis = "relative" + axis.toUpperCase();
        if (typeof value === "number")
        {
            this[relativeAxis] = (typeof this[axis] === "number" ? value - this[axis] : 0);
            this[axis] = value;
        }
        else
        {
            this[relativeAxis] = 0;
            this[axis] = null;
        }
    }
});