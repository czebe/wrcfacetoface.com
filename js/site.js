

/* ############################################################################################ */
/* PRODUCTS MAINPAGE */
/* ############################################################################################ */

var WRC = window.WRC || {};

//EVENT CONSTANTS
WRC.CART_REFRESHED = "cart_refreshed";
WRC.ADDING_TO_CART = "adding_to_cart";
WRC.BACKGROUND_STITCH_READY = "background_stitch_ready";

WRC.SiteController = function() {
	"use strict";
	
	var self = this;

	this.isIE;
	this.isMozilla;
	this.isWebkit;
	this.isOpera;
	this.browserVersion;

	this.init = function() {

		//DETECT BROWSER
		self.isIE = $.browser.msie;
		self.isMozilla = $.browser.mozilla;
		self.isWebkit = $.browser.webkit;
		self.isOpera = $.browser.opera;
		self.browserVersion = parseInt($.browser.version);

		//READ COOKIE
		var browserPassed = false;
		var warningDisabled = $.cookie('WRC-disable-browser-warning');

		if ((self.isIE && self.browserVersion >= 9) ||
			(self.isMozilla && self.browserVersion >= 10) ||
			(self.isWebkit) ||
			$('body').hasClass('intro') ||
			window.location.href.indexOf('upgrade') > 0 ||
			(warningDisabled == "true")) {
			browserPassed = true;
		}

		if (!browserPassed) {
			window.location.href = "http://www.wrcfacetoface.com/upgrade";
		}

		//REDIRECT HUNGARIAN VISITORS
		if (visitorCountryCode.toLowerCase() === "hu" && siteHost.indexOf('hu.') < 0 && window.location.href.indexOf('worldsecuresystems') < 0 && window.location.search != '?noredirect') {
			var currentPath = window.location.href.replace(siteHost, '');
			window.location.href = window.location.protocol + "//hu.wrcfacetoface.com" + currentPath;
		}

		if (self.isIE) {
			injectSocialContainers();
		} else {
			$(window).load(function() {
				injectSocialContainers();
			});
		}

		//INITIALIZE PAGE
		WRC.eventDispatcher = new WRC.EventDispatcher();

		WRC.navigation = new WRC.Navigation();
		
		WRC.mainmenu = new WRC.MainMenu();
		WRC.mainmenu.init();

		WRC.cartTools = WRC.cartTools || new WRC.CartTools();
		WRC.cartTools.formatPrice();

		if (WRC.PageController) {
			WRC.pageController = new WRC.PageController();
			WRC.pageController.init();
		}
	};
	
	function injectSocialContainers() {

		var socialContainer = $('body > footer ul.social-container').first();
		socialContainer.append('<li><div class="fb-like" data-href="http://www.wrcfacetoface.com" data-send="false" data-layout="button_count" data-width="96" data-show-faces="false" colorscheme="light"></div></li>');
		socialContainer.append('<li><a href="http://twitter.com/share" class="twitter-share-button" data-url="http://www.wrcfacetoface.com" data-count="none" data-text="WRC Face to Face, new site! #rallybeauty #flatout" data-via="" data-related="" data-lang="en" data-counturl="" style="color: #EEE;">Tweet</a></li>');

		/*
		if (!window.FBinited) {
			window.FBinited = true;
			window.fbAsyncInit = function() {
				FB.init({
					appId: facebookAppId, // App ID from the App Dashboard
					channelUrl: '/channel.html', // Channel File for x-domain communication
					status: true, // check the login status upon init?
					cookie: true, // set sessions cookies to allow your server to access the session?
					xfbml: true  // parse XFBML tags on this page?
				});
			};
			*/

			//INJECT SOCIAL SCRIPTS
			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=" + facebookAppId;
				js.async = true;
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));

			!function(d,s,id){
				var js,fjs=d.getElementsByTagName(s)[0];
				if(!d.getElementById(id)){
					js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";
					js.async = true;
					fjs.parentNode.insertBefore(js,fjs);
				}
			}(document,"script","twitter-wjs");

			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		//}
		
	}	
};

