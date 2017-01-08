const lifx = require("./lifx");
const five = require("johnny-five");
const board = new five.Board();
const child_process = require("child_process");

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

  let inShutdownConfirmationMode = false;

  // "hold" the button is pressed for specified time.
  //        defaults to 500ms (1/2 second)
  //        set
  button.on("hold", function() {
    console.log("hold");
    if (!wasHeld) {

      // if already in shutdown confirmation mode, reboot the host
      if (inShutdownConfirmationMode) {
        inShutdownConfirmationMode = false;

        // feedback that the the command has triggered
        lifx.lightsOn();
        for (var i = 0; i < 6; i++) {
          lifx.cycleLightsColor();
        }

        child_process.exec("sudo reboot");

      // holding while the lights are on will turn them off
      } else if (lifx.lightsAreOn()) {
        lifx.lightsOff();

      // holding while the lights are off will enter shutdown confirmation mode
      // for a short time
      } else {

        // feedback that the the mode has entered
        lifx.lightsOn();
        for (var i = 0; i < 6; i++) {
          lifx.cycleLightsColor();
        }
        lifx.lightsOff();

        inShutdownConfirmationMode = true;

        // mode cancelled
        setTimeout(() => {
          inShutdownConfirmationMode = false;
        }, 5000);
      }
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
