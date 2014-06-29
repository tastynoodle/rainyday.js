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

	this.TRAIL_NONE = 0;
	this.TRAIL_DROPS = 1;
	this.TRAIL_SMUDGE = 2;

	this.conf = {
		opacity: 1,
		blur: 10,
		resize: true,
		gravity: true,
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
		if (this.canvas_ok) {
			throw "Canvas has already been set up";
		}

		this.cBack = document.createElement('canvas');
		this.cBack.style.position = 'absolute';
		this.cBack.style.top = 0;
		this.cBack.style.left = 0;
		this.cBack.style.zIndex = 0;
		this.cBack.width = w;
		this.cBack.height = h;

		this.cGlass = document.createElement('canvas');
		this.cGlass.style.position = 'absolute';
		this.cGlass.style.top = 0;
		this.cGlass.style.left = 0;
		this.cGlass.style.zIndex = 1;
		this.cGlass.width = w;
		this.cGlass.height = h;
		this.context = this.cGlass.getContext('2d');

		this.dom_parent = document.createElement('div');
		this.dom_parent.style.position = 'relative';
		this.dom_parent.style.padding = 0;
		this.dom_parent.style.top = x + "px";
		this.dom_parent.style.left = y + "px";
		this.dom_parent.width = w;
		this.dom_parent.height = h;
		this.dom_parent.appendChild(this.cBack);
		this.dom_parent.appendChild(this.cGlass);

		(parent || document.getElementsByTagName('body')[0]).appendChild(this.dom_parent);

		this.width = w;
		this.height = h;
		this.canvas_ok = true;
		return this;
	};

	this.cover = function() {
		if (this.canvas_ok) {
			throw "Canvas has already been set up";
		}

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
		console.log("resize event");
	};

	this.img = function(image, x, y, w, h) {
		if (image instanceof Image) {
			this.image = image;
		} else {
			this.image = document.getElementById(image);
			if (!this.image) {
				throw "Invalid <img> element id (" + image + ")";
			}
		}
		this.image_ok = true;
		return this;
	};

	this.rain = function(presets, trail) {
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

		this.make_reflections();

		this.presets = presets;
		this.trail = trail; // TODO get as function
		return this.start();
	};

	this.start = function() {
		if (!this.paused) {
			return;
		}
		this.paused = false;
		window.requestAnimationFrame(this.animation.bind(this));
		return this;
	};

	this.pause = function() {
		if (this.paused) {
			return;
		}
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
		if (!this.paused) {
			window.requestAnimationFrame(this.animation.bind(this));
		}
	};

	this.make_reflections = function() {
		this.background = document.createElement('canvas');
		this.background.width = this.width;
		this.background.height = this.height;

		this.clearbackground = document.createElement('canvas');
		this.clearbackground.width = this.width;
		this.clearbackground.height = this.height;

		var context = this.background.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);

		context.drawImage(this.image, 0, 0, this.width, this.height);
		this.cBack.getContext('2d').drawImage(this.background, 0, 0, this.width, this.height);

		context = this.clearbackground.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		context.drawImage(this.image, 0, 0, this.width, this.height);

		if (!isNaN(this.conf.blur) && this.conf.blur >= 1) {
			this.stackBlurCanvasRGB(this.width, this.height, this.conf.blur);
		}

		this.reflected = document.createElement('canvas');
		this.reflected.width = this.width / this.conf.reflectionScaledownFactor;
		this.reflected.height = this.height / this.conf.reflectionScaledownFactor;
		var ctx = this.reflected.getContext('2d');
	};

	this.stackBlurCanvasRGB = function(width, height, radius) {

		function BlurStack() {
			this.r = 0;
			this.g = 0;
			this.b = 0;
			this.next = null;
		}

		var shgTable = [
			[0, 9],
			[1, 11],
			[2, 12],
			[3, 13],
			[5, 14],
			[7, 15],
			[11, 16],
			[15, 17],
			[22, 18],
			[31, 19],
			[45, 20],
			[63, 21],
			[90, 22],
			[127, 23],
			[181, 24]
		];

		var mulTable = [
			512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
			454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
			482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
			437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
			497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
			320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
			446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
			329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
			505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
			399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
			324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
			268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
			451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
			385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
			332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
			289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
		];

		radius |= 0;

		var context = this.background.getContext('2d');
		var imageData = context.getImageData(0, 0, width, height);
		var pixels = imageData.data;
		var x,
			y,
			i,
			p,
			yp,
			yi,
			yw,
			rSum,
			gSum,
			bSum,
			rOutSum,
			gOutSum,
			bOutSum,
			rInSum,
			gInSum,
			bInSum,
			pr,
			pg,
			pb,
			rbs;
		var radiusPlus1 = radius + 1;
		var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

		var stackStart = new BlurStack();
		var stackEnd = new BlurStack();
		var stack = stackStart;
		for (i = 1; i < 2 * radius + 1; i++) {
			stack = stack.next = new BlurStack();
			if (i === radiusPlus1) {
				stackEnd = stack;
			}
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mulSum = mulTable[radius];
		var shgSum;
		for (var ssi = 0; ssi < shgTable.length; ++ssi) {
			if (radius <= shgTable[ssi][0]) {
				shgSum = shgTable[ssi - 1][1];
				break;
			}
		}

		for (y = 0; y < height; y++) {
			rInSum = gInSum = bInSum = rSum = gSum = bSum = 0;

			rOutSum = radiusPlus1 * (pr = pixels[yi]);
			gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
			bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);

			rSum += sumFactor * pr;
			gSum += sumFactor * pg;
			bSum += sumFactor * pb;

			stack = stackStart;

			for (i = 0; i < radiusPlus1; i++) {
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			for (i = 1; i < radiusPlus1; i++) {
				p = yi + ((width - 1 < i ? width - 1 : i) << 2);
				rSum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
				gSum += (stack.g = (pg = pixels[p + 1])) * rbs;
				bSum += (stack.b = (pb = pixels[p + 2])) * rbs;

				rInSum += pr;
				gInSum += pg;
				bInSum += pb;

				stack = stack.next;
			}

			stackIn = stackStart;
			stackOut = stackEnd;
			for (x = 0; x < width; x++) {
				pixels[yi] = (rSum * mulSum) >> shgSum;
				pixels[yi + 1] = (gSum * mulSum) >> shgSum;
				pixels[yi + 2] = (bSum * mulSum) >> shgSum;

				rSum -= rOutSum;
				gSum -= gOutSum;
				bSum -= bOutSum;

				rOutSum -= stackIn.r;
				gOutSum -= stackIn.g;
				bOutSum -= stackIn.b;

				p = (yw + ((p = x + radius + 1) < (width - 1) ? p : (width - 1))) << 2;

				rInSum += (stackIn.r = pixels[p]);
				gInSum += (stackIn.g = pixels[p + 1]);
				bInSum += (stackIn.b = pixels[p + 2]);

				rSum += rInSum;
				gSum += gInSum;
				bSum += bInSum;

				stackIn = stackIn.next;

				rOutSum += (pr = stackOut.r);
				gOutSum += (pg = stackOut.g);
				bOutSum += (pb = stackOut.b);

				rInSum -= pr;
				gInSum -= pg;
				bInSum -= pb;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}

		for (x = 0; x < width; x++) {
			gInSum = bInSum = rInSum = gSum = bSum = rSum = 0;

			yi = x << 2;
			rOutSum = radiusPlus1 * (pr = pixels[yi]);
			gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
			bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);

			rSum += sumFactor * pr;
			gSum += sumFactor * pg;
			bSum += sumFactor * pb;

			stack = stackStart;

			for (i = 0; i < radiusPlus1; i++) {
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			yp = width;

			for (i = 1; i < radiusPlus1; i++) {
				yi = (yp + x) << 2;

				rSum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
				gSum += (stack.g = (pg = pixels[yi + 1])) * rbs;
				bSum += (stack.b = (pb = pixels[yi + 2])) * rbs;

				rInSum += pr;
				gInSum += pg;
				bInSum += pb;

				stack = stack.next;

				if (i < (height - 1)) {
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for (y = 0; y < height; y++) {
				p = yi << 2;
				pixels[p] = (rSum * mulSum) >> shgSum;
				pixels[p + 1] = (gSum * mulSum) >> shgSum;
				pixels[p + 2] = (bSum * mulSum) >> shgSum;

				rSum -= rOutSum;
				gSum -= gOutSum;
				bSum -= bOutSum;

				rOutSum -= stackIn.r;
				gOutSum -= stackIn.g;
				bOutSum -= stackIn.b;

				p = (x + (((p = y + radiusPlus1) < (height - 1) ? p : (height - 1)) * width)) << 2;

				rSum += (rInSum += (stackIn.r = pixels[p]));
				gSum += (gInSum += (stackIn.g = pixels[p + 1]));
				bSum += (bInSum += (stackIn.b = pixels[p + 2]));

				stackIn = stackIn.next;

				rOutSum += (pr = stackOut.r);
				gOutSum += (pg = stackOut.g);
				bOutSum += (pb = stackOut.b);

				rInSum -= pr;
				gInSum -= pg;
				bInSum -= pb;

				stackOut = stackOut.next;

				yi += width;
			}
		}

		context.putImageData(imageData, 0, 0);

	};
};