WRC.MainMenu = function() {
	"use strict";
	var self = this;
	
	var menu = $('body > header > nav');
	var menuSVG = $('#menu-SVG');
	var polygonSVG = menuSVG.find('polygon');
	var activeItem = 0;
	
	var c = [154,324,  264,515,  487,515,  596,324,  487,134,  264,134];
	var poly = $({h1x:c[0], h1y:c[1], h2x:c[2], h2y:c[3], h3x:c[4], h3y:c[5], h4x:c[6], h4y:c[7], h5x:c[8], h5y:c[9], h6x:c[10], h6y:c[11]});
	
	var menuOpened = false;
	var textWidths = [];
	var mouseX = 0;
	var mouseY = 0;
	var r = 200;
	var r2 = r/2;
	
	this.init = function() {
		$('body > header > nav a').each(function(i, e) {
			var label = $(e).find('.text').first();
			var w = label.width();
			var labelSettings = {};
			if (i == 0 || i == 1 || i == 5) {
				$(e).css('text-align', 'right');
				$(e).find('.mainmenu-point').first().css('right', 0);
				$(e).find('.mainmenu-line2').first().css('margin-right', -35);
				labelSettings['margin-left'] = -w - 35;
				labelSettings['margin-right'] = 35;
			} else {		
				$(e).find('.mainmenu-line1').first().css('margin-left', -35);
				labelSettings['margin-right'] = -w - 35;
				labelSettings['margin-left'] = 35;
				
			}
			label.css(labelSettings);
			textWidths.push(w);		
		});

		$('#menu-opener').bind('mouseenter', function(e) {
			if (!menuOpened) self.open();
		});
	
		$('#menu-opener').click(function(e) {
			menuOpened ? self.close() : self.open();
		});
		
		animate();
		
		$('body > header').first().css({'visibility': 'visible', 'display': 'none'});
	};
	
	this.open = function() {
	
		$('body > header').bind('click', function(e) {
			self.close();
		});
			
		$('body').bind('mousemove', function(e) {
			mouseX = e.pageX;
			mouseY = e.pageY;
			animate();
		});
		
		$('body').mouseleave(function() {
			activeItem = 0;
   			mouseX = 0;
			mouseY = 0;
			animate();
		});
		
		$('body > header').fadeIn(500, 'easeOutExpo');
		
		animate();
		menuOpened = true;
	};
	
	this.close = function() {	
		$(document).unbind('mousemove');
		$(window).unbind('mouseleave');
		$('body > header').fadeOut(500, 'easeOutExpo');
		menuOpened = false;
	};
	
	function getClosestMenu(x, y) {
		var i;
		var j = 0;
		for (i = 0; i < 6; i++) {
			if (x > c[j] - r2 && x < c[j] + r2 && y > c[j+1] - r2 && y < c[j+1] + r2) return i + 1;
			j += 2;
		}
		return (activeItem == null) ? activeItem : 0;
	};

	function animate() {
		if (mouseX == 0 || mouseY == 0) return;

		var x = mouseX - (menu.position().left - 375);
		var y = mouseY - (menu.position().top - 325);


		activeItem = getClosestMenu(x, y);

		if (activeItem != null) {
			poly.stop().animate({
				h1x : (activeItem != 1 ? c[0] : x),
				h1y : (activeItem != 1 ? c[1] : y),
				h2x : (activeItem != 2 ? c[2] : x),
				h2y : (activeItem != 2 ? c[3] : y),
				h3x : (activeItem != 3 ? c[4] : x),
				h3y : (activeItem != 3 ? c[5] : y),
				h4x : (activeItem != 4 ? c[6] : x),
				h4y : (activeItem != 4 ? c[7] : y),
				h5x : (activeItem != 5 ? c[8] : x),
				h5y : (activeItem != 5 ? c[9] : y),
				h6x : (activeItem != 6 ? c[10] : x),
				h6y : (activeItem != 6 ? c[11] : y)
			},{
				duration: 900,
				easing: 'easeOutElastic',
				step: function() {
					var points = this.h1x+','+this.h1y+' '+
							this.h2x+','+this.h2y+' '+
							this.h3x+','+this.h3y+' '+
							this.h4x+','+this.h4y+' '+
							this.h5x+','+this.h5y+' '+
							this.h6x+','+this.h6y;
					polygonSVG.attr('points', points);
					$('#m1').css({right: 750 - this.h1x, top:this.h1y});
					$('#m2').css({right: 750 - this.h2x, top:this.h2y});
					$('#m3').css({left: this.h3x, top:this.h3y});
					$('#m4').css({left: this.h4x, top:this.h4y});
					$('#m5').css({left: this.h5x, top:this.h5y});
					$('#m6').css({right: 750 - this.h6x, top:this.h6y});
				}
			});
			
			$('body > header > nav a').each(function(i, e) {
				var label = $(e).find('.text').first();
				var lines = $(e).find('.mainmenu-line1, .mainmenu-line2');
				var labelSettings = {};
				if (activeItem > 0 && i == activeItem - 1) {
					if (parseInt(lines.first().css('opacity')) > 0.5) return true;
					label.removeClass('nodelay').addClass('delayed');
					lines.removeClass('delayed').addClass('nodelay');
					lines.css('opacity', 1);
					if (activeItem == 1 || activeItem == 2 || activeItem == 6) {
						labelSettings['margin-left'] = -10;
					} else {
						labelSettings['margin-right'] = -10;
					}
				} else {
					if (parseInt(lines.first().css('opacity')) < 0.5 ) { return true; }
					label.removeClass('delayed').addClass('nodelay');
					lines.removeClass('nodelay').addClass('delayed');
					lines.css('opacity', 0);
					if (i == 0 || i == 1 || i == 5) {
						labelSettings['margin-left'] = -textWidths[i] - 35;
					} else {		
						labelSettings['margin-right'] = -textWidths[i] - 35;
					}
					if (activeItem == 0) activeItem = null;
				}
				label.css(labelSettings);
			});
		}
	};
};

