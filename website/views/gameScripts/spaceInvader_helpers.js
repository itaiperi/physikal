var clX, clY;
var webSocketClient;
var canvasWidth = 504;
var canvasHeight = 600;

// WebSocket message handler. when message arrives, this function handle the data.
function webSocketMessageHandler(data) {
    switch (data.type) {
        case "COORDINATE":
            clX = data.x * canvasWidth;
            clY = data.y * canvasHeight;
            console.log("X:", clX, ", Y:", clY);
            break;
        case "GESTURE":
            break;
    }
}

// Handles connection to websocket with connect and disconnect buttons. takes IP from textbox
function setWebsocketConnectionControls() {
    $('#connect').click(function() {
        if (webSocketClient) {
            webSocketClient.close();
        }
        setTimeout(function() {
            webSocketClient = createWebSocketClient($('#ipTextBox').val(), 12012, webSocketMessageHandler);
        }, 200);
    });
    $('#disconnect').click(function() {
        if (webSocketClient) {
            webSocketClient.close();
        }
    });
}

var
/**
 * Game objects
 */
display,
input,
frames,
spFrame,
lvFrame,
alSprite,
taSprite,
ciSprite,
aliens,
dir,
tank,
bullets,
cities;

/**
 * Initiate and start the game
 */
function main() {

	// THIS WILL BE USED WHEN WEB SOCKET SERVER WILL BE ON LOCALHOST
    webSocketClient = createWebSocketClient('localhost', 12012, webSocketMessageHandler);
//    setWebsocketConnectionControls();

	// create game canvas and inputhandeler
	display = new Screen(canvasWidth, canvasHeight);
	input = new InputHandeler();
	// create all sprites fram assets image
	//Returns an HTMLImageElement instance just as document.createElement('img') would.
	var img = new Image();
	img.addEventListener("load", function() {
		//alSprite is alien Sprite,3 different aliens for 3 diff aliens, each has two types. this here is the img object upon which eventListener is defined.
		alSprite = [
			[new Sprite(this,  0, 0, 22, 16), new Sprite(this,  0, 16, 22, 16)],
			[new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
			[new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
		];
		taSprite = new Sprite(this, 62, 0, 22, 16); //tank sprite
		ciSprite = new Sprite(this, 84, 8, 36, 24); //city sprite
		// initate and run the game
		init();
		run();
	});
	// img.crossOrigin="anonymous";
	// img.src="https://www.dropbox.com/home?preview=invaders.png";
	//img.src="https://dl.dropboxusercontent.com/u/139992952/stackoverflow/colorhouse.png"

	img.src = "game_images/invaders.png";
	//setting the source of our Img object to the invaders png
};

/**	
 * Check if to axis aligned bounding boxes intersects
 *
 * @return {bool}  the check result
 */
function AABBIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
	return ax < bx+bw && bx < ax+aw && ay < by+bh && by < ay+ah;
};


/**
 * Bullet class 
 * 
 * @param {number} x     start x position
 * @param {number} y     start y position
 * @param {number} vely  velocity in y direction
 * @param {number} w     width of the bullet in pixels
 * @param {number} h     height of the bullet in pixels
 * @param {string} color hex-color of bullet
 */
function Bullet(x, y, vely, w, h, color) {
	this.x = x;
	this.y = y;
	this.vely = vely;
	this.width = w;
	this.height = h;
	this.color = color;
};

/**
 * Update bullet position
 */
Bullet.prototype.update = function() {
	this.y += this.vely;
};


/**
 * Abstracted canvas class usefull in games
 * 
 * @param {number} width  width of canvas in pixels
 * @param {number} height height of canvas in pixels
 */
function Screen(width, height) {
	// create canvas and grab 2d context
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.width = width;
	this.canvas.height = this.height = height;
	this.ctx = this.canvas.getContext("2d");
	// append canvas to body of document
	document.body.appendChild(this.canvas);
};

/**
 * Clear the complete canvas
 */
Screen.prototype.clear = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};

/**
 * Draw a sprite instance to the canvas
 * 
 * @param  {Sprite} sp the sprite to draw
 * @param  {number} x  x-coordinate to draw sprite
 * @param  {number} y  y-coordinate to draw sprite
 */
Screen.prototype.drawSprite = function(sp, x, y) {
	// draw part of spritesheet to canvas
	this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.w, sp.h);
};

/**
 * Draw a bullet instance to the canvas
 * @param  {Bullet} bullet the bullet to draw
 */
Screen.prototype.drawBullet = function(bullet) {
	// set the current fillstyle and draw bullet
	this.ctx.fillStyle = bullet.color;
	this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
};


