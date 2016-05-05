
(function() {




// Create audio (context) container
var audioCtx = new (AudioContext || webkitAudioContext)();

// Table of notes with correspending keyboard codes. Frequencies are in hertz.
// The notes start from middle C

var getNotes = function(c){
return  {
      //c1
      'Q': { noteName: 'c4', frequency: c, keyName: 'q', color: "white"},
        '2': { noteName: 'c#', frequency: c * (25/24), keyName: '2', color: "black" },
      'W': { noteName: 'd', frequency: c * (9/8), keyName: 'w', color: "white" },
        '3': { noteName: 'd#', frequency: c * (6/5), keyName: '3', color: "black" },
      'E': { noteName: 'e', frequency:  c * (5/4), keyName: 'e', color: "white"},

      'R': { noteName: 'f', frequency:  c * (4/3), keyName: 'r', color: "white"},
        '5': { noteName: 'f#', frequency: c * (45/32), keyName: '5', color: "black" },
      'T': { noteName: 'g', frequency: c * (3/2), keyName: 't', color: "white"},
        '6': { noteName: 'g#', frequency: c * (8/5), keyName: '6', color: "black" },
      'Y': { noteName: 'a', frequency: c * (5/3), keyName: 'y', color: "white"},
        '7': { noteName: 'a#', frequency: c * (9/5), keyName: '7', color: "black" },
      'U': { noteName: 'b', frequency:  c * (15/8), keyName: 'u', color: "white"},
      //c2
      'I': { noteName: 'c5', frequency: c * 2, keyName: 'i', color: "white"},
        '9': { noteName: 'c#', frequency: c * 2 * (25/24), keyName: '9', color: "black" },
      'O': { noteName: 'd', frequency: c * 2 * (9/8), keyName: 'o', color: "white"},
        '0': { noteName: 'd#', frequency: c * 2  * (6/5), keyName: '0', color: "black" },
      'P': { noteName: 'e', frequency: c * 2 * (5/4), keyName: 'p', color: "white"},

      'Z': { noteName: 'f', frequency:  c * 2 * (4/3), keyName: 'Z', color: "white"},
        'S': { noteName: 'f#', frequency: c * 2 * (45/32), keyName: 'S', color: "black" },
      'X': { noteName: 'g', frequency: c * 2 * (3/2), keyName: 'X', color: "white"},
        'D': { noteName: 'g#', frequency: c * 2 * (8/5), keyName: 'D', color: "black" },
      'C': { noteName: 'a', frequency: c * 2 * (5/3), keyName: 'C', color: "white"},
        'F': { noteName: 'a#', frequency: c * 2 * (9/5), keyName: 'F', color: "black" },
      'V': { noteName: 'b', frequency:  c * 2 * (15/8), keyName: 'V', color: "white"},
      //c2
      'B': { noteName: 'c6', frequency: c * 4, keyName: 'B', color: "white"},
        'H': { noteName: 'c#', frequency: c * 4 * (25/24), keyName: 'H', color: "black" },
      'N': { noteName: 'd', frequency: c * 4 * (9/8), keyName: 'N', color: "white"},
        'J': { noteName: 'd#', frequency: c * 4  * (6/5), keyName: 'J', color: "black" },
      'M': { noteName: 'e', frequency: c * 4 * (5/4), keyName: 'M', color: "white"},

      188 : { noteName: 'f', frequency:  c * 4 * (4/3), keyName: ',', color: "white"},
        'L': { noteName: 'f#', frequency: c * 4 * (45/32), keyName: 'L', color: "black" },
      190: { noteName: 'g', frequency: c * 4 * (3/2), keyName: '.', color: "white"},
        186: { noteName: 'g#', frequency: c * 4 * (8/5), keyName: ';', color: "black" },
      191: { noteName: 'a', frequency: c * 4 * (5/3), keyName: '/', color: "white"},

  };
}

var notesByKeyCode = getNotes(130.813);

function Key(noteName, keyName, frequency, color) {
    var keyHTML = $('<div></div>');
    var keySound = new Sound(frequency, 'triangle');

    /* Style the key */
    $(keyHTML).addClass('key ' + color);
    var inner = $('<br><span>' + keyName + '</span>');
    $(keyHTML).append(inner);
    return {
        html: keyHTML,
        sound: keySound
    };
}

function Sound(frequency, type) {
    this.gainNode = audioCtx.createGain();
    this.osc = audioCtx.createOscillator(); // Create oscillator node
    this.pressed = false; // flag to indicate if sound is playing
    this.osc.connect(this.gainNode);
    this.gainNode.gain.value = 0;
    /* Set default configuration for sound */
    if(typeof frequency !== 'undefined') {
        /* Set frequency. If it's not set, the default is used (440Hz) */
        this.osc.frequency.value = frequency;
    }

    /* Set waveform type. Default is actually 'sine' but triangle sounds better :) */
    this.osc.type = type || 'triangle';

    /* Start playing the sound. You won't hear it yet as the oscillator node needs to be
    piped to output (AKA your speakers). */
    this.osc.start(0);
};

Sound.prototype.play = function() {
    if(!this.pressed) {
        this.pressed = true;
        this.gainNode.connect(audioCtx.destination);
        this.gainNode.gain.value = .2;
    }
};

Sound.prototype.stop = function() {
    this.pressed = false;
    this.gainNode.gain.value =0;

};

function createKeyboard(notes, containerId) {

    const host = location.origin.replace(/^http/, 'ws')
    var ws = new WebSocket(host);

    ws.onmessage = function (event) {
      const txt = JSON.parse(event.data);
      console.log(txt)
      if(txt.length>1)
        console.log(txt)
        if(txt.charAt(0)==='D') playNote2(txt[1])
        else if(txt.charAt(0)==='U') endNote2(txt[1])
        else if(txt.charAt(0)==='M') readMsg(txt.slice(1))
    };

    var sortedKeys = []; // Placeholder for keys to be sorted
    var waveFormSelector = document.getElementById('soundType');

    for(var keyCode in notes) {
        var note = notes[keyCode];

        /* Generate playable key */
        note.key = new Key(note.noteName, note.keyName, note.frequency, note.color);

        /* Add new key to array to be sorted */
        sortedKeys.push(notes[keyCode]);
    }

    /* Sort keys by frequency so that they'll be added to the DOM in the correct order */
    sortedKeys = sortedKeys.sort(function(note1, note2) {
        if (note1.frequency < note2.frequency) return -1;
        if (note1.frequency > note2.frequency) return 1;

        return 0;
    });

    // Add those sorted keys to DOM
    for(var i = 0; i < sortedKeys.length; i++) {
        $(containerId).append(sortedKeys[i].key.html);
    }

    var playNote = function(event) {
        var keyCode = String.fromCharCode(event.keyCode);
        if(typeof notesByKeyCode[keyCode] !== 'undefined') {
            // Pipe sound to output (AKA speakers)
            notesByKeyCode[keyCode].key.sound.play();
            // Highlight key playing
            $(notesByKeyCode[keyCode].key.html).addClass('playing');
        }
        else if(typeof notesByKeyCode[event.keyCode] !== 'undefined'){
            notesByKeyCode[event.keyCode].key.sound.play();
            $(notesByKeyCode[event.keyCode].key.html).addClass('playing');
        }
    };
    var playNote2 = function(keyCode) {
        if(typeof notesByKeyCode[keyCode] !== 'undefined') {
            // Pipe sound to output (AKA speakers)
            notesByKeyCode[keyCode].key.sound.play();
            // Highlight key playing
            $(notesByKeyCode[keyCode].key.html).addClass('playing');
        }
        else if(typeof notesByKeyCode[event.keyCode] !== 'undefined'){
            notesByKeyCode[event.keyCode].key.sound.play();
            $(notesByKeyCode[event.keyCode].key.html).addClass('playing');
        }
    };
    var endNote = function(event) {
        var keyCode = String.fromCharCode(event.keyCode);
        if(typeof notesByKeyCode[keyCode] !== 'undefined') {
            // Kill connection to output
            notesByKeyCode[keyCode].key.sound.stop();
            // Remove key highlight
            $(notesByKeyCode[keyCode].key.html).removeClass('playing');
        }
        else if(typeof notesByKeyCode[event.keyCode] !== 'undefined'){
            notesByKeyCode[event.keyCode].key.sound.stop();
            $(notesByKeyCode[event.keyCode].key.html).removeClass('playing');
        }
    };

    var endNote2 = function(keyCode) {
        if(typeof notesByKeyCode[keyCode] !== 'undefined') {
            // Kill connection to output
            notesByKeyCode[keyCode].key.sound.stop();
            // Remove key highlight
            $(notesByKeyCode[keyCode].key.html).removeClass('playing');
        }
        else if(typeof notesByKeyCode[event.keyCode] !== 'undefined'){
            notesByKeyCode[event.keyCode].key.sound.stop();
            $(notesByKeyCode[event.keyCode].key.html).removeClass('playing');
        }
    };

    var setWaveform = function(event) {
        for(var keyCode in notes) {
            notes[keyCode].key.sound.osc.type = this.value;
        }

        // Unfocus selector so value is not accidentally updated again while playing keys
        this.blur();
    };

    // Check for changes in the waveform selector and update all oscillators with the selected type
    waveFormSelector.addEventListener('change', setWaveform);

    $("html").keydown(function( event ) {
        /*
      if ( event.which == "space" ) {
       event.preventDefault();
      }
      */
      ws.send("D" + String.fromCharCode(event.keyCode) )
      playNote(event);
      //console.log(String.fromCharCode(event.keyCode));
    });
    $("html").keyup(function( event ) {
        /*
      if ( event.which == "space" ) {
       event.preventDefault();
      }
      */
      ws.send("U" + String.fromCharCode(event.keyCode) )
      endNote(event);
      //console.log(String.fromCharCode(event.keyCode));
    });

    //window.addEventListener('keydown', playNote);
    //window.addEventListener('keyup', endNote);
}

function sendChat(){
    const msgInput = document.getElementById("chatMessage")
    if(msgInput.value.length>0) ws.send("M" + msgInput.value)
}


window.addEventListener('load', function() {
    createKeyboard(notesByKeyCode, '#keyboard');
    $("#chatSendBtn").on('click', sendChat())
});
})();
