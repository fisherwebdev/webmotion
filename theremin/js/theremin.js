////// theremin //////



// tipPositionComparator
//
// Comparator for the x, y or z tip position of the pointables array.
//
// @param index Integer the index of the tipPosition [x,y,z] array to compare.
var tipPositionComparator = function (index, direction) {
  return function (a, b) {
    if (typeof direction === "undefined" || direction === "ASC") {
      if (a.tipPosition[index] < b.tipPosition[index]) return -1;
      if (a.tipPosition[index] > b.tipPosition[index]) return 1;
    }
    else if (direction === "DESC") {
      if (a.tipPosition[index] > b.tipPosition[index]) return -1;
      if (a.tipPosition[index] < b.tipPosition[index]) return 1;
    }
    return 0;
  }
};



// change
//
// animate the avatar, do other stuff
//
// @param data Array the array of position data used in the animation.
var change = function (pointable, index) {

  // if the pointable is the same as pointable on the other index, do nothing
//  if (validPointables.length > 1 && pointable.id === validPointables[+!index].id) {
//    //console.log("pointables are identical");
//    return;
//  }

  var leapX = pointable.tipPosition[0],
      leapY = pointable.tipPosition[1],
      leapZ = pointable.tipPosition[2],
      x = parseInt(convert(leapX, positionRangeX, translateRangeX), 10),
      y = parseInt(convert(leapY, positionRangeY, translateRangeY), 10),
      z = 0,
      xyz = [x,y,z];
  if ( Math.abs(x) < docWidth / 2 &&
       Math.abs(y) < docHeight / 2 &&
       index === 0 || !validPointables[0] || validPointables[0].id !== pointable.id ) {

    validPointables[index] = pointable; // save the pointable as a valid one
    animate(avatars[index], xyz);       // perform animation
    catchRadii[index] = 10; // reset catchRadius

    if (synth && synth.playing) {
      if (index === 0) {
        synth.changePitch(convert(leapY, positionRangeY, getRange(synth.scale))); // tune the oscillator if this is the first pointable
        synth.changeGain(convert(leapZ, positionRangeZ, [1, 0]));
      }
      else {
        synth.changeDelay(convert(leapX, positionRangeX, [.001, 0.7]));
        synth.changeFilter(convert(leapY, positionRangeY, [.001, 1.0]));
      }
    }

  }
  else {
    // console.log("beyond the edge");
  }
};



// getPointable
//
// gets the two front pointables and then sorts them by the x-axis,
// with the sort order dependent on whether we are looking for the left or right one.
//
var getPointable = function (frame, index) {
  var xComparator = index === 0 ? tipPositionComparator(0) : tipPositionComparator(0, "DESC"),
      zComparator = tipPositionComparator(2),
      forwardPointables = frame.pointables.sort(zComparator).slice(0, 2);
  return forwardPointables.sort(xComparator)[0];
}


var synth = new Synth;

var positionRangeX = [-200, 200];
var positionRangeY = [50, 400];
var positionRangeZ = [-200, 200];

var docWidth = document.width;
var docHeight = document.height;
var translateRangeX = [(docWidth / 2) * -1, (docWidth / 2)];
var translateRangeY = [(docHeight / 2), (docHeight / 2) * -1];

var dataContainer = document.getElementById("pointable-data");

var avatars = Array.prototype.slice.call(document.querySelectorAll(".avatar"));

// center the avatars
avatars.forEach(function (avatar) {
  avatar.style.left = (docWidth / 2) - (avatar.offsetWidth / 2) + "px";
  avatar.style.top = (docHeight / 2) - (avatar.offsetHeight / 2) + "px";
});

validPointables = [];
var catchRadii = [10, 10];



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

  if (frame.pointables.length > 0) {

    // Before starting the synth and playing a note, verify it's not already playing,
    // and that there is a decent amount of valid history.  This removes spurious notes.
    var validHistory = true;
    for (var i = 0; i < 20; i++) {
      if (!validPointables[0] || !controller.frame(i).pointable(validPointables[0].id).valid) validHistory = false;
    }
    if (!synth.playing && validHistory) synth.start();

    avatars.forEach(function (avatar) {
      avatar.style.visibility = "visible";
    });

    var i = 0,
        len = Math.min(frame.pointables.length, 2);

    for (; i < len; i++) {

      if (validPointables[i]) {
        var validPointable = validPointables[i];

        // Ideally, the previously valid pointable id should point to a valid pointable in the current frame.
        if (frame.pointable(validPointable.id).valid) {
          change(frame.pointable(validPointable.id), i);
        }
        // But if it doesn't, check to see if any of the current pointables are nearby.
        // In this scheme, if the pointer is lost, we need to "catch" it again.
        // The catch area increases by one millimeter per frame, i.e. 30 millimeters in about half a second.
        else {

          var catchRadius = catchRadii[i];

          var noneFound = true;
          frame.pointables.forEach(function (pointable) {
            if ( Math.abs(pointable.tipPosition[0] - validPointable.tipPosition[0]) < catchRadius &&   // nearby x
              Math.abs(pointable.tipPosition[1] - validPointable.tipPosition[1]) < catchRadius ) {     // nearby y
              // console.log("use a nearby pointable");
              change(pointable, i);
              noneFound = false;
            }
          });

          if (noneFound && catchRadius < 20) { // max re-catch radius of 20 millimeters
            catchRadii[i] += 1;
          }


        }
      }
      else {
        // console.log("use a new pointable because none are valid");
        change(getPointable(frame, i), i);
      }

      dataString += avatars[i].id + "<br />";
      if (validPointables[i]) {
        dataString += validPointables[i].tipPosition + "<br />";
      }
    } // end of loop over two pointables


    dataString += frame.pointables.map(function (pointable) {
      return "Pointable " + pointable.id + "<br />" + pointable.tipPosition;
    }).join("<br />") + "<br />";

  }
  else {
    synth.stop();
    dataString = "no data";
    avatars.forEach(function (avatar) {
      avatar.style.visibility = "hidden";
      avatar.style.webkitTransform = "translate3d(0, 0, 0)";
    });
    validPointables = [];
  }
  dataContainer.innerHTML = dataString;
});