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

	for (var i = 0; i < presets.length; i++) {
		if (!presets[i][3]) {
			presets[i][3] = -1;
		}
	}

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