////// theremin //////



// arrayPropComparator
//
// Comparator for the x, y or z tip position of the pointables array.
//
// @param index Integer the index of the tipPosition [x,y,z] array to compare.
var arrayPropComparator = function (property, index, direction) {
  return function (a, b) {
    if (typeof direction === "undefined" || direction === "ASC") {
      if (a[property][index] < b[property][index]) return -1;
      if (a[property][index] > b[property][index]) return 1;
    }
    else if (direction === "DESC") {
      if (a[property][index] > b[property][index]) return -1;
      if (a[property][index] < b[property][index]) return 1;
    }
    return 0;
  }
};



// change
//
// animate the avatar, do other stuff
//
// @param data Array the array of position data used in the animation.
var change = function (hand) {
  var leapX = hand.palmPosition[0],
      leapY = hand.palmPosition[1],
      leapZ = hand.palmPosition[2],
      leapTilt = hand.palmNormal[0],
      x = parseInt(convert(leapX, positionRangeX, translateRangeX), 10),
      y = parseInt(convert(leapY, positionRangeY, translateRangeY), 10),
      z = parseInt(convert(leapY, positionRangeY, translateRangeZ), 10),
      xyz = [x,y,z],
      tilt = Math.abs(leapTilt);
  if ( Math.abs(x) < docWidth / 2 &&
       Math.abs(y) < docHeight / 2 ) {

    lastValidHand = hand; // save the pointable as a valid one
    animate(avatar, xyz);       // perform animation
    catchRadius = 10; // reset catchRadius

    if (synth && synth.playing) {
        synth.changePitch(convert(leapY, positionRangeY, getRange(synth.scale))); // tune the oscillator if this is the first pointable
        synth.changeGain(convert(tilt, palmNormalRangeX, [1, 0]));
        synth.changeDelay(convert(leapX, positionRangeX, [.001, 0.75]));
        synth.changeFilter(convert(hand.sphereRadius, sphereRadiusRange, [.001, 1.0]));
    }
  }
};






var synth = new Synth;

var positionRangeX = [-200, 200];
var positionRangeY = [50, 400];
var positionRangeZ = [-200, 200];
var sphereRadiusRange = [0, 130];
var palmNormalRangeX = [0, 0.75];

var docWidth = document.width;
var docHeight = document.height;
var translateRangeX = [(docWidth / 2) * -1, (docWidth / 2)];
var translateRangeY = [(docHeight / 2), (docHeight / 2) * -1];
var translateRangeZ = [(docWidth / 2) * -1, (docWidth / 2)];

var dataContainer = document.getElementById("pointable-data");

var avatar = document.getElementById("avatar");

// center the avatar
avatar.style.left = (docWidth / 2) - (avatar.offsetWidth / 2) + "px";
avatar.style.top = (docHeight / 2) - (avatar.offsetHeight / 2) + "px";


var lastValidHand = null;
var catchRadius = 10;



Leap.loop({}, function(frame) {
  // NOTES:
  // -> "this" in this context is the Controller object.
  // -> we also have the current Frame object locally available here as the "frame" variable.
  // -> The CircularBuffer history of frames is available as this.history.
  // -> we can get specific frames either through this.history.get(index) or through this.frame(index)
  //      -> index zero is the current frame
  //      -> this.frame will return an invalid frame if the frame at specified index is not there.
  //      -> perhaps due to requestAnimationFrame, we are not getting every Leap frame id in perfect sequence.

  var controller = this,
    dataString = "";

  if (frame.hands.length > 0) {

    // Before starting the synth and playing a note, verify it's not already playing,
    // and that there is a decent amount of valid history.  This removes spurious notes.
    var validHistory = true;
    for (var i = 0; i < 20; i++) {
      if (!lastValidHand || !controller.frame(i).hand(lastValidHand.id).valid) validHistory = false;
    }
    if (!synth.playing && validHistory) synth.start();

    avatar.style.visibility = "visible";


    if (lastValidHand) {

      // Ideally, the previously valid hand id should point to a valid hand in the current frame.
      if (frame.hand(lastValidHand.id).valid) {
        change(frame.hand(lastValidHand.id), i);
      }
      // But if it doesn't, check to see if any of the current hands are nearby.
      // In this scheme, if the hand is lost, we need to "catch" it again.
      // The catch area increases by one millimeter per frame, i.e. 30 millimeters in about half a second.
      else {

        var noneFound = true;
        frame.hands.forEach(function (hand) {
          if ( Math.abs(hand.palmPosition[0] - lastValidHand.palmPosition[0]) < catchRadius &&   // nearby x
               Math.abs(hand.palmPosition[1] - lastValidHand.palmPosition[1]) < catchRadius ) {  // nearby y
            // console.log("use a nearby hand");
            change(hand, i);
            noneFound = false;
          }
        });

        if (noneFound && catchRadius < 20) { // max re-catch radius of 20 millimeters
          catchRadius += 1;
        }


      }
    }
    else {
      // console.log("use a new pointable because none are valid");
      change(frame.hands[0]);
    }


    if (lastValidHand) {
      dataString += lastValidHand.palmPosition + "<br />";
    }



    dataString += frame.hands.map(function (hand) {
      return "Hand " + hand.id + "<br />"
                     + hand.palmPosition + "<br />"
                     + hand.palmNormal + "<br />";
    }).join("<br />") + "<br />";

  }
  else {
    synth.stop();
    dataString = "no data";

    avatar.style.visibility = "hidden";
    avatar.style.webkitTransform = "translate3d(0, 0, 0)";

    lastValidHand = null;
  }
  dataContainer.innerHTML = dataString;
});