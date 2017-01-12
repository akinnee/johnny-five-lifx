const lifx = require("./io/lifx");
const InputArduino = require("./io/InputArduino");
const child_process = require("child_process");

let state = {
	// when in modifier mode, the inputs may have different actions
	// it's like a function/shift key
	modifierMode: false,
	rebootMode: false
};

const inputArduino = new InputArduino({
	onPress() {

		if (state.modifierMode) {
			setState({
				modifierMode: false,
				rebootMode: false
			});
		} else if (lifx.lightsAreOn()) {
			lifx.cycleLightsColor();
		} else {
			lifx.lightsOn();
		}
	},
	onLongPress() {

		// in reboot mode, when button is held, reboot the host
		if (state.rebootMode) {
			child_process.exec("sudo reboot");

		// in modifier mode, when button is held, turn off the lights
		} else if (state.modifierMode) {
			lifx.lightsOff();

		} else {

			setState({
				modifierMode: true
			});
		}
	},
	onPotChange(percent) {

		if (state.modifierMode) {

			lifx.getLightStates()
				.then(lightStates => {

					const lightState = lightStates[0];
					const { color } = lightState;

					lifx.pushColor(Object.assign({}, color, {
						hue: percent * 3.6,
						duration: 500
					}));
				});
		} else {

			lifx.getLightStates()
				.then(lightStates => {

					const lightState = lightStates[0];
					const { color } = lightState;

					lifx.pushColor(Object.assign({}, color, {
						brightness: percent,
						duration: 500
					}));
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

		console.log("entered modifier mode");

		// this is to notify the user since there is no other feedback yet
		lifx.pushColor({
			hue: 170,
			saturation: 100,
			brightness: 100,
			kelvin: 3500,
			duration: 0
		})
			.then(() => {
				setTimeout(() => {
					lifx.popColor();
				}, 1000);
			});

	} else if (!state.modifierMode && prevState.modifierMode) {

		console.log("exited modifier mode");

		// this is to notify the user since there is no other feedback yet
		lifx.pushColor({
			hue: 30,
			saturation: 100,
			brightness: 100,
			kelvin: 3500,
			duration: 0
		})
			.then(() => {
				setTimeout(() => {
					lifx.popColor();
				}, 1000);
			});
	}

	if (state.rebootMode && !prevState.rebootMode) {

		console.log("entered reboot mode");

		lifx.pushColor({
			hue: 10,
			saturation: 100,
			brightness: 100,
			kelvin: 3500,
			duration: 0
		});

		// automatically leave reboot mode after some time
		setTimeout(() => {
			setState({
				rebootMode: false
			});
		}, 5000);
	} else if (!state.rebootMode && prevState.rebootMode) {

		console.log("exited modifier mode");

		lifx.popColor();
	}
}