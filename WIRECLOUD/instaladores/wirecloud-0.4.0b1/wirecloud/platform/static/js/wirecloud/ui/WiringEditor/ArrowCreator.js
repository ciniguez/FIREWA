/*
 *     (C) Copyright 2012 Universidad Politécnica de Madrid
 *     (C) Copyright 2012 Center for Open Middleware
 *
 *     This file is part of Wirecloud Platform.
 *
 *     Wirecloud Platform is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     Wirecloud is distributed in the hope that it will be useful, but WITHOUT
 *     ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *     FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public
 *     License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with Wirecloud Platform.  If not, see
 *     <http://www.gnu.org/licenses/>.
 *
 */

/*global Draggable, Wirecloud */

(function () {

    "use strict";

    var _cancel = function () {
        return false;
    };


    /*************************************************************************
     * Constructor
     *************************************************************************/
    /**
     * ArrowCreator.
     */
    var ArrowCreator = function ArrowCreator(canvas, data, onStart, onDrag, onFinish, canBeDragged) {
        var theArrow;
        var draggable = this;
        var currentSource, currentTarget;
        var layer = canvas.getHTMLElement().parentNode; // TODO Trampa
        canBeDragged = canBeDragged ? canBeDragged : Draggable._canBeDragged;
        this.layer = layer;
        /*************************************************************************
         * Public methods
         *************************************************************************/

        /**
         * stardrag, first step to draw a dragable arrow
         */
        this.startdrag = function startdrag(e, initAnchor) {
            var tmpPos, xStart, yStart;
            // Only process left mouse button events
            if (e.button !== 0) {
                return;
            }

            this.initAnchor = initAnchor;

            if (initAnchor instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
                initAnchor.context.iObject.wiringEditor.emphasize(initAnchor.initAnchor);
            } else {
                initAnchor.context.iObject.wiringEditor.emphasize(initAnchor);
            }

            document.oncontextmenu = _cancel; // disable context menu
            document.onmousedown = _cancel; // disable text selection in Firefox
            document.onselectstart = _cancel; // disable text selection in IE
            // enddrag when mouseup in no-anchor
            document.addEventListener('mouseup', this.enddrag, false);

            xStart = parseInt(e.clientX, 10);
            yStart = parseInt(e.clientY, 10);

            tmpPos = initAnchor.getCoordinates(layer);
            // Arrow pointer
            theArrow = canvas.drawArrow(tmpPos, tmpPos, "arrow");

            // Minimized operators
            this.initAnchor.context.iObject.potentialArrow = theArrow;
            if (initAnchor.context.iObject.isMinimized) {
                initAnchor.context.iObject.restore();
                this.initWasMinimized = true;
            } else {
                this.initWasMinimized = false;
            }

            this.theArrow = theArrow;
            theArrow.emphasize();
            // we can draw invert arrows from the end to the start
            if (initAnchor instanceof Wirecloud.ui.WiringEditor.TargetAnchor) {
                this.invert = true;
                currentSource = null;
                currentTarget = initAnchor;
                theArrow.setEnd(tmpPos, initAnchor);
            } else if (initAnchor instanceof Wirecloud.ui.WiringEditor.SourceAnchor) {
                this.invert = false;
                currentSource = initAnchor;
                currentTarget = null;
                theArrow.setStart(tmpPos, initAnchor);
            } else if (initAnchor instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
                if (initAnchor.initAnchor instanceof Wirecloud.ui.WiringEditor.TargetAnchor) {
                    this.invert = true;
                    currentSource = null;
                    currentTarget = initAnchor;
                    theArrow.setEnd(tmpPos, initAnchor.initAnchor);
                    theArrow.endMulti = initAnchor.id;
                } else if (initAnchor.initAnchor instanceof Wirecloud.ui.WiringEditor.SourceAnchor) {
                    this.invert = false;
                    currentSource = initAnchor;
                    currentTarget = null;
                    theArrow.startMulti = initAnchor.id;
                    theArrow.setStart(tmpPos, initAnchor.initAnchor);
                }
            }
            document.addEventListener("mousemove", this.drag, false);
            onStart(draggable, data);
            return false;
        };

        /**
         * drag, second step to draw a dragable arrow.
         */
        this.drag = function drag(e) {

            e = e || window.event; // needed for IE
            var x = parseInt(e.clientX, 10);
            var y = parseInt(e.clientY, 10);
            if (!this.invert) {
                theArrow.setEnd(getRelativeScreenPosition(x, y, layer));
            } else {
                theArrow.setStart(getRelativeScreenPosition(x, y, layer));
            }
            theArrow.redraw();
            onDrag(e, draggable, data, x, y);
        }.bind(this);

        /**
         * enddrag, last step to draw a dragable arrow.
         */
        this.enddrag = function enddrag(e, fAnchor) {
            // Only process left mouse button events
            if (e.button !== 0) {
                return;
            }
            this.initAnchor.context.iObject.potentialArrow = null;
            if (fAnchor !== this.initAnchor) {
                if (fAnchor != null) {
                    if (fAnchor instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
                        if (!this.invert) {
                            currentTarget = fAnchor.initAnchor;
                            theArrow.setEnd(fAnchor.getCoordinates(layer), fAnchor.initAnchor);
                            theArrow.endMulti = fAnchor.id;
                        } else {
                            currentSource = fAnchor.initAnchor;
                            theArrow.setStart(fAnchor.getCoordinates(layer), fAnchor.initAnchor);
                            theArrow.startMulti = fAnchor.id;
                        }
                    } else {
                        if (!this.invert) {
                            currentTarget = fAnchor;
                            theArrow.setEnd(fAnchor.getCoordinates(layer), fAnchor);
                        } else {
                            currentSource = fAnchor;
                            theArrow.setStart(fAnchor.getCoordinates(layer), fAnchor);
                        }
                    }
                    theArrow.deemphasize();
                    if (isVal(currentSource, currentTarget)) {
                        theArrow.calculateHighlight();
                        theArrow.calculateEmphasize();
                        theArrow.redraw();
                        // Add the arrow to the arrow list of both anchors
                        this.initAnchor.addArrow(theArrow);
                        if (this.initAnchor instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
                            this.initAnchor.initAnchor.addArrow(theArrow);
                        } else if (fAnchor instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
                            fAnchor.initAnchor.addArrow(theArrow);
                        }
                        fAnchor.addArrow(theArrow);

                        // minimized operators acctions
                        if (this.initWasMinimized) {
                            this.initAnchor.context.iObject.minimize();
                        }
                    } else {
                        theArrow.destroy();
                    }
                // mouseup out of an anchor
                } else {
                    theArrow.destroy();
                    if (this.initWasMinimized) {
                        this.initAnchor.context.iObject.minimize();
                    }
                }
            } else {
                theArrow.destroy();
            }

            if (this.initAnchor instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
                this.initAnchor.context.iObject.wiringEditor.deemphasize(this.initAnchor.initAnchor);
            } else {
                this.initAnchor.context.iObject.wiringEditor.deemphasize(this.initAnchor);
            }

            document.removeEventListener("mouseup", this.enddrag, false);
            document.removeEventListener("mousemove", this.drag, false);
            onFinish(draggable, data);
            document.onmousedown = null; // reenable context menu
            document.onselectstart = null; // reenable text selection in IE
            document.oncontextmenu = null; // reenable text selection
            currentTarget = null;
            currentSource = null;
            this.initAnchor = null;
            this.invert = null;
            return theArrow;
        }.bind(this);
    };

    /*************************************************************************
     * Private methods
     *************************************************************************/

    /**
     * isVal return if the relation between currentTarget and currentSource is
     * a valid connection or not.
     */
    var isVal = function isVal(currentSource, currentTarget) {
        var arrows, i, source, target;

        source = currentSource;
        target = currentTarget;

        if (source instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
            source = currentSource.initAnchor;
        }
        if (target instanceof Wirecloud.ui.WiringEditor.Multiconnector) {
            target = currentTarget.initAnchor;
        }
        if (source === target) {
            return false;
        }

        if (!(source instanceof Wirecloud.ui.WiringEditor.SourceAnchor) || !(target instanceof Wirecloud.ui.WiringEditor.TargetAnchor)) {
            return false;
        }

        if (target.context.iObject === source.context.iObject) {
            return false;
        }

        arrows = source.getArrows();
        for (i = 0; i < arrows.length; i++) {
            if (arrows[i].endAnchor === target) {
                return false;
            }
        }

        return true;
    };

    /**
     * Get Relative Screen Position, about from (x,y) to another element
     */
    var getRelativeScreenPosition = function getRelativeScreenPosition(x, y, element) {
        var bounding_box = element.getBoundingClientRect();
        return {
            posX: x - bounding_box.left + element.scrollLeft,
            posY: y - bounding_box.top + element.scrollTop
        };
    };

    /*************************************************************************
     * Make ArrowCreator public
     *************************************************************************/
    Wirecloud.ui.WiringEditor.ArrowCreator = ArrowCreator;
})();