/**
 * Sprite object, uses sheet image for compressed space
 * 
 * @param {Image}  img sheet image
 * @param {number} x   start x on image
 * @param {number} y   start y on image
 * @param {number} w   width of asset
 * @param {number} h   height of asset
 */
function Sprite(img, x, y, w, h) {
	this.img = img;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};


/**
 * InputHandeler class, handle and log pressed keys
 */
function InputHandeler() {
	this.down = {};
	this.pressed = {};
	// capture key presses
	var _this = this; //keeping reference to this instance
	document.addEventListener("keydown", function(evt) {
		_this.down[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete _this.down[evt.keyCode];  //pressing for the first time
		delete _this.pressed[evt.keyCode]; //malicous user pressing key down
	});
};

/**
 * Returns whether a key is pressod down
 * @param  {number}  code the keycode to check
 * @return {bool}         the result from check
 */
InputHandeler.prototype.isDown = function(code) {
	return this.down[code];
};

/**
 * Return wheter a key has been pressed
 * @param  {number}  code the keycode to check
 * @return {bool}         the result from check
 */
InputHandeler.prototype.isPressed = function(code) {
	// if key is registred as pressed return false else if
	// key down for first time return true else return false
	if (this.pressed[code]) { //already pressed, someone holding key down
		return false;
	} else if (this.down[code]) {
		return this.pressed[code] = true;
	}
	return false;
};


/**
 * Initate game objects
 */
function init() {
	// set start settings
	frames  = 0;
	spFrame = 0;
	lvFrame = 60;
	dir = 1;
	// create the tank object
	tank = {
		sprite: taSprite,
		x: (display.width - taSprite.w) / 2,
		y: display.height - (30 + taSprite.h)
	};
	// initatie bullet array
	bullets = [];
	// create the cities object (and canvas)
	cities = {
		canvas: null,
		ctx: 	null,
		y: tank.y - (30 + ciSprite.h),
		h: ciSprite.h,
		/**
		 * Create canvas and game graphic context
		 */
		init: function() {
			// create canvas and grab 2d context
			this.canvas = document.createElement("canvas");
			this.canvas.width = display.width;
			this.canvas.height = this.h;
			this.ctx = this.canvas.getContext("2d");
			for (var i = 0; i < 4; i++) {
				this.ctx.drawImage(ciSprite.img, ciSprite.x, ciSprite.y,
					ciSprite.w, ciSprite.h,
					68 + 111*i, 0, ciSprite.w, ciSprite.h);
			}
		},
		/**
		 * Create damage effect on city-canvas
		 * 
		 * @param  {number} x x-coordinate
		 * @param  {number} y y-coordinate
		 */
		generateDamage: function(x, y) {
			// round x, y position
			x = Math.floor(x/2) * 2;
			y = Math.floor(y/2) * 2;
			// draw damage effect to canvas
			this.ctx.clearRect(x-2, y-2, 4, 4);
			this.ctx.clearRect(x+2, y-4, 2, 4);
			this.ctx.clearRect(x+4, y, 2, 2);
			this.ctx.clearRect(x+2, y+2, 2, 2);
			this.ctx.clearRect(x-4, y+2, 2, 2);
			this.ctx.clearRect(x-6, y, 2, 2);
			this.ctx.clearRect(x-4, y-4, 2, 2);
			this.ctx.clearRect(x-2, y-6, 2, 2);
		},
		/**
		 * Check if pixel at (x, y) is opaque
		 * 
		 * @param  {number} x x-coordinate
		 * @param  {number} y y-coordinate
		 * @return {bool}     boolean value if pixel opaque
		 */
		hits: function(x, y) {
			// transform y value to local coordinate system
			y -= this.y;
			// get imagedata and check if opaque
			//var data = this.ctx.getImageData(x, y, 1, 1);
			var data = this.ctx.getImageData(1, 1, 1, 1);
			if (data.data[3] !== 0) {
				this.generateDamage(x, y);
				return true;
			}
			return false;
		}
	};

	cities.init(); // initiate the cities
	// create and populate alien array
	aliens = [];
	var rows = [1, 0, 0, 2, 2]; //what is he doing here
	for (var i = 0, len = rows.length; i < len; i++) {
		for (var j = 0; j < 10; j++) {
			var a = rows[i];
			// create right offseted alien and push to alien
			// array
			aliens.push({
				sprite: alSprite[a],
				x: 30 + j*30 + [0, 4, 0][a],
				y: 30 + i*30,
				w: alSprite[a][0].w,
				h: alSprite[a][0].h
			});
		}
	}
};
/**
 * Wrapper around the game loop function, updates and renders
 * the game
 */
function run() {
	var loop = function() {
		update();
		render();
		window.requestAnimationFrame(loop, display.canvas);
	};
	window.requestAnimationFrame(loop, display.canvas);
};
/**
 * Update the game logic
 */
function update() {
	// update the frame count
	frames++;
	// update tank position depending on pressed keys
	//********************* KEYS ********************
	tank.x = clX;
	//if (input.isDown(37)) { // Left
	//	tank.x -= 4;
	//}
	//if (input.isDown(39)) { // Right
	//	tank.x += 4;
	//}
	// keep the tank sprite inside of the canvas
	tank.x = Math.max(Math.min(tank.x, display.width - (30 + taSprite.w)), 30);

	// append new bullet to the bullet array if spacebar is
	// pressed
	//if (input.isPressed(32)) { // Space
		//bullets.push(new Bullet(tank.x + 10, tank.y, -10, 2, 6, "#fff"));
	//}

	if (Math.random() < 0.03 && aliens.length > 0) {
		bullets.push(new Bullet(tank.x + 10, tank.y, -8, 2, 6, "#fff"));
	}

	// update all bullets position and checks
	for (var i = 0, len = bullets.length; i < len; i++) {
		var b = bullets[i];
		b.update();
		// remove bullets outside of the canvas
		if (b.y + b.height < 0 || b.y > display.height) {
			bullets.splice(i, 1);
			i--;
			len--;
			continue;
		}
		// check if bullet hits any city
		var h2 = b.height * 0.5; // half height is used for
								 // simplicity
		if (cities.y < b.y+h2 && b.y+h2 < cities.y + cities.h) {
			if (cities.hits(b.x, b.y+h2)) {
				bullets.splice(i, 1);
				i--;
				len--;
				continue;
			}
		}
		// check if bullet hit any aliens
		for (var j = 0, len2 = aliens.length; j < len2; j++) {
			var a = aliens[j];
			if (AABBIntersect(b.x, b.y, b.width, b.height, a.x, a.y, a.w, a.h)) {
				aliens.splice(j, 1); //remove hit alien
				j--;
				len2--;
				bullets.splice(i, 1); //remove bullet that killed alien
				i--;
				len--;
				// increase the movement frequence of the aliens
				// when there are less of them
				switch (len2) {
					case 30: {
						this.lvFrame = 40;
						break;
					}
					case 10: {
						this.lvFrame = 20;
						break;
					}
					case 5: {
						this.lvFrame = 15;
						break;
					}
					case 1: {
						this.lvFrame = 6;
						break;
					}
				}
			}
		}
	}
	// makes the alien shoot in an random fashion 
	if (Math.random() < 0.03 && aliens.length > 0) {
		var a = aliens[Math.round(Math.random() * (aliens.length - 1))];
		// iterate through aliens and check collision to make
		// sure only shoot from front line
		//this for loops make all the alien shooters, shoot from the front line
		for (var i = 0, len = aliens.length; i < len; i++) {
			var b = aliens[i];
			if (AABBIntersect(a.x, a.y, a.w, 100, b.x, b.y, b.w, b.h)) {
				a = b;
			}
		}
		// create and append new bullet
		bullets.push(new Bullet(a.x + a.w*0.5, a.y + a.h, 4, 2, 4, "#fff"));
	}
	// update the aliens at the current movement frequence
	if (frames % lvFrame === 0) {
		spFrame = (spFrame + 1) % 2;
		var _max = 0, _min = display.width;
		// iterate through aliens and update postition
		for (var i = 0, len = aliens.length; i < len; i++) {
			var a = aliens[i];
			a.x += 30 * dir;
			// find min/max values of all aliens for direction
			// change test
			_max = Math.max(_max, a.x + a.w);
			_min = Math.min(_min, a.x);
		}
		// check if aliens should move down and change direction
		if (_max > display.width - 30 || _min < 30) {
			// mirror direction and update position
			dir *= -1;
			for (var i = 0, len = aliens.length; i < len; i++) {
				aliens[i].x += 30 * dir;
				aliens[i].y += 30;
			}
		}
	}
};
/**
 * Render the game state to the canvas
 */
function render() {
	display.clear(); // clear the game canvas
	// draw all aliens
	for (var i = 0, len = aliens.length; i < len; i++) {
		var a = aliens[i];
		display.drawSprite(a.sprite[spFrame], a.x, a.y);
	}
	// save context and draw bullet then restore
	display.ctx.save();
	for (var i = 0, len = bullets.length; i < len; i++) {
		display.drawBullet(bullets[i]);
	}
	display.ctx.restore();
	// draw the city graphics to the canvas
	display.ctx.drawImage(cities.canvas, 0, cities.y);
	// draw the tank sprite
	display.drawSprite(tank.sprite, tank.x, tank.y);
};