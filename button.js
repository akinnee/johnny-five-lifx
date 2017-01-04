const lifx = require("./lifx");
const five = require("johnny-five");
const board = new five.Board();

board.on("ready", function() {

  // Create a new `button` hardware instance.
  // This example allows the button module to
  // create a completely default instance
  const button = new five.Button(2);

  // Inject the `button` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    button: button
  });

  // Button Event API

  let wasHeld = false;

  // "down" the button is pressed
  button.on("down", function() {
    console.log("down");
    wasHeld = false;
  });

  // "hold" the button is pressed for specified time.
  //        defaults to 500ms (1/2 second)
  //        set
  button.on("hold", function() {
    console.log("hold");
    if (!wasHeld) {
      lifx.toggleLights();
    }
    wasHeld = true;
  });

  // "up" the button is released
  button.on("up", function() {
    console.log("up");
    if (!wasHeld) {
      if (lifx.lightsAreOn()) {
        lifx.cycleLightsColor();
      } else {
        lifx.lightsOn();
      }
    }
  });
});
