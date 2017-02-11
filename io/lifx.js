module.exports = {
	toggleLights,
	lightsOn,
	lightsOff,
	cycleLightsColor,
	adjustSaturation,
	adjustBrightness,
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
	lightsAreOn().then((areOn) => {
		if (areOn) {
			lightsOff();
		} else {
			lightsOn();
		}
	});
}

function lightsOn() {
	lights.forEach(light => {
		light.on(1000);
	});
}

function lightsOff() {
	lights.forEach(light => {
		light.off(1000);
	});
}

function lightsAreOn() {
	return getLightStates()
		.then((datas) => {
			return datas[0].power;
		})
		.catch(() => {
			return false;
		});
}

let currentHue = 120;
let currentSaturation = 100;
let currentBrightness = 100;

function cycleLightsColor(degrees = 60) {

	currentHue += degrees;
	if (currentHue > 360) {
		currentHue -= 360;
	} else if (currentHue < 0) {
		currentHue += 360;
	}

	// DEBUG
	console.log("currentHue:", currentHue);

	pushColor({
		hue: currentHue,
		saturation: currentSaturation,
		brightness: currentBrightness,
		kelvin: 3500,
		duration: 100,
	});
}

function adjustSaturation(amount = 5) {

	currentSaturation += amount;
	if (currentSaturation > 100) {
		currentSaturation = 100;
	} else if (currentSaturation < 0) {
		currentSaturation = 0;
	}

	// DEBUG
	console.log("currentSaturation:", currentSaturation);

	pushColor({
		hue: currentHue,
		saturation: currentSaturation,
		brightness: currentBrightness,
		kelvin: 3500,
		duration: 100,
	});
}

function adjustBrightness(amount = 5) {

	currentBrightness += amount;
	if (currentBrightness > 100) {
		currentBrightness = 100;
	} else if (currentBrightness < 0) {
		currentBrightness = 0;
	}

	// DEBUG
	console.log("currentBrightness:", currentBrightness);

	pushColor({
		hue: currentHue,
		saturation: currentSaturation,
		brightness: currentBrightness,
		kelvin: 3500,
		duration: 100,
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

			if (pushColorState.length > 100) {
				pushColorState.shift();
			}
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