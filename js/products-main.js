
/* ############################################################################################ */
/* PRODUCTS MAINPAGE */
/* ############################################################################################ */

var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;
	
	this.init = function() {
		$(window).load(function() {
			if (WRC.canvasTools) {
				setTimeout(function() {
					WRC.canvasTools.startRender();
				}, 3000);
			}
		});
		
		initializeNavigation();
		attachListeners();
		injectSVGImages();
		compositeImages();
	};
	
	this.updateState = function(oldState, newState, sectionPath) {
		
		var catalog, product;
		if (newState >= 0) {
			var path = WRC.navigation.states[newState].split("/");
			catalog = path[0];
			product = path[1];
		} else {
			catalog = sectionPath;
		}
		
		var catalogIndex = -1;
		var productIndex = -1;
		if (product) {
			$('#catalogs ul').each(function(i, e) {
				productIndex = $(e).find('li article a[href$="' + path.join('\/') + '"]').first().parents('li').first().index();
				if (productIndex >= 0) {
					catalogIndex = i;
					return false;
				}
			});
		} else {
			//NO PRODUCT, STEPS NAVIGATION WAS USED
			$('nav.steps li').each(function(i, e) {
				 var matchedCatalog = $(e).find('a[href$="#\\' + catalog +'"]').first().parents('li').first().index();
				 if (matchedCatalog >= 0) {
					 catalogIndex = matchedCatalog;
					 return false;
				 }
			});
		}

		if (catalogIndex < 0) catalogIndex = 0;
		//if (productIndex < 0) productIndex = 0;

		//SWITCH TO SELECTED CATALOG
		var $container = $('#catalogs ul').eq(catalogIndex);
		$('#catalogs').css('left', catalogIndex * -100 + '%');
		var itemCount = $container.find('li').length;

		if (productIndex < 0) productIndex =  itemCount - 1;

		//SWITCH TO SELECTED PRODUCT
		var screenWidth = $(window).width();
		var offsetPercentage = 80 / screenWidth * 100;
		$container.css('right', catalogIndex * -100 -(itemCount-productIndex-1) * offsetPercentage + '%');
		$container.find('li').each(function(i, e) {
			var $block = $(e);
			$block.toggleClass('active', (i == productIndex) ? true : false);
			var $linkBox = $block.find('a').first();
			$linkBox.unbind('mouseenter mouseleave');
			$linkBox.hover((i == productIndex) ? onActiveThumbnailOver : onThumbnailOver, (i == productIndex) ? onActiveThumbnailOut : onThumbnailOut);

			/*
			//CHECK IF BLOCK FITS INTO VIEW
			if (i == productIndex) {
				var blockPosition = $block.offset().left;
				var screenWidth = $(window).width();
				var offset = 0;
				if (blockPosition > screenWidth - (428 + 50)) {
					var offset = (screenWidth - (428 + 50)) - blockPosition;
				}

				var currentPosition = parseInt($container.css('left'));
				$container.css('left', currentPosition + offset + 'px');

				console.log(blockPosition, screenWidth, offset, currentPosition, currentPosition + offset);
			}
			*/

		});
		
		//SET PREV/NEXT BUTTONS
		$('nav.arrow-navigation > a.prev').attr('href', '#' + WRC.navigation.getPrevSection());
		$('nav.arrow-navigation > a.next').attr('href', '#' + WRC.navigation.getNextSection());
		
		//SET STEPS NAVIGATION
		$('nav.steps li').each(function(i, e) {
			$(e).toggleClass('inactive-step', (i == catalogIndex) ? false : true);
		});
	};
	
	
	
	function injectSVGImages() {
		//INJECT IMAGES INTO SVG SHAPES
		var resizeDirective = '?action=thumbnail&width=420&height=389';
		$('#catalogs article').each(function(i, e) {
			var $this = $(this);
			var $img = $this.find('img').first();
			var $cover = $this.find('.cover-photo').first();

			var src = $img.data('src');

			//CREATE LARGE COVER
			var opaqueSrc = src.split("full.png")[0] + 'opaque.jpg' + resizeDirective;
			var $coverImg = $(document.createElement('img'));
			$coverImg.data('src', src + resizeDirective);

			$cover.addClass('composite-alpha');
			$cover.append($coverImg);
		});

		checkEmbedsLoaded();
	};

	function setSVGCovers() {
		var resizeDirective = '?action=thumbnail&width=420&height=389';
		$('#catalogs article').each(function(i, e) {
			var $this = $(this);
			var $img = $this.find('img').first();
			var src = $img.data('src');
			var opaqueSrc = src.split("full.png")[0] + 'opaque.jpg' + resizeDirective;

			var embed = $this.find('embed').first().get(0);
			if (embed) {
				var root = embed.getSVGDocument().rootElement;
				if (root) {
					var xlink = root.getAttribute('xmlns:xlink');
					var coverContainer = root.getElementById('cover');
					coverContainer.setAttributeNS(xlink, 'href', opaqueSrc);
				} else {
					//TODO: NO SVG SUPPORT?
				}
			}
		});
	};

	function checkEmbedsLoaded() {
		var loadedCount = 0;
		var embedCount = $('#catalogs article').length;
		$('#catalogs article').each(function(i, e) {
			var $this = $(this);
			var embed = $this.find('embed').first().get(0);
			if (embed && embed.getSVGDocument()) {
				var root = embed.getSVGDocument().rootElement;
				if (root != null) {
					loadedCount++;
				}
			}
		});

		if (loadedCount == embedCount) {
			setSVGCovers();
		} else {
			setTimeout(checkEmbedsLoaded, 100);
			console.log('EMBED NOT LOADED');
		}
	};
	
	function initializeNavigation() {
		//FILL ORDER OF STATES
		WRC.navigation.states = [];
		var catalogname, productname;
		$('#catalogs article a').each(function(i,e) {
			var path = $(e).attr('href').split('/');
			var catalog = path[2];
			var product = path[3];
			WRC.navigation.states.push('/' + catalog + "/" + product);
		});
		
		//SWITCH TO DEFAULT STATE
		WRC.navigation.state = $('#catalogs ul').first().find('li').length - 1;
	};

	function compositeImages() {
		//COMPOSITE DUST IMAGES
		WRC.canvasTools = WRC.canvasTools || new WRC.CanvasTools();
		WRC.imageTools = WRC.imageTools || new WRC.ImageTools();

		var canvas = WRC.canvasTools.createRenderCanvas(document.body.offsetWidth, 550);
		$(canvas).addClass('animate-opacity');
		$('.dust li:first-child').append(canvas);

		$('.composite-alpha').each(function(i, e) {

			var $container = $(e);
			var $images = $container.find('img');

			if ($container.hasClass('infinite-bg-scroll') || $container.hasClass('animate-rotation-canvas')) {
				var $imagesToComposite = WRC.imageTools.compositeImages($container, true);
				if ($imagesToComposite) {
					WRC.imageTools.preloadImages($imagesToComposite).done(function($loadedImages) {
						var compositedCanvas = WRC.canvasTools.compositeAlpha($loadedImages);
						if ($container.hasClass('infinite-bg-scroll')) {
							WRC.canvasTools.addToRenderQueue(compositedCanvas, 0, 0, WRC.canvasTools.ANIMATION_INFINITESCROLL, 0, compositedCanvas.width, 50);
						} else {
							WRC.canvasTools.addToRenderQueue(compositedCanvas, parseInt($container.css('left')), $.randomBetween(50, 150), WRC.canvasTools.ANIMATION_ROTATE, 0, (Math.random() > 0.4) ? 360 : -360,  $.randomBetween(20, 40), $.randomBetween(7, 9) * 0.1);
						}
					});
				} else {
					$container.find('img').removeAttr('style');
					WRC.imageTools.compositeImages($container);

				}
			} else {
				WRC.imageTools.compositeImages($container);
			}
		});
	};

	/*
	function compositeImages() {
		//COMPOSITE DUST IMAGES
		WRC.canvasTools = WRC.canvasTools || new WRC.CanvasTools();
		WRC.imageTools = WRC.imageTools || new WRC.ImageTools();


		$(canvas).addClass('animate-opacity');
		$('.dust li:first-child').append(canvas);
		$('.composite-alpha').each(function(i, e) {

			var images = [];
			var $container = $(e);
			$container.find('img').each(function(imgIndex, img) {
				images.push($(img));
			});

			WRC.imageTools.preloadImages(images).done(function(loadedImages) {
				var compositedCanvas = WRC.canvasTools.compositeAlpha(loadedImages);
				if ($container.hasClass('infinite-bg-scroll'))
				{
					WRC.canvasTools.addToRenderQueue(compositedCanvas, 0, 0, WRC.canvasTools.ANIMATION_INFINITESCROLL, 0, compositedCanvas.width, 50);
				} else if ($container.hasClass('animate-rotation-canvas')) {
					WRC.canvasTools.addToRenderQueue(compositedCanvas, parseInt($container.css('left')), $.randomBetween(50, 150), WRC.canvasTools.ANIMATION_ROTATE, 0, (Math.random() > 0.4) ? 360 : -360,  $.randomBetween(20, 40), $.randomBetween(7, 9) * 0.1);
				} else {
					$container.append(compositedCanvas);
				}
			});
		});		
	};
	*/

	function resizeDust() {
		if (WRC.canvasTools) {
			var canvas = WRC.canvasTools.createRenderCanvas();
			canvas.width = document.body.offsetWidth;
		}
	};
	
	function attachListeners() {
		var resizeTimeout;
		
		//LISTEN TO RESIZE
		$(window).resize(function(){
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function() {
				resizeDust();
			}, 300);
		});

		if (WRC.siteController.isIE) {
			self.updateState();
		}

		//LISTEN TO STATE CHANGE
		$.address.bind('change', function(event) {
			WRC.navigation.changeToSection(event.path, self, self.updateState);
		});
	};
	
	function svgThumbnailEffect(svg, hovered) {
		var root =  svg.getSVGDocument().rootElement;

		if (root) {
			var coverContainer = root.getElementById('cover');
			var shine = root.getElementById('shine');
			coverContainer.setAttribute('class', (hovered) ? 'dimmable dimmed' : 'dimmable');

			shine.setAttribute('class', (hovered) ? 'dimmable dimmed' : 'dimmable');
		}
	};

	function onThumbnailOver(event) {
		svgThumbnailEffect($(event.target).parent().find('embed').first().get(0), true);
	};
	
	function onThumbnailOut(event) {
		svgThumbnailEffect($(event.target).parent().find('embed').first().get(0), false);
	};
	
	
	function onActiveThumbnailOver() {

	};
	
	function onActiveThumbnailOut() {

	};
	
}
