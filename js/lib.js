///////////// lib //////////////



// comparator
//
// Get a comparator function for use with an array of objects or an array of arrays.
//
// @param property String the object property or array index to compare.
var comparator = function (property) {
  return function (a, b) {
    if (a[property] < b[property]) return -1;
    if (a[property] > b[property]) return 1;
    return 0;
  }
};



// convert
//
// Converts a number in range A to a number in range B.
//
// @param aRangeVal Number
// @param aRange Array [min, max]
// @param bRange Array [min, max]
var convert = function (aRangeVal, aRange, bRange) {
  return ((aRangeVal - aRange[0]) / (aRange[1] - aRange[0])) * (bRange[1] - bRange[0]) + bRange[0];
};



// compact
//
// Compacts an array by removing unneeded values.
// By default it removes all falsy values, but it can be set to remove specific values such as undefined.
//
// @param arr Array the array to compact
// @param val Value any value to not include in the returned array.  The special flag "falsyExceptZero" may be used as well.
var compact = function (arr, val) {
  var len = arr.length,
    i = len - 1,
    valPresent = typeof val !== "undefined";
  for (; i >= 0; i--) {
    if (valPresent) {
      if (val === "falsyExceptZero" && (arr[i] !== 0 && !arr[i])) {
        arr.splice(i, 1);
      }
      else if (val === arr[i]) {
        arr.splice(i, 1);
      }
    }
    else if (!arr[i]) {
      arr.splice(i, 1);
    }
  }
  return arr;
};



// animate
//
// animate an element with a 3d transform
//
// @param elem
// @param xyz
var animate = function (elem, xyz) {
  elem.style.webkitTransform = "translate3d(" + xyz[0] + "px, " + xyz[1] + "px, " + xyz[2] + "px)";
};



// closest
//
// Finds closest number.  Also known as "quantizing".
//
// from: http://stackoverflow.com/questions/8584902/get-nearest-number-out-of-array
//
var closest = function (num, arr) {
  var curr = arr[0];
  var diff = Math.abs(num - curr);
  for (var val = 0; val < arr.length; val++) {
    var newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
    }
  }
  return curr;
};



// getRange
//
var getRange = function (arr) {
  return [arr[0], arr[arr.length - 1]];
};