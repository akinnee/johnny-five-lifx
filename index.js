const rotaryEncoder = require('johnny-five-rotary-encoder');
const five = require('johnny-five');
const lifx = require('./io/lifx');

const board = new five.Board();

board.on('ready', () => {

  rotaryEncoder({
    upButton: new five.Button(13),
    downButton: new five.Button(12),
    pressButton: new five.Button(11),
    onUp: () => {
      lifx.adjustBrightness(5);
    },
    onDown: () => {
      lifx.adjustBrightness(-5);
    },
    onPress: () => {
      lifx.toggleLights();
    },
  });

  let mode = 'color';

  rotaryEncoder({
    upButton: new five.Button(10),
    downButton: new five.Button(9),
    pressButton: new five.Button(8),
    onUp: () => {
      if (mode === 'color') {
        lifx.cycleLightsColor(5);
      } else {
        lifx.adjustSaturation(-5);
      }
    },
    onDown: () => {
      if (mode === 'color') {
        lifx.cycleLightsColor(-5);
      } else {
        lifx.adjustSaturation(5);
      }
    },
    onPress: () => {
      if (mode === 'color') {
        mode = 'saturation';
      } else {
        mode = 'color';
      }
      // DEBUG
      console.log("mode:", mode);
    },
  });
});