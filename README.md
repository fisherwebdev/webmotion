Web Motion: leapjs experiments
==============================
These experiments were created to run from a localhost server.  The URLs below assume you can serve the project as http://localhost/webmotion.

-----------
Experiments
-----------
### Basic Experiments

* [Leap Experiment 1](http://localhost/webmotion/leap-test-1.html) : A single finger may direct an avatar around the screen.  The avatar responds not only to the position of the finger, but also the direction the finger is pointing. 
* [Leap Experiment 2](http://localhost/webmotion/leap-test-2.html) : An attempt at improving the jittery avatar by utilizing a moving average of the Pointable data.
* [Leap Experiment 3](http://localhost/webmotion/leap-test-3.html) : This experiment utilized two hands instead of pointable fingers.


### [Theremin](http://localhost/webmotion/theremin/index.html) 
My first attempt at a theremin, loosely based on the original instrument, which requires two hands to control pitch and volume.

* Pitch is controlled with the vertical axis of one finger.
* Timbre (band-pass filter) is controlled by the vertical axis of the other finger.  
* Delay regeneration is controlled by the horizontal axis of the timbre finger.
* Volume is controlled by the Z axis (depth position) of the timbre finger.


### [Hand Theremin](http://localhost/webmotion/hand-theremin/index.html)
★ This is a better theremin that utilizes only one hand.

* Again, pitch is the vertical axis.  
* Delay regeneration is controlled by the horizontal axis.  A dry signal is on the user's far left and a heavily echoed signal is on the far right.  
* Volume is controlled by tilting the hand to either the left or right, with full volume available with the palm facing down.
* Timbre (band-pass filter) is controlled by squeezing an imaginary ball or opening the hand into widely splayed fingers.


### [Drawing](http://localhost/webmotion/canvas/draw.html)
* An attempt to draw with a single finger.  
* Based on an EaselJS demo.
* Drawing engages when the avatar is within the drawing canvas, and the pointable finger crosses the zero point of the Z axis.


### [Sphere](http://localhost/webmotion/threejs/wiresphere.html)
★ This demo exemplifies the benefit of utilizing an "interaction engine" layer to provide an interface layer between the raw data and the UI.  This is similar to the use of a joystick, where the joystick data is not mapped directly to the UI, but instead causes changes in the *state* of the UI.
* A single hand controls the sphere.
* Squeezing the hand with shrink the sphere, while opening the hand will cause the sphere to grow.
* Tilting the hand left, right, up or down will cause the sphere to rotate in that direction.
* A middle static-state area for hand is also available.
* Swap the code from lines 83-89 with the code from lines 93-94 to see the effect of providing an interaction engine rather than mapping directly to raw data.


### [Swipe](http://localhost/webmotion/swipe/index.html)
A carousel, controllable with swiping gestures.  It may be useful to open up the Leap.app Visualizer, turn on gesture display, and then work on getting the hang of swipe gestures.  I found backhand to be somehow better than forehand.

---------
Elsewhere
---------

Please see the leapjs project: <https://github.com/leapmotion/leapjs>

You may also be interested in the slides for a presentation I gave to accompany these
demos: <http://www.slideshare.net/fisherwebdev/web-motion>
