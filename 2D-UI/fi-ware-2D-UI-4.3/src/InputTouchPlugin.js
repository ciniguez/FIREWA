
/**
    Input touch event.

    @class InputEventTouch
    @extends IInputEvent
    @constructor
*/
var InputEventTouch = IInputEvent.$extend(
{
    __init__ : function()
    {
        this.$super("InputEventTouch");

        Object.defineProperties(this,
        {
            /*
                True if event has more than one contact points.
                @property isMultiTouch
                @type Boolean
            */
            isMultiTouch : {
                get : function() { return (this.pointers.length > 1) }
            }
        });
        /*
            True when the first input.
            @property isFirst
            @type Boolean
        */
        this.isFirst = false;
        /*
            True when the final (last) input.
            @property isFinal
            @type Boolean
        */
        this.isFinal = false;
        /*
            Array with all pointers, including the
            ended pointers for end events.
            @property pointers
            @type Array
        */
        this.pointers = [];
        /*
            Array with all new/moved/lost pointers.
            @property changedPointers
            @type Array
        */
        this.changedPointers = [];
        /*
            Primary pointer type, can be 'touch', 'mouse', 'pen' or 'kinect'.
            @property pointerType
            @type String
        */
        this.pointerType = "";
        /*
            Event type, can be 'start', 'move', 'end' or 'cancel'.
            @property event
            @type String
        */
        this.event = ""
        /*
            Event type id.
            @property eventId
            @type InputEventTouch.Event
        */
        this.eventId = 0;
        /*
            Movement of the X axis.
            @property deltaX
            @type Number
        */
        this.deltaX = 0;
        /*
            Movement of the Y axis.
            @property deltaY
            @type Number
        */
        this.deltaY = 0;
        /*
            Total time in msecs since the first input.
            @property deltaTime
            @type Number
        */
        this.deltaTime = 0;
        /*
            Distance moved.
            @property distance
            @type Number
        */
        this.distance = 0;
        /*
            Angle moved.
            @property angle
            @type Number
        */
        this.angle = 0;
        /*
            Current velocity on the X axis, in px/msec.
            @property velocityX
            @type Number
        */
        this.velocityX = 0;
        /*
            Current velocity on the Y axis, in px/msec.
            @property velocityY
            @type Number
        */
        this.velocityY = 0;
        /*
            Current highest velocity of the X or Y axis, in px/msec.
            @property velocity
            @type Number
        */
        this.velocity = 0;
        /*
            Direction moved.
            @property direction
            @type InputEventTouch.Direction
        */
        this.direction = 0;
        /*
            Direction moved from it's starting point.
            @property offsetDirection
            @type InputEventTouch.Direction
        */
        this.offsetDirection = 0;
        /*
            Scaling that has been done on multi-touch event.
            1 on a single touch.
            @property scale
            @type Number
        */
        this.scale = 1;
        /*
            Scaling that has been done since the last event on multi-touch event.
            0 on a single touch.
            @property relativeScale
            @type Number
        */
        this.relativeScale = 0;
        /*
            Rotation that has been done on multi-touch. 
            0 on a single touch.
            @property rotation
            @type Number
        */
        this.rotation = 0;
        /*
            Rotation that has been done since the last event on multi-touch. 
            0 on a single touch.
            @property relativeRotation
            @type Number
        */
        this.relativeRotation = 0;
        /*
            Center position for multi-touch. Average of all the contact points.
            For single touch the position of the touch.
            Uses clientX/Y, meaning the position is relative to the container
            and not the whole document.
            @property center
            @type Object Has x and y number properties.

            @todo Same duplicate info as .x and .y. Move it IInputEvent once
            mouse uses clientX/Y so this can code logic can be unified.
        */
        this.center = { x : 0, y : 0 };

        // Internal.
        this._start = false;

        this._cache =
        {
            scale    : {},
            rotation : {}
        };
        this._clearCache();
    },

    __classvars__ :
    {
        Type :
        {
            tap         : 1,
            doubletap   : 2,
            pan         : 3,
            swipe       : 4,
            press       : 5,
            pinch       : 6,
            rotate      : 7
        },

        Event :
        {
            Start   : 1,
            Move    : 2,
            End     : 4,
            Cancel  : 8
        },

        Direction :
        {
            None        : 1,
            Left        : 2,
            Right       : 4,
            Up          : 8,
            Down        : 16,
            Horizontal  : 6,
            Vertical    : 24,
            All         : 30
        },

        CommonHammerProperties :
        [
            "isFirst",
            "isFinal",
            "pointers",
            "changedPointers",
            "deltaX",
            "deltaY",
            "deltaTime",
            "distance",
            "angle",
            "velocityX",
            "velocityY",
            "velocity",
            "direction",
            "offsetDirection",
            "pointerType"
        ]
    },

    /// IInputEvent override
    clear : function()
    {
        this._start = true;
    },

    toString : function()
    {
        var str = this.name + "{ " + this.basePropertiesToString();
        return str + "\n    " + this.propertiesToString() + " }";
    },

    propertiesToString : function()
    {
        return "eventId:" + this.eventId +
            " event:" + this.event +  
            " first:" + this.isFirst +
            " last:" + this.isFinal + 
            " pointers:" + this.changedPointers.length + "/" + this.pointers.length + " " + this.pointerType +
            " delta:(" + this.deltaX + "," + this.deltaY + ")" +
            " deltaTime:" + this.deltaTime + 
            " distance:" + this.distance + 
            " angle:" + this.angle + 
            " velocity:(" + this.velocityX + "," + this.velocityY + ")" +
            " direction:" + this.direction + 
            " scale:" + this.scale + 
            " relativeScale:" + this.relativeScale + 
            " rotation:" + this.rotation + 
            " relativeRotation:" + this.relativeRotation;
    },

    _copyProperties : function(src, properties)
    {
        for (var i = 0; i < properties.length; i++)
        {
           var prop = properties[i];
           this[prop] = src[prop];
        }
    },

    _clearCache : function(typeName)
    {
        if (typeof typeName !== "string")
        {
            var types = Object.keys(InputEventTouch.Type);
            for (var ti = 0; ti < types.length; ti++)
            {
                var typeName = types[ti];
                this._cache.scale[typeName] = 1;
                this._cache.rotation[typeName] = 0;
            }
        }
        else
        {
            this._cache.scale[typeName] = 1;
            this._cache.rotation[typeName] = 0;
        }
    },

    /// IInputEvent override
    setOriginalEvent : function(e)
    {
        this.$super(e.srcEvent); // Call base impl

        this._copyProperties(e, InputEventTouch.CommonHammerProperties);
        this._preventDefaultFunction = e.preventDefault;

        this.setType(e.type);
        this.setEvent(e.eventType);

        /// @todo This does not work for "pan2"! isFirst is always false
        if (this._start === true)
        {
            this.clearPosition();
            this.clearScaleAndRotation();
            this.isFirst = true;
            this._start = false;
        }

        // @todo Refactor this.center away when mouse events use clientX/Y.
        this.setPosition(e.center.x, e.center.y);
        this.center.x = e.center.x;
        this.center.y = e.center.y;

        this.setScale(e);
        this.setRotation(e);

        // Remove any relative movement, scaling and rotation from end/cancel events.
        if (this.eventId === Hammer.INPUT_END || this.eventId === Hammer.INPUT_CANCEL)
        {
            this.clearRelativePosition();
            this.clearRelativeScaleAndRotation();
        }
    },

    setType : function(type)
    {
        if (type === "pan2")
            type = "pan";

        this.type = type;
        this.typeId = (typeof InputEventTouch.Type[type] === "number" ? InputEventTouch.Type[type] : IInputEvent.Type.Unknown);
    },

    setEvent : function(eId)
    {
        switch(eId)
        {
            case Hammer.INPUT_START:
            {
                this.event = "start";
                this._start = true;
                break;
            }
            case Hammer.INPUT_MOVE:
            {
                this.event = "move";
                break;
            }
            case Hammer.INPUT_END:
            {
                this.event = "end";
                this.isFinal = true;
                break;
            }
            case Hammer.INPUT_CANCEL:
            {
                this.event = "cancel";
                this.isFinal = true;
                break;
            }
            default:
            {
                this.log.error("setEvent: Invalid event id:", eId)
                this.event = "";
                this.eventId = -1;
                this.clearPosition();
                this.clearRelativeScaleAndRotation();
                return;
            }
        }
        this.eventId = eId;
    },

    /// IInputEvent override
    setPosition : function(x, y)
    {
        /* We must reset the first events relative position changes.
           Otherwise our calculations based on hammer.js event center pos
           will have hammer.js movement threshold in it. */
        var xNull = (this.x === null);
        var yNull = (this.y === null);

        this.$super(x, y); // Call base impl

        if (xNull)
            this.relativeX = 0;
        if (yNull)
            this.relativeY = 0;
    },

    clearScaleAndRotation : function()
    {
        this.scale = 1;
        this.rotation = 0;
        this._clearCache(this.type);
    },

    clearRelativeScaleAndRotation : function()
    {
        this.relativeScale = 0
        this.relativeRotation = 0;
    },

    setScale : function(e)
    {
        var current = this._cache.scale[e.type];
        if (e.pointers.length > 1 && typeof current === "number")
            this.relativeScale = e.scale - current;
        else
            this.relativeScale = 0;
        this._cache.scale[e.type] = this.scale = e.scale
    },

    setRotation : function(e)
    {
        var current = this._cache.rotation[e.type];
        if (e.pointers.length > 1 && typeof current === "number")
            this.relativeRotation = e.rotation - current;
        else
            this.relativeRotation = 0;
        this._cache.rotation[e.type] = this.rotation = e.rotation;
    }
});