WRC.Navigation = function() {
	"use strict";
	
	var self = this;
	
	this.state = 0;
	this.states = [];
	
	this.changeToSection = function(currentSection, scope, callback) {

		//FIND CORRESPONDING SECTION
		var targetState = self.findSectionIndex(currentSection);

		var oldState = this.state;
		if (targetState >= 0) {
			this.state = targetState;
		}
	
		callback.apply(scope, [oldState, targetState, currentSection]);
	};
	
	this.getPrevSection = function() {
		var prevLinkIndex = (this.state > 0) ? this.state - 1 : this.states.length - 1;
		return this.states[prevLinkIndex];
	};
	
	this.getNextSection = function() {
		var nextLinkIndex = (this.state < this.states.length - 1) ? this.state + 1 : 0;
		return this.states[nextLinkIndex];
	};
	
	this.goPrev = function() {
		window.location.hash = this.getPrevSection();
	};
	
	this.goNext = function() {
		window.location.hash = this.getNextSection();
	};
	
	this.findSectionIndex = function(currentSection) {
		var targetState = -1;
		var i;
		for (i = 0; i < this.states.length; i++)
		{
			var matchState = this.states[i];
			if (currentSection == matchState) {
				targetState = i;
				break;
			}
		}
		return targetState;
	};
	
};

