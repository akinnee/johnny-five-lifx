const five = require("johnny-five");

module.exports = class InputArduino {

	constructor({ onPress, onLongPress, onDown, onHold, onUp, onPotChange }) {
        this.options = { onPress, onLongPress, onDown, onHold, onUp, onPotChange };

        const board = new five.Board();

        board.on("ready", () => {
            this.onBoardReady(board);
        });
	}

    onBoardReady(board) {

        this.initButton(board);
        this.initPot(board);
    }

    initButton(board) {

        const button = new five.Button(2);

        board.repl.inject({ button });

        let wasHeld = false;

        // "down" the button is pressed
        button.on("down", () => {
            console.log("down");

            if (typeof this.options.onDown === "function") {
                this.options.onDown();
            }

            wasHeld = false;
        });

        // "hold" the button is pressed for specified time.
        //              defaults to 500ms (1/2 second)
        //              set
        button.on("hold", () => {
            console.log("hold");

            if (!wasHeld) {
                if (typeof this.options.onLongPress === "function") {
                    this.options.onLongPress();
                }
            }

            if (typeof this.options.onHold === "function") {
                this.options.onHold();
            }

            wasHeld = true;
        });

        // "up" the button is released
        button.on("up", () => {
            console.log("up");

            if (!wasHeld) {
                if (typeof this.options.onPress === "function") {
                    this.options.onPress();
                }
            }

            if (typeof this.options.onUp === "function") {
                this.options.onUp();
            }

            wasHeld = false;
        });
    }

    initPot(board) {

        const pot = new five.Sensor({
            pin: "A3",
            freq: 250
        });

        const min = 10;
        const max = 1010;
        const range = max - min;

        board.repl.inject({ pot });

        let lastPercent = -1;

        const onData = (value, raw) => {
            if (value < min) {
                value = min;
            } else if (value > max) {
                value = max;
            }

            const percent = Math.round((value - min) / range * 100);

            if (percent !== lastPercent && typeof this.options.onPotChange === "function") {
                console.log("pot percent", percent);
                this.options.onPotChange(percent);
            }

            lastPercent = percent;
        };
        pot.on("data", function() {
            onData(this.value, this.raw);
        });
    }
}


