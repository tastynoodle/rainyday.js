function RainyDay(options, canvas) {
	this.drops = [];
}

/**
 * Periodically check the size of the underlying element
 */
RainyDay.prototype.checkSize = function() {
	var clientWidth = this.img.clientWidth;
	var clientHeight = this.img.clientHeight;
	var clientOffsetLeft = this.img.offsetLeft;
	var clientOffsetTop = this.img.offsetTop;
	var canvasWidth = this.canvas.width;
	var canvasHeight = this.canvas.height;
	var canvasOffsetLeft = this.canvas.offsetLeft;
	var canvasOffsetTop = this.canvas.offsetTop;

	if (canvasWidth !== clientWidth || canvasHeight !== clientHeight) {
		this.canvas.width = clientWidth;
		this.canvas.height = clientHeight;
		this.prepareBackground();
		this.glass.width = this.canvas.width;
		this.glass.height = this.canvas.height;
		this.prepareReflections();
	}
	if (canvasOffsetLeft !== clientOffsetLeft || canvasOffsetTop !== clientOffsetTop) {
		this.canvas.offsetLeft = clientOffsetLeft;
		this.canvas.offsetTop = clientOffsetTop;
	}
};

/**
 * Main function for starting rain rendering.
 * @param presets list of presets to be applied
 * @param speed speed of the animation (if not provided or 0 static image will be generated)
 */
RainyDay.prototype.rain = function(presets, speed) {
	// prepare canvas for drop reflections
	if (this.reflection !== this.REFLECTION_NONE) {
		this.prepareReflections();
	}

	this.PRIVATE_GRAVITY_FORCE_FACTOR_Y = (this.options.fps * 0.001) / 25;
	this.PRIVATE_GRAVITY_FORCE_FACTOR_X = ((Math.PI / 2) - this.options.gravityAngle) * (this.options.fps * 0.001) / 50;

	// prepare gravity matrix
	if (this.options.enableCollisions) {

		// calculate max radius of a drop to establish gravity matrix resolution
		var maxDropRadius = 0;
		for (var i = 0; i < presets.length; i++) {
			if (presets[i][0] + presets[i][1] > maxDropRadius) {
				maxDropRadius = Math.floor(presets[i][0] + presets[i][1]);
			}
		}

		if (maxDropRadius > 0) {
			// initialize the gravity matrix
			var mwi = Math.ceil(this.canvas.width / maxDropRadius);
			var mhi = Math.ceil(this.canvas.height / maxDropRadius);
			this.matrix = new CollisionMatrix(mwi, mhi, maxDropRadius);
		} else {
			this.options.enableCollisions = false;
		}
	}

	for (var i = 0; i < presets.length; i++) {
		if (!presets[i][3]) {
			presets[i][3] = -1;
		}
	}

	var lastExecutionTime = 0;
	this.addDropCallback = function() {
		var timestamp = new Date().getTime();
		if (timestamp - lastExecutionTime < speed) {
			return;
		}
		lastExecutionTime = timestamp;
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		context.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
		// select matching preset
		var preset;
		for (var i = 0; i < presets.length; i++) {
			if (presets[i][2] > 1 || presets[i][3] === -1) {
				if (presets[i][3] !== 0) {
					presets[i][3]--;
					for (var y = 0; y < presets[i][2]; ++y) {
						this.putDrop(new Drop(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height, presets[i][0], presets[i][1]));
					}
				}
			} else if (Math.random() < presets[i][2]) {
				preset = presets[i];
				break;
			}
		}
		if (preset) {
			this.putDrop(new Drop(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height, preset[0], preset[1]));
		}
		context.save();
		context.globalAlpha = this.options.opacity;
		context.drawImage(this.glass, 0, 0, this.canvas.width, this.canvas.height);
		context.restore();
	}
		.bind(this);
};

/**
 * Draws a raindrop on canvas at the current position.
 */
Drop.prototype.draw = function() {
	this.context.save();
	this.context.beginPath();

	var orgR = this.r;
	this.r = 0.95 * this.r;
	if (this.r < 3) {
		this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
		this.context.closePath();
	} else if (this.colliding || this.yspeed > 2) {
		if (this.colliding) {
			var collider = this.colliding;
			this.r = 1.001 * (this.r > collider.r ? this.r : collider.r);
			this.x += (collider.x - this.x);
			this.colliding = null;
		}

		var yr = 1 + 0.1 * this.yspeed;
		this.context.moveTo(this.x - this.r / yr, this.y);
		this.context.bezierCurveTo(this.x - this.r, this.y - this.r * 2, this.x + this.r, this.y - this.r * 2, this.x + this.r / yr, this.y);
		this.context.bezierCurveTo(this.x + this.r, this.y + yr * this.r, this.x - this.r, this.y + yr * this.r, this.x - this.r / yr, this.y);
	} else {
		this.context.arc(this.x, this.y, this.r * 0.9, 0, Math.PI * 2, true);
		this.context.closePath();
	}

	this.context.clip();

	this.r = orgR;

	if (this.rainyday.reflection) {
		this.rainyday.reflection(this);
	}

	this.context.restore();
};