WRC.CanvasTools = function() {
	"use strict";
	
	var self = this;
	
	this.ANIMATION_INFINITESCROLL = "animation_infinitescroll";
	this.ANIMATION_ROTATE = "animation_rotate";
	this.renderCanvas;
	this.renderContext;
	
	var frame = 0;
	var fpsCount = 0;
	var averageFps = 0;
	
	var degreesToRadians = Math.PI/180;
	var fps = 25;
	var renderElements = [];
	var renderTick, renderTime;
	var renderDisabled = false;
	var elapsed, actualFps;
	
	var transitionCanvasData, transParams;
	
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame || 
			function(callback){
				window.setTimeout(callback, 1000 / fps);
			};
	})();
	
	this.createRenderCanvas = function(w, h) {
		if (!this.renderCanvas) {
			this.renderCanvas = document.createElement('canvas');
			this.renderCanvas.width = w;
			this.renderCanvas.height = h;
			
			this.renderContext = this.renderCanvas.getContext('2d');
			this.renderContext.globalCompositeOperation = 'source-over';
		}

		return this.renderCanvas;
	};
	
	
	this.addToRenderQueue = function(canvas, x, y, animationType, start, end, duration, opacity) {
		var frames = duration * fps;
		var stepsize = (end - start) / frames;
		renderElements.push({canvas: canvas, x: x, y: y, type: animationType, start: start, end: end, step: 0, stepsize: stepsize, frames: frames, opacity: opacity});
	};
	
	this.startRender = function() {
		if (!renderTick) {
			$(this.renderCanvas).css('opacity', 1);
			//renderTime = new Date().getTime();
			(function animloop(){
				if (!renderDisabled) {
					requestAnimFrame(animloop);
					self.render();
				}
			})();
			renderTick = true;
		}	
	};
	
	this.render = function() {
		/*
		if (fpsCount < 3) {
			elapsed = new Date().getTime() - renderTime;
			if (elapsed >= 1000) {
				actualFps = frame;
				averageFps += actualFps;
				if (fpsCount == 2) {
					if (averageFps / 3 < fps) renderDisabled = true;
					//console.log(averageFps / 3);
					$(this.renderCanvas).css('opacity', 1);
				}				
				
				fpsCount++;
				frame = 0;
				renderTime = new Date().getTime();
			}
			frame++
		}*/
		
		var i, element, sx, w
		var wrapWidth = 0;
		var wrapX = 0;

		this.renderContext.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
		for (i = 0; i < renderElements.length; i++) {
			element = renderElements[i];
			this.renderContext.save();
			switch(element.type) {
				case this.ANIMATION_INFINITESCROLL:
					this.renderContext.save();
					//WRAP AROUND NEEDED?
					if (element.step * element.stepsize + this.renderCanvas.width > element.canvas.width) {
						wrapWidth = element.step * element.stepsize + this.renderCanvas.width - element.canvas.width;
						wrapX = this.renderCanvas.width - wrapWidth;
						
						//DEBUG
						/*
						this.renderContext.fillStyle = "rgb(255,0,0)";
						this.renderContext.fillRect (wrapX, 0, 5, this.renderCanvas.height);*/
		
						this.renderContext.drawImage(element.canvas, 0, 0, wrapWidth, this.renderCanvas.height, wrapX, 0, wrapWidth, this.renderCanvas.height);
					}
					
					this.renderContext.drawImage(element.canvas, element.step * element.stepsize, 0,  this.renderCanvas.width - wrapWidth, this.renderCanvas.height, 0, 0, this.renderCanvas.width - wrapWidth, this.renderCanvas.height);
					break;
					
				case this.ANIMATION_ROTATE:
					//this.renderContext.globalAlpha = element.opacity;
					this.renderContext.translate(this.renderCanvas.width * element.x * 0.01 + element.canvas.width * 0.5, element.y + element.canvas.height * 0.5);
					this.renderContext.rotate(element.step * element.stepsize * (Math.PI/180));
					this.renderContext.drawImage(element.canvas, -element.canvas.width * 0.5,  -element.canvas.height * 0.5);
					break;
			}
			this.renderContext.restore();
			element.step = (element.step < element.frames - 1) ? element.step + 1 : 0;
		}
		
	};
	
	this.stitchBackgrounds = function(images) {

		if (images.length < 2) return;
		
		transitionCanvasData = null;
		transParams = null;
		
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		
		canvas.width = $(window).width() * images.length;
		canvas.height =  $(window).height();
	
		var i;		
		var stitchImgObjects = [];
		var queue = images.length;

		for (i = 0; i < images.length; i++) {
			var img = new Image();
			stitchImgObjects.push(img);
			img.onload = function() {
				queue--;
				if (queue == 0) stitch(canvas, context, stitchImgObjects);
			};
			img.src = images[i];
		}
				
		return canvas;
	};
	
	
	var maxOffset = 40;
	var maxAlpha = 0.5;
	this.shake = function(canvas, percentage) {
		
		var context;
		if (!transitionCanvasData) {
			context = canvas.getContext('2d');
			transitionCanvasData = context.getImageData(0, 0, canvas.width, canvas.height);
		}
		
		if (!transParams) {
			transParams = {};
			transParams.context = context || canvas.getContext('2d');
			transParams.w = canvas.width;
			transParams.h = canvas.height;
			transParams.halfW = parseInt(canvas.width * .5);
			transParams.quarterW = parseInt(transParams.halfW * .5);
			transParams.halfH = parseInt(canvas.height * .5);
			transParams.leftCanvas = document.createElement('canvas');
			transParams.leftContext = transParams.leftCanvas.getContext('2d');
			transParams.leftCanvas.width = transParams.halfW;
			transParams.leftCanvas.height = transParams.h;
			
			transParams.rightCanvas = document.createElement('canvas');
			transParams.rightContext = transParams.rightCanvas.getContext('2d');
			transParams.rightCanvas.width = transParams.halfW;
			transParams.rightCanvas.height = transParams.h;
			
			transParams.context.clearRect(0, 0, transParams.w, transParams.h);
			transParams.context.putImageData(transitionCanvasData, 0, 0);			
			
			transParams.leftContext.putImageData(transitionCanvasData, 0, 0);
			transParams.rightContext.drawImage(canvas, transParams.halfW, 0, transParams.halfW, transParams.h, 0, 0, transParams.halfW, transParams.h);
		} else {
			transParams.context.clearRect(0, 0, transParams.w, transParams.h);
			transParams.context.putImageData(transitionCanvasData, 0, 0);
		}
		
		/* DEBUG
		transParams.rightCanvas.style.position = 'absolute';
		transParams.rightCanvas.style.top = 300;
		transParams.rightCanvas.style.left = 300;
		$('body').append(transParams.rightCanvas);
		return;
		*/

		
		var i;
		var easedPercentage = Math.abs(percentage - 0.5) * 2;
		var rotation, offsetX, offsetY;
		
		for (i = 0; i < 2; i++) {
			
			offsetX =  $.randomBetween(10, maxOffset - maxOffset * easedPercentage); //* ((Math.random() >= 0.5) ? 1 : -1);
			offsetY =  $.randomBetween(10, maxOffset - maxOffset * easedPercentage) * ((Math.random() >= 0.5) ? 1 : -1) * .6;
			
			transParams.context.globalAlpha = 0.5; //(percentage < 0.2 || percentage > 0.8) ? maxAlpha - maxAlpha * easedPercentage : 0.5;
	
			transParams.context.drawImage(transParams.leftCanvas, offsetX, offsetY);
			transParams.context.drawImage(transParams.rightCanvas, transParams.halfW - offsetX, offsetY);
			
		}
	};
	
	function stitch(canvas, context, stitchImgObjects) {
		
		var i;
		var frameW = Math.ceil(canvas.width / stitchImgObjects.length);
		var frameH = canvas.height;
			
		var tmpCanvas = document.createElement('canvas');
		var tmpContext = tmpCanvas.getContext('2d');
		tmpCanvas.width = frameW;
		tmpCanvas.height = frameH;


		var refImg = stitchImgObjects[0];
		var refImgRatio = refImg.width / refImg.height;
		var frameRatio = frameW / frameH;
		var scaling = 1;
		var w, h;
		var offsetX = 0;
		var offsetY = 0;
		if (refImgRatio > frameRatio) {
			//HEIGHT DOMINATED
			scaling = frameH / refImg.height;
			h = Math.round(refImg.height * scaling);
			w = Math.round(h  * refImgRatio);
			offsetX = Math.round((w - frameW) / 2);
		} else if (refImgRatio < frameRatio) {
			//WIDTH DOMINATED
			scaling = frameW / refImg.width;
			w = Math.round(refImg.width * scaling);
			h = Math.round(w  / refImgRatio);
			offsetY = Math.round((h - frameH) / 2);
		} else {
			//PROPORTIONS MATCH
			scaling = frameW / refImg.width;
			w = Math.round(refImg.width * scaling);
			h = Math.round(w  / refImgRatio);
		}
		
		for (i = 0; i < stitchImgObjects.length; i++) {
			var img = stitchImgObjects[i];
			tmpContext.drawImage(img, -offsetX, -offsetY, w, h);
			context.drawImage(tmpCanvas, 0, 0, frameW, frameH, i * frameW, 0, frameW, frameH);
		}
		
		transitionCanvasData = context.getImageData(0, 0, canvas.width, canvas.height);
	
		//self.shake(canvas, 0.5);
		if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.BACKGROUND_STITCH_READY, this);
		
		/* DEBUG
		self.shake(canvas, 0.5);
		tmpCanvas.style.position = 'absolute';
		tmpCanvas.style.top = 0;
		tmpCanvas.style.left = 0;
		$('body').append(tmpCanvas);
		*/
			
		
	};

	this.compositeAlpha = function(images) {
		
		if (images.length == 0) return;

		var canvas = document.createElement('canvas');
   		var context = canvas.getContext('2d');

		//FILL WITH SOLID COLOR BASED ON CSS color AND background-color
		var img, alpha;
		if (images.length == 1) {
			var color_1 = $(images[0]).css('color');
			var color_2 = ($(images[0]).prop('background-color')) ? $(images[0]).css('background-color') : color_1;
			alpha = images[0];
			img =  document.createElement('canvas');
			img.width = alpha.width;
			img.height = alpha.height;
			var imgContext = img.getContext('2d');
			imgContext.fillStyle = (Math.random() < 0.8) ? color_1 : color_2;
			imgContext.fillRect(0, 0, img.width, img.height);
		} else {
			img = images[0];
			alpha = images[1];
		}

		canvas.width = img.width;
		canvas.height = img.height;
		context.clearRect(0, 0, canvas.width, canvas.height);
				
		var i, id, data;
		var alphaCanvas = document.createElement('canvas');
		alphaCanvas.width = alpha.width;
		alphaCanvas.height = alpha.height;

		var alphaContext = alphaCanvas.getContext('2d');
		alphaContext.drawImage(alpha, 0, 0);

		id = alphaContext.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height);
		data = id.data;
		for (i = data.length - 1; i > 0; i -= 4) {
			data[i] = 255 - data[i - 3];
		}
		alphaContext.clearRect(0, 0, alphaCanvas.width, alphaCanvas.height)
		alphaContext.putImageData(id, 0, 0);

		context.drawImage(img, 0, 0);
		context.globalCompositeOperation = 'xor';
		context.drawImage(alphaCanvas, 0, 0);

		return canvas;
	};
};