/**
    Provides touch state and events. Accessible from {{#crossLink "InputAPI/getPlugin:method"}}InputAPI.getPlugin{{/crossLink}}("Touch").

    @class InputTouchPlugin
    @extends IInputPlugin
    @constructor
*/

var InputTouchPlugin = IInputPlugin.$extend(
{
    /**
        Event object description for touchEvent callbacks.
        @event TouchEvent
        @param {String} type "tap" | "doubletap" | "pan" | "pinch" | "pinchin" | "pinchout" | "rotate" | "press" | "swipe"
        @param {Number} x Current x position
        @param {Number} y Current y position
        @param {Number} relativeX Relative x movement since last touch event
        @param {Number} relativeY Relative y movement since last touch event
        @param {String} targetId DOM element id that the touch event occurred on
        @param {String} targetNodeName HTML node name eg. 'canvas' and 'div'. Useful for detected
        when on 'canvas' element aka the touch event occurred on the 3D scene canvas and not on top of a UI widget.
        @param {Object} originalEvent Original jQuery touch event
    */

    __init__ : function(params)
    {
        this.$super("Touch");

        this.suppressing = { "pan" : false };
        this.hammers = [];
    },

    __classvars__ :
    {
        /* We don't want to simulate touch events from mouse on desktop.
           This will mostly give "pan" events which are already implemented
           with mouse move events in InputAPI. However if on mobile, these
           should be left on to support certain devices/browsers that fake
           touch input from mouse eg. IE on Windows phones/tablets. */
        SimulateWithMouse : function() { return InputAPI.instance.browser.isMobile(); },

        /* Suppress time for any pan events after multitouch event has been stopped.
           When you do a pinch motion, you many times let go of the second finger,
           while still moving the other finger. This triggers an unfortunate
           one finger pan once all the multi touches are done.
           Configurable time in msecs for how long to suppress one finger pan
           after multitouch pan has ended. */
        SuppressMasecPanAfterMultiPan : 200
    },

    start : function(container)
    {
        /**
            Current touch state.
            @property touch
            @type InputEventTouch
        */

        this.touch = new InputEventTouch();

        //Init signals
        this.Signal = signals.Signal;

        /**
            A signal for registering to all touch events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onTouchEvent(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.touchEvent.add(onTouchEvent);

            @property touchEvent
            @type {Signal}
        */
        this.touchEvent = new this.Signal();

        /**
            A signal for registering to pan events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onPan(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.pan.add(onPan);

            @property pan
            @type {Signal}
        */
        this.pan = new this.Signal();

        /**
            A signal for registering to tap events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onTap(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.tap.add(onTap);

            @property tap
            @type {Signal}
        */
        this.tap = new this.Signal();

        /**
            A signal for registering to double tap events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onDoubleTap(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.doubleTap.add(onDoubleTap);

            @property doubleTap
            @type {Signal}
        */
        this.doubleTap = new this.Signal();

        /**
            A signal for registering to swipe events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onSwipe(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.swipe.add(onSwipe);

            @property swipe
            @type {Signal}
        */
        this.swipe = new this.Signal();

        /**
            A signal for registering to all pinch events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onPinch(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.pinch.add(onPinch);

            @property pinch
            @type {Signal}
        */
        this.pinch = new this.Signal();

        /**
            A signal for registering to pinch-in events (touch pointers go towards each other). See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onPinchIn(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.pinchIn.add(onPinchIn);

            @property pinchIn
            @type {Signal}
        */
        this.pinchIn = new this.Signal();

        /**
            A signal for registering to pinch-in events (touch pointers go away from each other). See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onPinchOut(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.pinchOut.add(onPinchOut);

            @property pinchOut
            @type {Signal}
        */
        this.pinchOut = new this.Signal();

        /**
            A signal for registering to press events (touch pointer presses on the screen for couple of seconds). See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onPress(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.press.add(onPress);

            @property press
            @type {Signal}
        */
        this.press = new this.Signal();

        /**
            A signal for registering to rotate events. See {{#crossLink "InputEventTouch"}}{{/crossLink}} for event data.
            @example
                function onRotate(event)
                {
                    // event === InputEventTouch
                }

                inputAPI.rotate.add(onRotate);

            @property rotate
            @type {Signal}
        */
        this.rotate = new this.Signal();

        // Register main container touch events
        this.registerTouchEvents(container);
    },

    stop : function()
    {
        this.reset();
    },

    reset : function()
    {
        this.touchEvent.removeAll();
        this.pan.removeAll();
        this.tap.removeAll();
        this.doubleTap.removeAll();
        this.swipe.removeAll();
        this.pinch.removeAll();
        this.pinchIn.removeAll();
        this.pinchOut.removeAll();
        this.press.removeAll();
        this.rotate.removeAll();

        for (var i = 0; i < this.hammers.length; i++)
        {
            this.hammers[i].stop(true);
            this.hammers[i].destroy();
        }

        this.hammers = [];
    },

    registerTouchEvents : function(element)
    {
        var hammer = new Hammer($(element).get(0));

        /* Configure pinch and rotate to work at the same time.
           This leaves the application to decide which one it wants to use.
           They will trigger pretty much from all >1 tounch point movement,
           so its hard to do detect which one should be triggered etc. */
        var rotate = new Hammer.Rotate();
        var pinch = new Hammer.Pinch();
        var pan2 = new Hammer.Pan({
            event       : "pan2",
            threshold   : 10,
            pointers    : 2,
            direction   : Hammer.DIRECTION_ALL
        });

        pinch.recognizeWith(rotate);
        pan2.recognizeWith([rotate, pinch]);
        hammer.add([ pan2, pinch, rotate]);

        // Configure tap movement/pos pixel thresholds to be bigger
        hammer.get("pan").set({ pointers: 0, direction : Hammer.DIRECTION_ALL });
        hammer.get("tap").set({ threshold : 10 });
        hammer.get("doubletap").set({ threshold : 10, posThreshold : 20});
        hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

        hammer.on("pan pan2", this._onPanInternal.bind(this));
        hammer.on("swipe", this._onSwipeInternal.bind(this));
        hammer.on("pinch", this._onPinchInternal.bind(this));
        hammer.on("pinchin", this._onPinchInInternal.bind(this));
        hammer.on("pinchout", this._onPinchOutInternal.bind(this));
        hammer.on("rotate", this._onRotateInternal.bind(this));
        hammer.on("press", this._onPressInternal.bind(this));
        hammer.on("tap", this._onTapInternal.bind(this));
        hammer.on("doubletap", this._onDoubleTapInternal.bind(this));

        hammer.on("hammer.input", function(e) {
            if (e.eventType === Hammer.INPUT_START)
                this.touch.clear();
        }.bind(this));

        this.hammers.push(hammer);
    },

    _onPanInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        var multiTouch = this.touch.isMultiTouch;
        if (this.touch.eventId === InputEventTouch.Event.End && multiTouch && !this.suppressing.pan)
        {
            if (typeof InputTouchPlugin.SuppressMasecPanAfterMultiPan === "number" && InputTouchPlugin.SuppressMasecPanAfterMultiPan > 0)
            {
                setTimeout(function() {
                    this.suppressing.pan = false;
                }.bind(this), InputTouchPlugin.SuppressMasecPanAfterMultiPan);
                this.suppressing.pan = true;
            }
        }
        else if (!multiTouch && this.suppressing.pan)
            return;

        switch(e.eventType)
        {
            case InputEventTouch.Event.Start:
                console.log("pan start");
                break;
            case InputEventTouch.Event.End:
                console.log("pan end");
                break;
            case InputEventTouch.Event.Move:
                console.log("pan move");
                break;
            case InputEventTouch.Event.Cancel:
                console.log("pan cancel");
                break;
        }

        switch(e.direction)
        {
            case InputEventTouch.Direction.Left:
                console.log("left");
                break;
            case InputEventTouch.Direction.Right:
                console.log("right");
                break;
            case InputEventTouch.Direction.Up:
                console.log("up");
                break;
            case InputEventTouch.Direction.Down:
                console.log("down");
                break;

        }

        this.pan.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onSwipeInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.swipe.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onPinchInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.pinch.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onPinchInInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.pinchIn.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onPinchOutInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.pinchOut.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onRotateInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.rotate.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onPressInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.press.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onTapInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.tap.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    _onDoubleTapInternal : function(e)
    {
        if (!this.readTouchEvent(e))
            return;

        this.doubleTap.dispatch(this.touch);
        this.touchEvent.dispatch(this.touch);
    },

    readTouchEvent : function(e)
    {
        /* Don't process "touch" events that are simulated from mouse events.
           This happens when running on non touch devices, eg. desktop browsers. */
        if (InputTouchPlugin.SimulateWithMouse() === false)
            if (e.pointerType === "mouse" || e.srcEvent instanceof MouseEvent)
                return false;

        this.touch.setOriginalEvent(e);
        return true;
    }
});

InputTouchPlugin.register();