/**
 * Clears the raindrop region.
 * @param force force stop
 * @returns Boolean true if the animation is stopped
 */
Drop.prototype.clear = function(force) {
	this.context.clearRect(this.x - this.r - 1, this.y - this.r - 2, 2 * this.r + 2, 2 * this.r + 2);
	if (force) {
		this.terminate = true;
		return true;
	}
	if ((this.y - this.r > this.rainyday.h) || (this.x - this.r > this.rainyday.w) || (this.x + this.r < 0)) {
		// over edge so stop this drop
		return true;
	}
	return false;
};

/**
 * Moves the raindrop to a new position according to the gravity.
 */
Drop.prototype.animate = function() {
	if (this.terminate) {
		return false;
	}
	var stopped = this.rainyday.gravity(this);
	if (!stopped && this.rainyday.trail) {
		this.rainyday.trail(this);
	}
	if (this.rainyday.options.enableCollisions) {
		var collisions = this.rainyday.matrix.update(this, stopped);
		if (collisions) {
			this.rainyday.collision(this, collisions);
		}
	}
	return !stopped || this.terminate;
};

/**
 * COLLISION function: default collision implementation
 * @param drop one of the drops colliding
 * @param collisions list of potential collisions
 */
RainyDay.prototype.COLLISION_SIMPLE = function(drop, collisions) {
	var item = collisions;
	var drop2;
	while (item != null) {
		var p = item.drop;
		if (Math.sqrt(Math.pow(drop.x - p.x, 2) + Math.pow(drop.y - p.y, 2)) < (drop.r + p.r)) {
			drop2 = p;
			break;
		}
		item = item.next;
	}

	if (!drop2) {
		return;
	}

	// rename so that we're dealing with low/high drops
	var higher,
		lower;
	if (drop.y > drop2.y) {
		higher = drop;
		lower = drop2;
	} else {
		higher = drop2;
		lower = drop;
	}

	this.clearDrop(lower);
	// force stopping the second drop
	this.clearDrop(higher, true);
	this.matrix.remove(higher);
	lower.draw();

	lower.colliding = higher;
	lower.collided = true;
};

/**
 * Defines a gravity matrix object which handles collision detection.
 * @param x number of columns in the matrix
 * @param y number of rows in the matrix
 * @param r grid size
 */
function CollisionMatrix(x, y, r) {
	this.resolution = r;
	this.xc = x;
	this.yc = y;
	this.matrix = new Array(x);
	for (var i = 0; i <= (x + 5); i++) {
		this.matrix[i] = new Array(y);
		for (var j = 0; j <= (y + 5); ++j) {
			this.matrix[i][j] = new DropItem(null);
		}
	}
}

/**
 * Updates position of the given drop on the collision matrix.
 * @param drop raindrop to be positioned/repositioned
 * @param forceDelete if true the raindrop will be removed from the matrix
 * @returns collisions if any
 */
CollisionMatrix.prototype.update = function(drop, forceDelete) {
	if (drop.gid) {
		if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
			return null;
		}
		this.matrix[drop.gmx][drop.gmy].remove(drop);
		if (forceDelete) {
			return null;
		}

		drop.gmx = Math.floor(drop.x / this.resolution);
		drop.gmy = Math.floor(drop.y / this.resolution);
		if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
			return null;
		}
		this.matrix[drop.gmx][drop.gmy].add(drop);

		var collisions = this.collisions(drop);
		if (collisions && collisions.next != null) {
			return collisions.next;
		}
	} else {
		drop.gid = Math.random().toString(36).substr(2, 9);
		drop.gmx = Math.floor(drop.x / this.resolution);
		drop.gmy = Math.floor(drop.y / this.resolution);
		if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
			return null;
		}

		this.matrix[drop.gmx][drop.gmy].add(drop);
	}
	return null;
};

/**
 * Looks for collisions with the given raindrop.
 * @param drop raindrop to be checked
 * @returns DropItem list of drops that collide with it
 */
CollisionMatrix.prototype.collisions = function(drop) {
	var item = new DropItem(null);
	var first = item;

	item = this.addAll(item, drop.gmx - 1, drop.gmy + 1);
	item = this.addAll(item, drop.gmx, drop.gmy + 1);
	item = this.addAll(item, drop.gmx + 1, drop.gmy + 1);

	return first;
};

/**
 * Appends all found drop at a given location to the given item.
 * @param to item to which the results will be appended to
 * @param x x position in the matrix
 * @param y y position in the matrix
 * @returns last discovered item on the list
 */
CollisionMatrix.prototype.addAll = function(to, x, y) {
	if (x > 0 && y > 0 && x < this.xc && y < this.yc) {
		var items = this.matrix[x][y];
		while (items.next != null) {
			items = items.next;
			to.next = new DropItem(items.drop);
			to = to.next;
		}
	}
	return to;
};

/**
 * Removed the drop from its current position
 * @param drop to be removed
 */
CollisionMatrix.prototype.remove = function(drop) {
	this.matrix[drop.gmx][drop.gmy].remove(drop);
};

