const lifx = require("./io/lifx");
const InputArduino = require("./io/InputArduino");
const child_process = require("child_process");

let state = {
	// when in modifier mode, the button has different actions
	modifierMode: false
};

const inputArduino = new InputArduino({
	onPress() {

		if (state.modifierMode) {
			setState({
				modifierMode: false
			});
		} else if (lifx.lightsAreOn()) {
			lifx.cycleLightsColor();
		} else {
			lifx.lightsOn();
		}
	},
	onLongPress() {

		// in modifier mode, when button is held, reboot the host
		if (state.modifierMode) {
			child_process.exec("sudo reboot");
		} else if (lifx.lightsAreOn()) {
			lifx.lightsOff();
		} else {
			setState({
				modifierMode: true
			});
		}
	}
});

function setState(change) {
	const prevState = state;
	state = Object.assign({}, state, change);
	onStateChange(prevState);
}

function onStateChange(prevState) {

	// alert the user that we are in modifier mode
	if (state.modifierMode && !prevState.modifierMode) {

		lifx.pushColor({
			hue: 360,
			saturation: 100,
			brightness: 100,
			kelvin: 3500,
			duration: 0
		});

		// automatically leave modifier mode after some time
		setTimeout(() => {
			setState({
				modifierMode: false
			});
		}, 5000);
	} else if (!state.modifierMode && prevState.modifierMode) {

		lifx.popColor();
	}
}