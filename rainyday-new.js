/* 
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 * See https://gist.github.com/paulirish/1579671
 */
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				},
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());

/**
 * Defines a new instance of the rainyday.js.
 * @param settings settings element with script parameters
 */
function RainyDay(settings) {
	this.V = {
		opacity: 1,
		blur: 10,
		resize: true,
		fill: '#8ED6FF',
		collisions: true,
		gravityThreshold: 3,
		gravityAngle: Math.PI / 2,
		gravityAngleVariance: 0,
		reflectionScaledownFactor: 5,
		reflectionDropMappingWidth: 50,
		reflectionDropMappingHeight: 50
	};

	if (settings) {
		for (var s in _defaults) {
			if (typeof settings[s] === 'undefined') {
				settings[s] = _defaults[s];
			}
		}
		this.V = settings;
	}
	this.is_background = false;
	this.canvas_ok = false;
	this.image_ok = false;

	this.rect = function(x, y, w, h, z) {
		var canvas = document.createElement('canvas');
		canvas.style.position = 'absolute';
		canvas.style.top = x;
		canvas.style.left = y;
		canvas.width = w;
		canvas.height = h

		this._parent = document.getElementsByTagName('body')[0];
		this.canvas = canvas;
		this.width = w;
		this.height = h;
		this.canvas_ok = true;
		return this;
	};

	this.on_background = function() {
		// TODO create canvas matching the screen w&h
		this.canvas_ok = true;
		this.is_background = true;
		if (this.V.resize) {
			// TODO set up resize handler
		}
		return this;
	};

	this.img = function(image, x, y, w, h) {
		// TODO
		this.image_ok = true;
		return this;
	};

	this.rain = function(presets, speed) {
		if (!this.canvas_ok) {
			throw "Canvas has not been configured correctly";
		}
		if (!this.image_ok) {
			if (this.is_background) {
				// TODO get body background image from DOM or CSS
			} else {
				throw "Source image has not been configured correctly";
			}
		}
		// TODO start loading presents
		return this;
	};

	this.start = function() {
		// TODO start animation
		return this;
	};

	this.pause = function() {
		// TODO pause animation
		return this;
	};

	this.stop = function() {
		// TODO stop animation and free memory
		return this;
	};

	this.destroy = function() {
		// TODO stop and destroy the canvas and this object
	};
};


new RainyDay().rect(20, 20, 300, 300).img('http://i.imgur.com/xieew9').rain();
new RainyDay().on_background().rain();