

/* ############################################################################################ */
/* SHOPPING CART PAGE */
/* ############################################################################################ */


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

	var quantityChangeDelay;
	
	this.init = function() {
		attachListeners();

		WRC.cartTools = WRC.cartTools || new WRC.CartTools();
		this.onCartRefresh();

		//DETECT VISITOR IP SETTINGS
		//SELECT APPROPRIATE COUNTRY
		var $selectedOption = $('#shippingCountry option[selected="selected"]');
		if ($selectedOption.attr('value') == 'IE' && visitorCountryCode != 'IE') {
			$('#shippingCountry option').removeAttr('selected');
			$('#shippingCountry option[value=' + visitorCountryCode + ']').attr('selected', 'selected');
			$('#shippingCountry').change();
		}
	};
	
	this.changeQuantity = function(itemCount, amount) {

		//DISPLAY PRELOADER INSTEAD OF INPUT
		var $cell = $('#product-quantities > .productitemcell').eq(itemCount);
		var $inputField = $cell.children('input').first();

		var currentValue = parseInt($inputField.attr('value'));
		if (amount < 0) {
			if (currentValue > 0) {
				currentValue--;
			}
		} else {
			currentValue++;
		}

		$inputField.attr('value', currentValue);

		//ADD PRELOAD TO BUTTON
		var $positionElement = $('.totals p:last-child');

		var x = Math.round($positionElement.offset().left);
		var y = Math.round($positionElement.offset().top);

		var $preload = $('#preload');
		$preload.css({'width': '32px', 'height': '32px', 'margin-top': '-8px', 'margin-left': '268px', 'left': x, 'top': y});
		$preload.removeClass('paused');


		clearTimeout(quantityChangeDelay);
		quantityChangeDelay = setTimeout(function() {
			$inputField.change();
		}, 1000);

	};
	
	this.onCartRefresh = function() {

		//REPLACE EMPTY CART MESSAGE
		if ($('.page').length == 0) {
			$('a.cartLink').first().each(function(i, e) {
				$(e).html(Oshoplang.CartEmptyFormatted).attr("href", "/products");
			});
		}
		
		$('.page.cart').each(function() {
			refreshCartDisplay();
			resizeContentColumn();
			jsp = $('.page > article').jScrollPane(scrollSettings).data('jsp');
		
			WRC.formTools = WRC.formTools || new WRC.FormTools();
			WRC.formTools.initializeForm();

			//SET THE LINK FOR SHIPPING BUTTON
			var checkoutLink = $('.navigate-cart a').first();
			$('nav.steps li').eq(1).find('a').first().attr('href', checkoutLink.attr('href')).attr('onclick', checkoutLink.attr('onclick'));
		});

		var $preload = $('#preload');
		if (!$preload.hasClass('paused')) {
			setTimeout(function(){
				$preload.addClass('paused');
				$preload.removeAttr('style');
			}, 1000);
		}

		//FORMAT PRICES
		WRC.cartTools.formatPrice();
	};
	
	function attachListeners() {
		if (WRC.eventDispatcher) WRC.eventDispatcher.addEventListener(WRC.CART_REFRESHED, self.onCartRefresh);
		
		//LISTEN TO RESIZE
		$(window).resize(function(){
			resizeContentColumn();
		});
	};
	
	function refreshCartDisplay() {
		if ($('.page').hasClass('cart')) {
			$('#products-container').each(function(i,e){

				//PRODUCT THUMBNAILS
				$(e).find('#product-thumbnails > .productitemcell > img').each(function(i,e) {
					$(e).after('<a><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="185px" height="160px" viewBox="0 0 185 160" xml:space="preserve"><g><defs><polygon id="inside" points="127.82,139 57.18,139 24,79.5 57.18,20 127.82,20 161,79.5"/></defs><clipPath id="clip"><use xlink:href="#inside" overflow="hidden"/></clipPath><g clip-path="url(#clip)"><image overflow="hidden" width="185" height="160" xlink:href="' + $(e).attr("src") + '"></image></g></g></svg><div class="vectorsprite thumbnail-stroke"></div></a>');
					$(e).css('display', 'none');
				});
				
				//UNIT PRICES
				$(e).find('#unit-prices > .productitemcell').each(function(i,e) {
					$(e).prepend('<span>Unit price</span>');
				});
				
				//QUANTITIES
				$(e).find('#product-quantities > .productitemcell').each(function(i, e) {
					$(e).children('input').each(function() {
						$(this).attr('disabled', 'disabled')
						.addClass('vectorsprite quantity-button')
						.after('<div class="quantity-controls"><a class="decrease" onClick="WRC.pageController.changeQuantity(' + i + ', -1);return false;"><div class="vectorsprite quantity-button"></div><span>-</span></a><a class="increase" onClick="WRC.pageController.changeQuantity(' + i + ', 1);return false;"><div class="vectorsprite quantity-button"></div><span>+</span></a></div>');
					});
				});
				
				//UNIT PRICES
				$(e).find('#subtotals > .productitemcell').each(function(i,e) {
					$(e).prepend('<span>Subtotal</span>');
				});
				
				//REMOVE BUTTONS
				$(e).find('#remove-buttons > .productitemcell > a').each(function(i,e) {
					$(e).empty().addClass('vectorsprite remove');
				});
				
				//BUTTON EVENTS
				$(e).find('#product-thumbnails > .productitemcell').each(function(i,e) {
					$(e).children('a').first().attr('href', $('#product-names > .productitemcell').eq(i).children('a').attr('href'));
				});
			});

			//FORMAT PRICES
			var $unitPrices = $('#unit-prices .productitemcell, #subtotals .productitemcell').contents().filter(function() {
				return this.nodeType === 3; //Node.TEXT_NODE
			});

			WRC.cartTools = WRC.cartTools || new WRC.CartTools();
			WRC.cartTools.formatPrice($unitPrices);
		}
	};
	
	function resizeContentColumn() {
		
		var products = $('#product-codes .productitemcell');
		var maxProductContainerWidth = (parseInt(products.first().css('width')) + parseInt(products.first().css('margin-left')) * 2) * products.length;
			
		var infoColumn = $('.page > aside').first();
		var infoColumnWidth = infoColumn.width() + parseInt(infoColumn.css('margin-right'));
	
		var contentWidth = $(window).width() - (infoColumn.offset().left + infoColumnWidth);
		if (contentWidth > maxProductContainerWidth) contentWidth = maxProductContainerWidth;
		$('.page > article').css('width', contentWidth);

		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			if (jsp) jsp.reinitialise();
		}, 300);
	};
};