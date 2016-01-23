
/**
    Provides input state for abstraction
    @class InputState
    @constructor
*/
var InputState = Class.$extend(
{

    __init__ : function(params)
    {

        this.name = params.name || ""; //Indexing property. Has to be unique within InputAPI context.
        this.keyBindings = params.keyBindings || null;
        this.mouseDown = params.mouseDown || null;
        this.timeslot = params.timeslot || 0;
        this.priority = params.priority || 100;
        this.multiplier = params.multiplier || 0;
        this.actionSignal = null;

    },

    __classvars__ :
    {
        Mouse :
        {
            LEFT_DOWN : 1,
            RIGHT_DOWN : 2,
            MIDDLE_DOWN : 3
        }

    },

    reset : function()
    {
        this.actionSignal.removeAll();
    },

    //Set name of the input state. Name can represent what the action should do e.g. Move forward.
    setName : function(paramName)
    {
        if (paramName)
            this.name = paramName;
    },

    //Set keybindings in string array e.g. [w] representing which keys must be pressed.
    setKeyBindings : function(paramKeyBindings)
    {
        if (paramKeyBindings)
            this.keyBindings = paramKeyBindings;
    },

    //Set the pressed mouse button value.
    setMouseDown : function(paramMouseDown)
    {
        if (paramMouseDown)
            this.mouseDown = paramMouseDown;
    },

    //Set time slot within the given mouse, keyboard and multiplier conditions must be true. 0 - 5000 milliseconds, where 0 means no time slot.
    setTimeslot : function(paramTimeslot)
    {
        var tsval = parseInt(paramTimeslot);
        if (isNaN(tsval))
        {
            console.log("[InputState] Time slot update failed. Value must be between 0 and 5000 milliseconds.");
            return false;
        }

        if (tsval >= 0 && tsval <= 5000)
        {
            this.timeslot = tsval;
        }
        else
        {
            console.log("[InputState] Time slot update failed. Value must be between 0 and 5000 milliseconds.");
            return false;
        }
    },

    //Set priority for this inputState. If priority is 100 the state is handled first. If the priority is 0 the state is handled last.
    setPriority : function(paramPriority)
    {
        var prval = parseInt(paramPriority);
        if (isNaN(prval))
        {
            console.log("[InputState] Priority update failed. Value must be between 0 and 100.");
            return false;
        }
        if (prval >= 0 && prval <= 100)
        {
            this.priority = prval;
        }
        else
        {
            console.log("[InputState] Priority update failed. Value must be between 0 and 100.");
            return false;
        }
    },

    //Set multiplier from 0 to 5. How many times either mouse or keyboard conditions must be true within given time slot. E.g. if you give multiplier 2, timeslot 500 and mouse
    //condition says press LEFT_DOWN, the event is fired when user presses mouse left twice within 500 milliseconds.
    setMultiplier : function(paramMultiplier)
    {

        var mpval = parseInt(paramMultiplier);
        if (isNaN(mpval))
        {
            console.log("[InputState] Multiplier update failed. Value must be between 0 and 5.");
            return false;
        }

        if (mpval > 0 && mpval <= 5)
        {
            if (this.timeslot == 0)
            {
                console.log("[InputState] Time slot cannot be 0 if multiplier is set");
                return false;
            }

            this.multiplier = mpval;
        }
        else
        {
            console.log("[InputState] Multiplier update failed. Value must be between 0 and 5.");
            return false;
        }
    }


});