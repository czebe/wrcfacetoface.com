
var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;

	var jsp;
	var resizeTimeout;
	var scrollSettings = {
		horizontalDragMinWidth: 111,
		horizontalDragMaxWidth: 111,
		horizontalTrackWidth: 331,
		showArrows: false,
		hideFocus: true
	};
	
	var products = $('#products-container ul:not(.empty-catalog) li');
	var infoColumn = $('.page > aside').first();
	var infoColumnWidth = infoColumn.width() + parseInt(infoColumn.css('margin-right')) * 2;

	this.init = function() {
		initializeNavigation();
		attachListeners();
		resizeContentColumn();
		jsp = $('#products-container').jScrollPane(scrollSettings).data('jsp');
		WRC.cartTools = WRC.cartTools || new WRC.CartTools();
		WRC.cartTools.loadCartContents();
		WRC.cartTools.refreshCart();
		this.onCartRefresh();
	};
	
	this.onCartRefresh = function(event) {
		//DISABLE EACH ITEM THAT'S ALREADY IN THE CART
		$('#cart-contents .productitemcell').each(function(i, e) {
				var code = $(e).text();
				//LOOP THROUGH EACH PRODUCT
				$('#products-container article[data-code*="' + code + '"] nav.addtocart').empty().addClass('vectorsprite checked');
		});

		var $preload = $('#preload');
		$preload.addClass('paused');
		$preload.removeAttr('style');

		$("#products-container").css('pointer-events', 'auto');

		//if (jsp) jsp.scrollToX(0);
	};

	this.addingToCart = function(event, source) {
		//ADD PRELOAD TO BUTTON

		$("#products-container").css('pointer-events', 'none');

		var $container = $(source).parents('nav').first();
		var x = Math.round($container.offset().left);
		var y = Math.round($container.offset().top);

		$container.empty();

		var $preload = $('#preload');
		$preload.css({'width': '40px', 'height': '33px', 'margin-top': '0', 'margin-left': '35px', 'left': x, 'top': y});
		$preload.removeClass('paused');
	};
	
	this.updateState = function(oldState, newState, sectionPath) {
		if (newState < 0) newState = 0;
		if (newState == 0) {
			$('#products-container ul:not(.empty-catalog)').css('width',  'auto');
		} else {
			$('#products-container ul').css('width', '0').eq(newState - 1).css('width',  'auto');
		}
		
		//SET STEPS NAVIGATION
		var i;
		for (i = 0; i < WRC.navigation.states.length; i++) {
			$('nav.steps li').eq(i).toggleClass('inactive-step', (i == newState) ? false : true);
		}

		if (jsp) {
			resizeContentColumn();
			jsp.scrollToX(0);
		}
	};
	
	function initializeNavigation() {
		//INIT ALL STEP BUTTONS
		WRC.navigation.states = [];
		$('nav.steps li a').each(function(i,e) {
			WRC.navigation.states.push($(e).attr('href').split('#')[1]);
		});
	};
	
	function attachListeners() {
		
		//LISTEN TO RESIZE
		$(window).resize(function(){
			resizeContentColumn();
		});
		
		if (WRC.eventDispatcher) {
			WRC.eventDispatcher.addEventListener(WRC.CART_REFRESHED, self.onCartRefresh);
			WRC.eventDispatcher.addEventListener(WRC.ADDING_TO_CART, self.addingToCart);
		}
				
		//PROCESS CURRENT STATE
		$.address.bind('change', function(event) {
			WRC.navigation.changeToSection(event.path, self, self.updateState);
		});

		//UNMASK PRODUCT THUMBNAILS
		$('a.thumbnail').each(function(i, e) {
			$(e).hover(function() {
				$(this).find('.thumbnail-image').attr('clip-path', 'none');
			}, function() {
				$(this).find('.thumbnail-image').attr('clip-path', 'url(#clip)');
			});
		});

	};
	
	function resizeContentColumn() {
		var contentWidth = $(window).width() - infoColumnWidth;

		var productsInCategory = (WRC.navigation.state == 0) ? products.length : $('#products-container ul:not(.empty-catalog)').eq(WRC.navigation.state - 1).find('li').length;
		var maxProductContainerWidth = (parseInt(products.first().css('width')) + parseInt(products.first().css('margin-left')) * 2) * productsInCategory;
						
		if (contentWidth > maxProductContainerWidth) contentWidth = maxProductContainerWidth;
		$('#products-container').css('width', contentWidth);

		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			if (jsp) jsp.reinitialise();
		}, 300);
	};
};
