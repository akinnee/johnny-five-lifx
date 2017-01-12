const five = require("johnny-five");

module.exports = class InputArduino {

	constructor({ onPress, onLongPress, onDown, onHold, onUp }) {
        this.options = { onPress, onLongPress, onDown, onHold, onUp };

        const board = new five.Board();

        board.on("ready", () => {
            this.onBoardReady(board);
        });
	}

    onBoardReady(board) {

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
}


