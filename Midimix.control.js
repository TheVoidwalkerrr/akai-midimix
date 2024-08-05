loadAPI(1);

host.defineController("Custom Akai", "MIDI Mix", "1.0", "127e1d40-d43c-11e6-9598-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["MIDI Mix"], ["MIDI Mix"]);

var CC = {
  trackVolume: {
    lo: 2,
    hi: 9
  },
  masterVolume: {
    lo: 61,
    hi: 61
  },
  trackRecord: {
    lo: 10,
    hi: 17,
  },
  trackMute: {
    lo: 30,
    hi: 37
  },
  trackSolo: {
    lo: 20,
    hi: 27,
  },
  knobs: {
    lo: 40,
    hi: 63
  },
};

function isCCRangeMapped(mapName, cc)
{
  var map = CC[mapName];
  return (cc >= map.lo && cc <= map.hi);
}

function init()
{
  host.getMidiInPort(0).setMidiCallback(onMidi);
  rotaryKnobs = host.createUserControlsSection(24);
  for(var i = CC.knobs.lo; i <= CC.knobs.hi; i++)
  {
    rotaryKnobs.getControl(i - CC.knobs.lo).setLabel("Knob " + i);
 }

  trackBank = host.createMainTrackBank(16, 0, 0);
  masterTrack = host.createMasterTrack(0);
}

function onMidi(status, index, value)
{
  printMidi(status, index, value);

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
//RECARM
    if (isCCRangeMapped("trackRecord", index)) {
      var trackIndex = index - CC.trackRecord.lo;
      var channel = trackBank.getChannel(trackIndex);
      if (value == 0) {
        channel.getArm().toggle();
      }
      return;
    }
//MUTE
    if (isCCRangeMapped("trackMute", index)) {
      var trackIndex = index - CC.trackMute.lo;
      var channel = trackBank.getChannel(trackIndex);
      if (value == 0) {
        channel.getMute().toggle();
      }
      return;
    }
//SOLO
    if (isCCRangeMapped("trackSolo", index)) {
      var trackIndex = index - CC.trackSolo.lo;
      var channel = trackBank.getChannel(trackIndex);
      if (value == 0) {
        channel.getSolo().toggle();
      }
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
function exit()
{
  println("Thanks for using Arakash's AKAI Midimix Script!");
  println("Fixed by TheVoidwalkerrr");
}