WRC.ImageTools = function() {
	"use strict";

	var self = this;

	var queue = [];
	var loadedCount = [];
	var callbacks = [];

	function onImageLoad(batchIndex) {
		loadedCount[batchIndex]++;
		var currentBatch = queue[batchIndex];
		if (loadedCount[batchIndex] == currentBatch.length) {
			//DO A FINAL CHECK
			var allLoaded = true;
			var i;
			for (i = 0; i < currentBatch.length; i++) {
				if (typeof(currentBatch[i]) !== 'object' || currentBatch[i].complete !== true) allLoaded = false;
			}

			if (allLoaded) {
				callbacks[batchIndex](currentBatch);
			} else {
				//RETRY LATER
				setTimeout(function() {
					onImageLoad(batchIndex);
				}, 200);
			}
		}
	};

	function onImageError(batchIndex) {
		console.log("IMAGE LOAD ERROR", queue[batchIndex]);
	};

	function filledArray(length, val) {
		var array = [];
		var i = 0;
		while (i < length) array[i++] = val;
		return array;
	};

	this.compositeImages = function($container, noPreload) {

		var $images = $container.find('img');
		var $fallbackImg = $images.eq(0);
		var fileName =  $fallbackImg.data('src');

		/*
		var imgWidth = $images.eq(0).width();
		var imgHeight = $images.eq(0).height();

		//DETERMINE SCALING
		var i, photoScaling;
		var w = $(window).width();
		var h = $(window).height();
		for (i = 0.25; i <= 1; i += 0.25) {
			if (w > h) {
				if (w < imgWidth * i) {
					photoScaling = i;
					break;
				}
			} else {
				if (h < imgHeight * i) {
					photoScaling = i;
					break;
				}
			}
		}
		*/

		var resizeDirective = (fileName.indexOf('?') > 0) ? '?' + fileName.split('?')[1] : '';
		//var resizeDirective = "?action=thumbnail&width=" +  $(images[0]).width() + "&height=" +  $(images[0]).height();

		if (WRC.siteController.isIE && WRC.siteController.browserVersion < 10) {
			$fallbackImg.attr('src', fileName);
			$fallbackImg.css('display', 'block');
		} else {
			WRC.canvasTools = WRC.canvasTools || new WRC.CanvasTools();

			//SET UP COMPOSITE IMAGES
			var alphaSrc = fileName.split('full.png')[0] + 'alpha.jpg' + resizeDirective;
			var $alpha = $(document.createElement('img'));
			$alpha.attr('src', alphaSrc);

			//CHECK IF WE NEED AN OPAQUE IMAGES OR JUST THE ALPHA+COLOR
			if ($fallbackImg.attr('style') === undefined) {
				var opaqueSrc = fileName.split('full.png')[0] + 'opaque.jpg' + resizeDirective;
				var $opaque = $(document.createElement('img'));
				$opaque.attr('src', opaqueSrc);
			} else {
				$alpha.attr('style', $fallbackImg.attr('style'));
			}

			$images = ($opaque) ? $.merge($opaque, $alpha) : $alpha;

			if (noPreload) return $images;

			self.preloadImages($images).done(function($loadedImages) {
				var compositedCanvas = WRC.canvasTools.compositeAlpha($loadedImages);
				$container.append(compositedCanvas);
			});
		}
	};

	this.preloadImages = function($images) {

		var batchIndex = queue.length;
		var batch = filledArray($images.length, 0);
		loadedCount[batchIndex] = 0;

		var callback = function () {};
		callbacks[batchIndex] = callback;
		queue.push(batch);

		var i, $img;
		for (i = 0; i < $images.length; i++) {
			$img = $images.eq(i);
			var imgElement = $img.get(0);
			batch[i] = imgElement;

			if (imgElement.complete) {
				setTimeout(function() {
					onImageLoad(batchIndex);
				}, 50);
			} else {
				imgElement.onload = function () {
					onImageLoad(batchIndex);
				}

				imgElement.onerror = function () {
					onImageError(batchIndex);
				}
			}
		}

		return {
			done: function (f) {
				callbacks[batchIndex] = f || callbacks[batchIndex];
			}
		}
	}
};

