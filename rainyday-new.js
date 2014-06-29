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
 * @param config config element with script parameters
 */
function RainyDay(config) {
	this.conf = {
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

	if (config) {
		for (var s in this.conf) {
			if (typeof config[s] !== 'undefined') {
				this.conf[s] = config[s];
			}
		}
	}
	this.is_background = false;
	this.canvas_ok = false;
	this.image_ok = false;
	this.paused = true;

	this.rect = function(x, y, w, h, z, parent) {
		var canvas = document.createElement('canvas');
		canvas.style.position = 'absolute';
		canvas.style.top = x;
		canvas.style.left = y;
		canvas.width = w;
		canvas.height = h

		this.dom_parent = parent || document.getElementsByTagName('body')[0];
		this.dom_parent.appendChild(canvas);
		this.canvas = canvas;
		this.width = w;
		this.height = h;
		this.canvas_ok = true;
		return this;
	};

	this.cover = function() {
		var canvas = document.createElement('canvas');

		// TODO canvas location

		this.canvas = canvas;
		this.dom_parent = document.getElementsByTagName('body')[0];
		this.dom_parent.appendChild(canvas);
		this.canvas_ok = true;
		this.is_background = true;

		// handle resize events
		if (this.conf.resize) {
			if (window.attachEvent) {
				window.attachEvent('onresize', function() {
					this.resized();
				}.bind(this));
				window.attachEvent('onorientationchange', function() {
					this.resized();
				}.bind(this));
			} else if (window.addEventListener) {
				window.addEventListener('resize', function() {
					this.resized();
				}.bind(this), true);
				window.addEventListener('orientationchange', function() {
					this.resized();
				}.bind(this), true);
			} else {
				this.do_size_check = true;
			}
		}
		return this;
	};

	this.resized = function(e) {
		// TODO resize handler
	};

	this.img = function(image, x, y, w, h) {
		// TODO
		this.image_ok = true;
		return this;
	};

	this.rain = function(presets) {
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
		this.presets = presets;
		return this.start();
	};

	this.start = function() {
		this.paused = false;
		window.requestAnimationFrame(this.animation.bind(this));
		return this;
	};

	this.pause = function() {
		this.paused = true;
		return this;
	};

	this.stop = function() {
		// TODO stop animation and free memory
		this.paused = true;
		return this;
	};

	this.destroy = function() {
		// TODO stop and destroy the canvas and this object
	};

	this.animation = function() {
		// TODO animation frame
	};
};