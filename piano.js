//todo: don't activate white key if black key pressed
var canvas;
var ctx;
var keyWidth;
var keys = [];
var notes = [];

var naturals = [];
var sharps = [];
function generateNoteValues() {
    var numKeys = 24;
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
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    setCanvasSize();
    
    window.addEventListener('touchstart', function(e) {
        var pos = getMousePos(e);
        var touch = e.touches[e.touches.length - 1];
        var mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    window.addEventListener('touchend', function(e) {
            var mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
    });

    window.addEventListener('mousedown', function(e) {

        var pos = getMousePos(e);

        var i = keys.length - 1;
        var played = false;
        while (!played && i >= 0) {
            if (keys[i].contains(pos.x, pos.y)) {
                n = new Note(keys[i].note);
                notes.push(n);
                n.start(0);
                played = true;
            }
            i--;
        }
    });
    window.addEventListener('mouseup', function(e) {
        for (var i = 0; i < notes.length; i++) {
            notes[i].stop(0);
        }
    });

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

    window.addEventListener('resize', setCanvasSize, false);
}
function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    return {x: x, y: y}

}
function drawPiano() {
    keys = [];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'gray';

    for (var i = 0; i <= canvas.width / keyWidth; i++) {
        keys.push(new Key(i * keyWidth, 0, keyWidth, canvas.height, 'white', naturals[i]));
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
        if (sharps[n] < keys[i].note) {
            addBlackKey(i, n);
            n++;
        }
    }
}

function addBlackKey(pos, note) {
    keys.push(new Key(pos * keyWidth - keyWidth / 4, 0, keyWidth / 2, canvas.height / 2, 'black', sharps[note]))
}

class Key {
    constructor(x, y, w, h, t, n) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        this.type = t;
        this.note = n;
    }

    contains(x, y) {
        if (x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height) {
            return true;
        } else {
            return false;
        }
    }
    draw() {
        if (this.type == 'black') {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        }
    }

}