WRC.CartTools = function() {
	//"use strict";
	
	var self = this;
	var contentRequest;
	
	this.refreshCart = function() {
		if ($('body').hasClass('shop')) {
			contentRequest = $.ajax({
				url: '/ModuleRender.aspx?module=module_cartSummary&template=/_System/ModuleTemplates/Shop/shop/cartSummary.html',
				type: "GET",
				dataType: 'html',
				cache: false,
				timeout: 20 * 1000
			}).success(function(response) {
				//FORMAT HUF PRICES
				var $summary = $(response);
				$('#cartsummary').html($summary.html());
				self.formatPrice();
			});

		} else {
			contentRequest = $.ajax({
				url: '/ModuleRender.aspx?module=module_cartSummary&template=/_System/ModuleTemplates/Shop/products/cartSummary.html',
				type: "GET",
				dataType: 'html',
				cache: false,
				timeout: 20 * 1000
			}).success(function(response) {
				//FORMAT HUF PRICES
				var $summary = $(response);
				$('#cartsummary').html($summary.html());
				self.formatPrice();
			});
		}
	};
		
	this.loadCartContents = function() {
		$('#cart-contents').load('/OrderRetrievev2.aspx?rnd=' + (new Date()).getTime() + ' #product-codes', function() {
			if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.CART_REFRESHED, this);
		});
	};
		
	var oAddToCart = window.AddToCart;
	window.AddToCart = function(a, b, c, d, x, e) {
		suppressAlert(true);

		//EXPOSE THE EVENT SOURCE
		var target;

		if (!e) var e = window.event;
		if (e != undefined) {
			if (e.target) {
				target = e.target;
			} else if (e.srcElement) {
				target = e.srcElement;
			}

			//SAFARI BUG
			if (target.nodeType == 3) target = target.parentNode;

			if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.ADDING_TO_CART, this, target);
		}

		oAddToCart.apply(this, arguments);
		self.refreshCart();
		suppressAlert(false);
	};

	//OVERRIDE THIS DUMB ASS IMPLEMENTATION
	window.initSocialMediaModules = function() {
		return false;
	};
	
	//SHOP SPECIFIC OVERRIDES
	if (window.CMS) {
			if (CMS.CatalogueRetrieve) {
			var oServerSideAddItemToOrder = CMS.CatalogueRetrieve.ServerSideAddItemToOrder;
			CMS.CatalogueRetrieve.ServerSideAddItemToOrder = function() {
				var result = oServerSideAddItemToOrder.apply(this, arguments);
				self.loadCartContents();
				return result;
			};
		}
	}
	
	//CART SPECIFIC OVERRIDES
	/*
	var oServerSideUpdateItemQuanity = CMS.OrderRetrievev2.__proto__.ServerSideUpdateItemQuanity;
	CMS.OrderRetrievev2.__proto__.ServerSideUpdateItemQuanity = function() {
		var result = oServerSideUpdateItemQuanity.apply(this, arguments);
		return result;
	};*/

	var oApplyDiscountCode = window.ApplyDiscountCode;
	window.ApplyDiscountCode = function() {
		oApplyDiscountCode.apply(this, arguments);
		if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.CART_REFRESHED, this);
	};

	var oUpdateItemQuantity = window.UpdateItemQuantity;
	window.UpdateItemQuantity = function(c, b, e, h, m, f, d) {
		suppressAlert(true);
		//var selectedShippingOption = $('#ShippingOptions option:selected').attr('value');
		oUpdateItemQuantity.apply(this, arguments);
		if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.CART_REFRESHED, this);

		//CAN'T SET SHIPPING WITHOUT USER INTERACTION, SIZE LIMIT MIGHT HAVE REACHED
		//$('#ShippingOptions option[value=' + selectedShippingOption + ']').attr('selected', 'selected');
		//$('.select .text-holder').eq(1).text($('#ShippingOptions option:selected').text());
		//$('#ShippingOptions').change();
		suppressAlert(false);
	};

	var oUpdateShipping = window.UpdateShipping;
	window.UpdateShipping = function() {
		suppressAlert(true);
		oUpdateShipping.apply(this, arguments);
		if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.CART_REFRESHED, this);
		suppressAlert(false);
	};

	var oSetShippingCountry = window.SetShippingCountry;
	window.SetShippingCountry = function() {
		suppressAlert(true);
		oSetShippingCountry.apply(this, arguments);
		if (WRC.eventDispatcher) WRC.eventDispatcher.dispatch(WRC.CART_REFRESHED, this);
		suppressAlert(false);
	};

	
	var oAlert = window.alert;
	function suppressAlert(disabled) {
		if (disabled) {
			window.alert = function(msg) {return false};
		} else {
			window.alert = oAlert;
		}
	};

	this.formatPrice = function($container) {
		if (!$container) $container = $('.formatted-price');

			$container.each(function(i, e) {
				var $this = $(this);
				if (siteHost.indexOf('hu.') > 0) {
					var price = $.trim($this.text());
					var amount;
					if (price.substr(0, 2).toLowerCase() === 'ft') {
						//MAY BE ALREADY FORMATTED
						amount = price.substring(2, price.indexOf('.'));
					} else if (price.substr(0, 1).toLowerCase() === '€') {
						amount = price.substring(1, price.indexOf('.'));
					}
					if (amount && amount.length > 0) {
						amount = amount.replace(',', ' ');
						price = amount + ' Ft';
						if (e.nodeType == 3) {
							var parentContainer = $this.parent();
							$this.remove();
							parentContainer.append(price);
						} else {
							$this.text(price);
						}
					}
				}
				$this.css('display', 'inline-block');
			});
	};
};

