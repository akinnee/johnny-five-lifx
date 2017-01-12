module.exports = {
	toggleLights,
	lightsOn,
	lightsOff,
	cycleLightsColor,
	lightsAreOn,
	pushColor,
	popColor,
	getLightStates,
};

const LifxClient = require("node-lifx").Client;
const client = new LifxClient();

let lights = [];

client.on("light-new", light => {
	lights.push(light);
});
client.on("light-online", light => {
	lights.push(light);
});
client.on("light-offline", light => {
	lights = lights.filter(lightFromList => lightFromList !== light);
});

client.init();

function toggleLights() {
	if (lightsAreOn()) {
		lightsOff();
	} else {
		lightsOn();
	}
}

let lightsAreOnVal = false;

function lightsOn() {
	lightsAreOnVal = true;
	lights.forEach(light => {
		light.on();
	});
}

function lightsOff() {
	lightsAreOnVal = false;
	lights.forEach(light => {

		// dim light immediately to provide user feedback
		light.getState((error, data) => {
			if (!error) {
				const { color } = data;
				const { hue, saturation, brightness, kelvin } = color;
				const newBrightness = brightness / 2;
				const duration = 0;
				light.color(hue, saturation, newBrightness, kelvin, duration, () => {
					light.color(hue, saturation, brightness, kelvin, duration, () => {

						// then fade the light off so the user has time to leave the room
						light.off(30000);
					});
				});
			}
		});
	});
}

function lightsAreOn() {
	return lightsAreOnVal;
}

let currentHue = 120;
let currentSaturation = 100;

function cycleLightsColor() {

	// add a white step
	if (currentHue === 300 && currentSaturation > 0) {
		currentSaturation = 0;
	} else {
		currentSaturation = 100;
	}

	// when not white, cycle through colors
	if (currentSaturation > 0) {
		currentHue += 60;
		if (currentHue > 360) {
			currentHue -= 360;
		}
	}

	pushColor({
		hue: currentHue,
		saturation: currentSaturation,
		brightness: 100,
		kelvin: 3500
	});
}

const pushColorState = [];

function pushColor({ hue, saturation, brightness, kelvin, duration = 500 }) {

	return Promise.all(lights.map(light => new Promise((resolve, reject) => {

		light.getState((error, data) => {

			if (error) {

				reject(error);
			} else {

				const { color } = data;
				light.color(hue, saturation, brightness, kelvin, duration);
				resolve(color);
			}
		});
	})))
		.then(colors => {
			pushColorState.push(colors);
		});
}

// restore the color that was present before the last pushColor call
function popColor({ duration = 500 } = {}) {

	const colors = pushColorState.pop();

	lights.forEach((light, index) => {

		const { hue, saturation, brightness, kelvin } = colors[index];
		light.color(hue, saturation, brightness, kelvin, duration);
	});
}

function getLightStates() {

	return Promise.all(lights.map(light => new Promise((resolve, reject) => {

		light.getState((error, data) => {

			if (error) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	})))
}