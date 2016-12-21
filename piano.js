var canvas;
var ctx;
var onBlackKey = false;

var keyWidth;
var keys = [];
var blackKeys = [];
var notes = [];

var naturals = [];
var sharps = [];

function generateNoteValues() {
    var numKeys = 88;
    var startNote = "C3"

    var i = 0;
    var started = false;
    for (var n in NOTES) {
        if ((n == startNote || started) && i < numKeys) {
            started = true;
            if (n.includes("s")) {
                sharps.push(NOTES[n]);
            } else {
                naturals.push(NOTES[n]);
            }
            i++;
        }
    }
}

generateNoteValues();

function setCanvasSize() {
    canvas.width = window.innerWidth;
    if (window.innerHeight < window.innerWidth / 4) {
        canvas.height = window.innerHeight;
    } else {
        canvas.height = window.innerWidth / 4;
    }
    keyWidth = canvas.width / 14;
    drawPiano();
}

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    setCanvasSize();
    
    //todo: figure out what"s breaking events on touch, how touch works, handle sliding
    canvas.addEventListener("touchstart", function(e) {
        var pos = getMousePos(e);
        var touch = e.touches[e.touches.length - 1];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("touchend", function(e) {
            var mouseEvent = new MouseEvent("mouseup", {});
            canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("mousedown", function(e) {

        var pos = getMousePos(e);

        var i = keys.length - 1;
        var played = false;
        while (!played && i >= 0) {
            if (keys[i].contains(pos.x, pos.y) && !keys[i].started) {
                keys[i].start();
                played = true;
            }
            i--;
        }
        /*
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].contains(pos.x, pos.y) && !keys[i].started) {
                keys[i].start();
            }
        }
        */
    });

    canvas.addEventListener("mouseup", function(e) {
        var pos = getMousePos(e);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].contains(pos.x, pos.y) && keys[i].started){
                keys[i].stop();
            }
        }
    });

    canvas.addEventListener("mouseout", function(e) {
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].started) {
                keys[i].stop();
            }
        }
    });

    canvas.addEventListener("mousemove", function(e) {
        var pos = getMousePos(e);
        for (var i = 0; i < keys.length; i++) {
            if (!keys[i].contains(pos.x, pos.y) && keys[i].started) {
                keys[i].stop();
            } 
            else if (keys[i].contains(pos.x, pos.y) && !keys[i].started && e.which != 0) {
                keys[i].start();
            }
        }

    // Prevent scrolling when touching the canvas
    document.body.addEventListener("touchstart", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchend", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchmove", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);

    window.addEventListener("resize", setCanvasSize, false);
}

function playKey(e) {

}

function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return {x: x, y: y};

}

function drawPiano() {
    keys = [];
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "gray";

    for (var i = 0; i <= canvas.width / keyWidth; i++) {
        keys.push(new Key(i * keyWidth, 0, keyWidth, canvas.height, "white", naturals[i]));
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0)
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    addBlackKeys();

    for (var i = 0; i < keys.length; i++) {
        keys[i].draw();
    }
}
function addBlackKeys() {
    var n = 0;
    for (var i = 0; i < keys.length; i++) {
        if (sharps[n] < keys[i].pitch) {
            addBlackKey(i, n);
            n++;
        }
    }
}

function addBlackKey(pos, note) {
    var k = new Key(pos * keyWidth - keyWidth / 4, 0, keyWidth / 2, canvas.height / 2, "black", sharps[note])
    keys.push(k);
    blackKeys.push(k);
}

class Key {
    constructor(x, y, width, height, type, pitch) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.type = type;
        this.pitch = pitch;
        this.note = new Note(this.pitch);
        this.started = false;
    }

    contains(x, y) {
        if (x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height) {
            if (this.type == "white") {
                for (var i = 0; i < blackKeys.length; i++) {
                    if (blackKeys[i].contains(x, y)) {
                        return false;
                    }
                }
                return true;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    draw() {
        if (this.type == "black") {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        }
    }
    
    start() {
        this.note = new Note(this.pitch);
        this.note.start(0);
        this.started = true;
    }

    stop() {
        this.note.stop(0);
        this.started = false;
    }
}