WRC.FormTools = function() {
	"use strict";
	
	var self = this;
	
	this.initializeForm = function() {
	
		//INITIALIZE ALL DROPDOWNS
		$('.select').each(function(i,e) {
			$(this).find('.text-holder').each(function(ti,te) {
				$(this).text($(e).find('select').eq(ti).find('option:selected').text());
			});
			
			$(e).find('select').first().change(function() {
				$(this).parent().find('.text-holder').first().text($(this).find('option:selected').text());
			});
		});
	};
	
};

WRC.CellGrid = function(svg, cellContainer) {
	"use strict";
	
	var self = this;

	var rows = 6;
	var cols = 13;
	var rowOffset = 82;
	var colOffset = 72;
	var innerCells =[];
	var grid = svg;
	var container = cellContainer;
	var ns = $(grid).attr('xmlns');
	var xlinkns = $(grid).attr('xmlns:xlink');
	
	this.init = function(c, r, cornersVisible) {

		//INIT FORM BG
		if (c) cols = c;
		if (r) rows = r;
		
		var duplicate;
		for (r = 0; r < rows; r++) {
			for (c = 0; c < cols; c++) {
				duplicate = document.createElementNS(ns, 'use');
				duplicate.setAttributeNS(xlinkns, 'xlink:href', '#dot');
				duplicate.setAttributeNS(null, 'transform', 'translate(' + (c * colOffset) + ' ' + (r * rowOffset + (c % 2) * rowOffset / 2) + ')');
				duplicate.setAttributeNS(null, 'style', 'opacity: 0;');
				//duplicate.setAttribute('onclick', 'javascript:alert("' + r  + " " + c + '");this.style.opacity = 0.2;');  // DEBUG
				container.get(0).appendChild(duplicate);
				if (r >= 0 && r <= rows - 1 && c >= 2 && c <= cols - 2) innerCells.push(r * cols + c);
			}
		}
		if (!cornersVisible) this.chopGridCorners();
	}
	
	this.clear = function() {
		container.empty();
	}

	this.getRows = function() {
		return rows;
	};

	this.getCols = function() {
		return cols;
	};

	this.getColOffset = function() {
		return colOffset;
	};
	
	this.getRowOffset = function() {
		return rowOffset;
	};
	
	this.getCells = function() {
		return container.find('use');
	};
	
	this.duplicateShape = function(x, y, color, opacity, scaling) {
		var duplicate = document.createElementNS(ns, 'use');
		duplicate.setAttributeNS(xlinkns, 'xlink:href', '#dot');
		duplicate.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + scaling + ')');
		duplicate.setAttribute('style', 'opacity: ' + opacity + ';');
		duplicate.setAttribute('fill', color);
		container.get(0).appendChild(duplicate);
		return duplicate;
	};
	
	this.chopGridCorners = function() {

		var c, r;
		var lowProbability = 0.1;
		
		//RESET ALL CELLS
		grid.find('use').each(function(i, e) {
			$(this).attr('style', '');
			$(this).css('opacity', 1);
		});
				
		//CORNERS
		var delay;
		var cellStyle;
		for (c = 3; c >= 0; c--) {
			for (r = 0; r < 2; r++) {
				delay = $.randomBetween(200, 1000) + 'ms';
				cellStyle = {'transition-delay': delay, '-moz-transition-delay': delay, '-webkit-transition-delay': delay, '-o-transition-delay': delay, 'opacity': 0};
				if (Math.random() > lowProbability) grid.find('use').eq(0 + r * cols + (c - r)).css(cellStyle);
				if (Math.random() > lowProbability) grid.find('use').eq((cols - 1) + r * cols - (c - r)).css(cellStyle);
				if (Math.random() > lowProbability) grid.find('use').eq((cols * rows - 1) - r * cols - (c - r)).css(cellStyle);
				if (Math.random() > lowProbability) grid.find('use').eq((rows - 1) * cols - r * cols + (c - r)).css(cellStyle);
			}
		}
		
		//INSIDE HIDDEN CELLS
		for (c = 0; c < 4; c++) {
			delay = $.randomBetween(200, 1000) + 'ms';
			cellStyle = {'transition-delay': delay, '-moz-transition-delay': delay, '-webkit-transition-delay': delay, '-o-transition-delay': delay, 'opacity': 0};
			var allInnerCells = innerCells.slice();
			var cellId = allInnerCells.splice($.randomBetween(0, allInnerCells.length - 1), 1);
			grid.find('use').eq(cellId).css(cellStyle);
		}
	};
};


