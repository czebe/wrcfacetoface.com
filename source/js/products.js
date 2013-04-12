


/* ############################################################################################ */
/* PRODUCT PAGE */
/* ############################################################################################ */

var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;

	var buyButton = new WRC.BuyButton();
	var repositionTimeout;
	var navigationInProgress;
	var articleCount = $('#product-container > article').length;
	var wheelScrollEnabled = true;
	var fbScrollEnabled = false;
	var fbScrollSettings = {
		autoReinitialiseDelay: 1000,
		verticalDragMinHeight: 110,
		verticalDragMaxHeight: 110,
		showArrows: false
	};
	
	
	
	this.init = function() {

		WRC.cartTools = WRC.cartTools || new WRC.CartTools();
		WRC.cartTools.refreshCart();

		fbScrollSettings.autoReinitialise = false;
		$('article.facebook-comments').jScrollPane(fbScrollSettings);

		renderProductShots();
		initializeNavigation();
		attachListeners();
		compositeImages();

		//SHOW ARROW NAVIGATION IF NEEDED
		if (articleCount > 1) {
			if (WRC.siteController.isIE) {
				$('.arrow-navigation').css('display', 'block');
			} else {
				$(window).load(function() {
					$('.arrow-navigation').css('display', 'block');
				});
			}
		}
	};
	
	
	this.updateState = function(oldState, newState, sectionPath) {

		if (!newState || newState < 0) newState = 0;
		var $article = $('#product-container > article').eq(newState);

		var dustPosition = -Math.round(($('.dust').width() - $(window).width() / 2) * (newState / (articleCount - 1)));
		var rocksPosition = -Math.round(($('.rocks').width() - $(window).width()) * (newState / (articleCount - 1)));
		$('.dust').css('left', dustPosition);
		$('.rocks').css('left', rocksPosition);

		var targetPosition = - parseInt($article.outerWidth(true) / 2) - Math.round($article.position().left);
		$('#product-container').css('margin-left', targetPosition);

		//ENABLE / DISABLE FB SCROLLBAR
		if (newState > WRC.navigation.states.length - 3) {
			if (!fbScrollEnabled) {
				fbScrollSettings.autoReinitialise = true;
				$('article.facebook-comments').jScrollPane(fbScrollSettings);
				$('article.facebook-comments').hover(function() {wheelScrollEnabled = false;}, function() {wheelScrollEnabled = true;});
				fbScrollEnabled = true;
			}
		} else {
			if (fbScrollEnabled) {
				fbScrollSettings.autoReinitialise = false;
				$('article.facebook-comments').jScrollPane(fbScrollSettings);
				$('article.facebook-comments').unbind('mouseenter mouseleave');
				fbScrollEnabled = false;
				wheelScrollEnabled = true;
			}
		}

		//SET PREV/NEXT BUTTONS
		$('nav.arrow-navigation > a.prev').attr('href', '#' + WRC.navigation.getPrevSection());
		$('nav.arrow-navigation > a.next').attr('href', '#' + WRC.navigation.getNextSection());

		if (repositionTimeout) clearTimeout(repositionTimeout);
		repositionTimeout = setTimeout(function() {
			buyButton.reposition(newState);
		}, 1200);
	};

	function getPosition(e)
	{
		var left = 0;
		var top  = 0;

		while (e.offsetParent) {
			left += e.offsetLeft;
			top  += e.offsetTop;
			e = e.offsetParent;
		}

		left += e.offsetLeft;
		top += e.offsetTop;
		return {x:left, y:top};
	};

	this.onCartRefresh = function(event) {
		//DISABLE EACH ITEM THAT'S ALREADY IN THE CART
		//FROM SHOP JS!
		
	};

	this.addingToCart = function(event, source) {
		$('#buy').css('display', 'none');
	};
	
	function renderProductShots() {

		WRC.imageTools = WRC.imageTools || new WRC.ImageTools();
		WRC.canvasTools = WRC.canvasTools || new WRC.CanvasTools();

		//SET IMAGE SCALING SIZE & TEST CANVAS SUPPORT
		var ratio = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

		//TODO CHECK CANVAS SUPPORT WITH MODERNIZR
		var renderToCanvas = (document.createElement('canvas').getContext('2d')) ? true : false;

		//DISABLE CANVAS FOR OLDER BROWSERS
		if (WRC.siteController.isIE && WRC.siteController.browserVersion < 10) renderToCanvas = false;

		var $container, $img, src, $opaque, $alpha, w, h;
		$('.cover-photo, .book-large, .book-small').each(function(i, e) {
			$container = $(e);
			$img = $container.find('img').first();
			src = $img.data('src').split("?")[0].split("full.png")[0];
			w = Math.round(parseInt($img.attr('width')) * ratio);
			h = Math.round(parseInt($img.attr('height')) * ratio);
			var resizeDirective = "?action=thumbnail&width=" + w + "&height=" + h + "&algorithm=fill";

			if (renderToCanvas) {
				if ($container.hasClass('cover-photo')) resizeDirective = "";
				$img.data('src',  src + "full.png" + resizeDirective);
				$container.addClass("composite-alpha");
			} else {
				$img.attr('src', src + "full.png" + resizeDirective);
			}
		});
	};
	
	function compositeImages() {
		//COMPOSITE DUST IMAGES
		WRC.imageTools = WRC.imageTools || new WRC.ImageTools();
		$('.composite-alpha').each(function(i, e) {
			WRC.imageTools.compositeImages($(e));
		});
	};

	function initializeNavigation() {
		//FILL ORDER OF STATES
		WRC.navigation.states = [];
		$('#product-container > article').each(function(i,e) {
			WRC.navigation.states.push('/details-' + i);
		});
		
	};
	
	function attachListeners() {
		//LISTEN TO STATE CHANGE
		$.address.bind('change', function(event) {
			WRC.navigation.changeToSection(event.path, self, self.updateState);
		});

		if (WRC.siteController.isIE) {
			self.updateState();
		}

		if (WRC.eventDispatcher) {
			WRC.eventDispatcher.addEventListener(WRC.CART_REFRESHED, self.onCartRefresh);
			WRC.eventDispatcher.addEventListener(WRC.ADDING_TO_CART, self.addingToCart);
		}
		
		//WHEEL NAVIGATION
		if (articleCount > 1) {
			$('#product-container').bind('mousewheel', function(event, delta) {	
				if (wheelScrollEnabled) {
					if (navigationInProgress) return;
					event.preventDefault();
					if (delta < 0) {
						WRC.navigation.goNext();
					} else {
						WRC.navigation.goPrev();
					}
					navigationInProgress = setTimeout(function() {
						clearTimeout(navigationInProgress);
						navigationInProgress = null;
					}, 700);
				}
			});
		}
	};
};


