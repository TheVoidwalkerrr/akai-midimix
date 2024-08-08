loadAPI(2);

host.defineController("Akai", "MIDI Mix", "1.0", "127e1d40-d43c-11e6-9598-0800200c9a66", "V01DWLKR");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["MIDI Mix"], ["MIDI Mix"]);

var NoteOn = 0x90;
var NoteOff = 0x80;

var NOTE = {
  trackRecord: {
    lo: 3,
    hi: 24,
    map: [3, 6, 9, 12, 15, 18, 21, 24]
  },
  trackMute: {
    lo: 1,
    hi: 22,
    map: [1, 4, 7, 10, 13, 16, 19, 22]
  },
  trackSolo: {
    lo: 2,
    hi: 23,
    map: [2, 5, 8, 11, 14, 17, 20, 23]
  }
};

var CC = {
  trackVolume: {
    lo: 2,
    hi: 9
  },
  masterVolume: {
    lo: 64,
    hi: 64
  },
  knobs: {
    lo: 40,
    hi: 63
  }
};

var trackBank;
var masterTrack;
var rotaryKnobs;

function isNoteMapped(mapName, note) {
  var map = NOTE[mapName].map;
  return map.includes(note);
}

function isCCRangeMapped(mapName, cc) {
  var map = CC[mapName];
  return (cc >= map.lo && cc <= map.hi);
}

function sendMidi(status, data1, data2) {
  host.getMidiOutPort(0).sendMidi(status, data1, data2);
}

function updateLed(track, property, note) {
  property.addValueObserver(function(isOn) {
    sendMidi(NoteOn, note, isOn ? 127 : 0);
  });
}

function init() {
  host.getMidiInPort(0).setMidiCallback(onMidi);
  rotaryKnobs = host.createUserControlsSection(24);
  trackBank = host.createMainTrackBank(8, 0, 0);
  masterTrack = host.createMasterTrack(0);

  for (var i = 0; i < 8; i++) {
    var track = trackBank.getChannel(i);
    updateLed(track, track.getArm(), NOTE.trackRecord.map[i]);
    updateLed(track, track.getMute(), NOTE.trackMute.map[i]);
    updateLed(track, track.getSolo(), NOTE.trackSolo.map[i]);
  }
}

function onMidi(status, index, value) {
  printMidi(status, index, value);

  if (status == NoteOn && value == 127) {
    var trackIndex;

    // RECARM
    if (isNoteMapped("trackRecord", index)) {
      trackIndex = NOTE.trackRecord.map.indexOf(index);
      var armChannel = trackBank.getChannel(trackIndex);
      armChannel.getArm().toggle();
      return;
    }
    // MUTE
    if (isNoteMapped("trackMute", index)) {
      trackIndex = NOTE.trackMute.map.indexOf(index);
      var muteChannel = trackBank.getChannel(trackIndex);
      muteChannel.getMute().toggle();
      return;
    }
    // SOLO
    if (isNoteMapped("trackSolo", index)) {
      trackIndex = NOTE.trackSolo.map.indexOf(index);
      var soloChannel = trackBank.getChannel(trackIndex);
      soloChannel.getSolo().toggle();
      return;
    }
  }

  // CC
  if (isChannelController(status)) {
    // VOLUME
    if (isCCRangeMapped("trackVolume", index)) {
      var trackIndex = index - CC.trackVolume.lo;
      var channel = trackBank.getChannel(trackIndex);
      channel.getVolume().setRaw(value / 127);
      return;
    }
    //MASTER VOLUME
    if (isCCRangeMapped("masterVolume", index)) {
      var trackIndex = index - CC.masterVolume.lo;
      var channel = trackBank.getChannel(trackIndex);
      masterTrack.getVolume().setRaw(value / 127);

      return;
    }
    //KNOBS
    if (isCCRangeMapped("knobs", index)) {
      var knob = index - CC.knobs.lo;
      rotaryKnobs.getControl(knob).set(value, 128);
      return;
    }
  }
}

function isChannelController(status) {
  return (status & 0xF0) == 0xB0;
}

function exit()
{
  println("Thanks for using Arakash's AKAI Midimix Script!");
  println("Fixed by TheVoidwalkerrr");
}