/* ############################################################################################ */
/* UTILITIES */
/* ############################################################################################ */


WRC.EventDispatcher = function() { this.listeners = {}; };
WRC.EventDispatcher.prototype = {
	addEventListener:function(type, callback, scope) {
		var args = [];
		var numOfArgs = arguments.length;
		for(var i=0; i<numOfArgs; i++){
			args.push(arguments[i]);
		}		
		args = args.length > 3 ? args.splice(3, args.length-1) : [];
		if(typeof this.listeners[type] != "undefined") {
			this.listeners[type].push({scope:scope, callback:callback, args:args});
		} else {
			this.listeners[type] = [{scope:scope, callback:callback, args:args}];
		}
	},
	removeEventListener:function(type, callback, scope) {
		if(typeof this.listeners[type] != "undefined") {
			var numOfCallbacks = this.listeners[type].length;
			var newArray = [];
			for(var i=0; i<numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				if(listener.scope == scope && listener.callback == callback) {
					
				} else {
					newArray.push(listener);
				}
			}
			this.listeners[type] = newArray;
		}
	},
	dispatch:function(type, target) {
		var numOfListeners = 0;
		var event = {
			type:type,
			target:target
		};
		var args = [];
		var numOfArgs = arguments.length;
		for(var i=0; i<numOfArgs; i++){
			args.push(arguments[i]);
		};				
		args = args.length > 2 ? args.splice(2, args.length-1) : [];
		args = [event].concat(args);
		if(typeof this.listeners[type] != "undefined") {
			var numOfCallbacks = this.listeners[type].length;
			for(var i=0; i<numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				if(listener && listener.callback) {
					listener.args = args.concat(listener.args);
					listener.callback.apply(listener.scope, listener.args);
					numOfListeners += 1;
				}
			}
		}
	},
	getEvents:function() {
		var str = "";
		for(var type in this.listeners) {
			var numOfCallbacks = this.listeners[type].length;
			for(var i=0; i<numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
				str += " listen for '" + type + "'\n";
			}
		}
		return str;
	}
};