WRC.BuyButton = function() {
	"use strict";
	
	var self = this;
	
	var offsetX = 0;
	var offsetY = 0;
	var maxOffsetX = 120;
	var maxOffsetY = 80;
	var visible = false;
	var rubberBandScaleX = 1;
	var rubberBandScaleY = 1;
	
	var largeDot = $('#buy > div.buy-button');
	var smallDot = $('#buy > div.small-dot');
	var rubberBand = $('#buy > div.rubber-band');
	var rubberBandSVG = $('#rubber-band-SVG');
	
	var smallDotOriginX = $(smallDot).width() / 2;
	var smallDotOriginY = $(smallDot).height() / 2;
	var largeDotOriginX = $(rubberBand).width() - parseInt($(largeDot).css('left'));
	var largeDotOriginY = Math.abs(parseInt($(largeDot).css('top')) - parseInt($(rubberBand).css('top')));
	var largeDotTop = parseInt($(largeDot).css('top'));
	var largeDotLeft = parseInt($(largeDot).css('left'));
	
	this.reposition = function(state, instantly) {
	
		var instantly, targetPosition, buyLeft, buyTop;
		var article = $("#product-container > article").eq(state);
		var buyPosition = article.find('div.buy-position').first();
		var docW = $(document).width();
		var docH = $(document).height();
		
		if (buyPosition.length > 0) {
			
			buyLeft = parseInt($("#buy").css('margin-left'));
			buyTop = parseInt($("#buy").css('margin-top'));
			
			//PRODUCT-DETAILS HAS TOP MARGIN, NEED TO OFFSET 
			var articleHeight = (state == 0) ? article.find('.product-details').first().height() + 130 : article.height()
			targetPosition = {left:  docW / 2 - article.width() / 2 + parseInt(buyPosition.position().left), top: docH / 2 - articleHeight / 2 + parseInt(article.css('margin-top')) / 2 + parseInt(buyPosition.position().top)};

			offsetX = (parseInt(targetPosition.left) - docW / 2 - buyLeft);
			offsetY = (parseInt(targetPosition.top) - docH / 2 - buyTop);
			
			if ($("#buy").css('visibility') != 'visible') {
				instantly = true;
				show();
			}
		} else {
			hide();
			return;
		}
		
		if (!instantly) {
			if (Math.abs(offsetX) > maxOffsetX) offsetX = parseInt(maxOffsetX * (Math.abs(offsetX) / offsetX));
			if (Math.abs(offsetY) > maxOffsetY) offsetY = parseInt(maxOffsetY * (Math.abs(offsetY) / offsetY));
		}
		
		//OVERRIDE IF SCREEN IS SMALLER
		if (buyLeft + offsetX > docW / 2 - 260) offsetX = docW / 2 - 260 - buyLeft;
		if (buyTop + offsetY < -docH / 2 + 130) offsetY = -docH / 2 + 130 - buyTop;
			
		if (!instantly) {
			$(smallDot).animate({
				'left': offsetX - smallDotOriginX,
				'top': offsetY - smallDotOriginY
			}, { 
				duration: 800,
				easing: 'easeOutExpo',
				step: render
			});
	
			$(largeDot).delay(500).animate({
				'left': offsetX + largeDotLeft,
				'top': offsetY + largeDotTop
			}, { 
				duration: 1000,
				easing: 'easeOutElastic',
				step: render,
				complete: function() {
					//RESET EVERYTHING BACK TO NORMAL
					self.reset();
				}
			});
		} else {
			self.reset();
		}
	};
	
	this.reset = function() {
		$(largeDot).stop(true, false);
		$(smallDot).stop(true, false);
		$(smallDot).removeAttr('style');
		$(largeDot).removeAttr('style');
		$(rubberBand).removeAttr('style');
		flipRubberBand(1, 1);
		rubberBandScaleX = 1;
		rubberBandScaleY = 1;
		
		$("#buy").css({'margin-left': "+=" + offsetX, 'margin-top': '+=' + offsetY});
		
		offsetX = 0;
		offsetY = 0;
	};
	
	function show() {
		$('#buy a').hover(onOver, onOut);
		$("#buy").css({'opacity': 1, 'visibility': 'visible'});
	};
	
	function hide() {
		$("#buy").css({'opacity': 0, 'visibility': 'hidden'});
		$('#buy a').unbind('mouseenter mouseleave');
	};
	
	function render(now, fx) {
		if (fx.prop == 'left') {
			
			var smallLeft = parseInt($(smallDot).css('left')) + smallDotOriginX;
			var largeLeft = parseInt($(largeDot).css('left')) + largeDotOriginX;
			var w =  largeLeft - smallLeft;
			var xpos = smallLeft;
		
			if (w < 0)
			{
				xpos = largeLeft;
				w *= -1;
				flipRubberBand(-1, rubberBandScaleY);
			}
			else
			{
				flipRubberBand(1, rubberBandScaleY);
			}
						
			$(rubberBand).css({
				'width': w,
				'left': xpos
			});
			
		} else if (fx.prop == 'top') {
			
			var smallTop = parseInt($(smallDot).css('top')) + smallDotOriginY;
			var largeTop = parseInt($(largeDot).css('top')) + largeDotOriginY;
			var h = smallTop - largeTop;
			var top = largeTop;
			
			if (h < 0)
			{
				h *= -1;
				top = smallTop;
				flipRubberBand(rubberBandScaleX, -1);
			}
			else
			{
				flipRubberBand(rubberBandScaleX, 1);
			}
			
			$(rubberBand).css({
				'height': h,
				'top': top
			});
		}
	};
	
	function onOver() {
		$('#buy .buy-button .bg').css('width', 200);
		$('#buy .price').css('opacity', 1);
	};
	
	function onOut() {
		$('#buy .price').css('opacity', 0);
		$('#buy .buy-button .bg').css('width', 40);
	};
	
	function flipRubberBand(h, v) {
		if (rubberBandScaleX == h && rubberBandScaleY == v) return;
		
		/* SCALING DOESN'T WORK RELIABLY
		$(rubberBandSVG).css({
			'-webkit-transform': 'scale(' + h + ',' + v + ')',
			'-moz-transform': 'scale(' + h + ',' + v + ')',
			'-o-transform': 'scale(' + h + ',' + v + ')',
			'-ms-transform': 'scale(' + h + ',' + v + ')',
			'transform': 'scale(' + h + ',' + v + ')'
		});
		*/
		
		//DRAW THE LINE INSTEAD
		//x1="0" y1="30" x2="22" y2="0"
		var line = $('#rubber-band-SVG').get(0).getElementById('rubber-line');
		line.setAttribute('x1', (h > 0) ? '0' : '22');
		line.setAttribute('x2', (h > 0) ? '22' : '0');
		line.setAttribute('y1', (v > 0) ? '30' : '0');
		line.setAttribute('y2', (v > 0) ? '0' : '30');
		
		
		rubberBandScaleX = h;
		rubberBandScaleY = v;
		
	};
	
};