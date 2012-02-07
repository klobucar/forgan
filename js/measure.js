function Measure(audioContext, tempo) {
  // we assume 4/4 time for now
  // we assume 16th note granularity
  this.audioContext = audioContext;
  this.tempo = tempo;
  this.notes = [];
  this.sixteenthNoteTime = (60 / this.tempo) / 4; // TODO: support arbitrary note lengths
  
  this.generateNotes();

  this.totalDuration = this.computeTotalDuration();
}

Measure.prototype.playOn = function(time) {
  var startTime = time + this.audioContext.currentTime + 0.010;
  var sixteenthNoteTime = this.sixteenthNoteTime;

  var cumulativeTime = 0;
  for (var i = 0; i < this.notes.length; i++) {
    if(i == 0) {
      cumulativeTime = startTime + this.notes[i].durationModifier * sixteenthNoteTime;
      this.notes[i].playOn(startTime);
      this.notes[i].playOff(cumulativeTime);
    } else {
      var prevNote = this.notes[i - 1];
      var noteOnTime = cumulativeTime + prevNote.durationModifier * sixteenthNoteTime;
      this.notes[i].playOn(noteOnTime);
      this.notes[i].playOff(noteOnTime + this.notes[i].durationModifier * sixteenthNoteTime);
    }
  }
}

/// Halts all notes at the given time.
/// If time is 0 all notes are stopped immediately.
/// If time > 0 it represents (in seconds) the offest
/// from the audio context's current time.
Measure.prototype.playOff = function(time) {
  var stopTime = time + this.audioContext.currentTime;
  for (var i = 0; i < this.notes.length; i++) {
    this.notes[i].playOff(stopTime);
  }
}

Measure.prototype.generateNotes = function() {
  var totalDuration = 0;

  while(totalDuration < 1) {
    var note = new Note(this.audioContext);

    if(note.duration + totalDuration <= 1) {
      totalDuration += note.duration;
      this.notes.push(note);
    }
  }
}

Measure.prototype.computeTotalDuration = function() {
  var totalTime = 0;
  for (var i = 0; i < this.notes.length; i++) {
    totalTime += this.notes[i].durationModifier * this.sixteenthNoteTime;
  }
  return totalTime;
}
