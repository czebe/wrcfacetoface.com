

/* ############################################################################################ */
/* ORDER PAGE */
/* ############################################################################################ */


var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";

	var self = this;

	var submitInProgress = false;
	var panelSpacing = 500;
	var formBackground;
	
	this.init = function() {
		
		formBackground = new WRC.CellGrid($('#form-bg'), $('#form-bg-shapes'));
		formBackground.init();
		
		WRC.formTools = WRC.formTools || new WRC.FormTools();
		WRC.formTools.initializeForm();
		
		initializeNavigation();
		attachListeners();
	};
	
	
	this.submitForm = function(f) {

		if (!f) f = $('form').first().get(0);
		var errorMessage = "";

		if (f.FirstName) errorMessage += isEmpty(f.FirstName.value, "First name");
		if (f.LastName) errorMessage += isEmpty(f.LastName.value, "Last name");
		if (f.EmailAddress) errorMessage += checkEmail(f.EmailAddress.value);

		if (f.ShippingAddress) errorMessage += isEmpty(f.ShippingAddress.value, "Shipping address");
		if (f.ShippingCity) errorMessage += isEmpty(f.ShippingCity.value, "Shipping city");
		if (f.ShippingZip) errorMessage += isEmpty(f.ShippingZip.value, "Shipping postcode");
		if (f.ShippingCountry) errorMessage += isEmpty(f.ShippingCountry.value, "Shipping country");
		
		if (f.BillingSameAsShipping.checked == false) {
			if (f.BillingAddress) errorMessage += isEmpty(f.BillingAddress.value, "Billing address");
			if (f.BillingCity) errorMessage += isEmpty(f.BillingCity.value, "Billing city");
			if (f.BillingZip) errorMessage += isEmpty(f.BillingZip.value, "Billing postcode");
			if (f.ShippingCountry) errorMessage += isEmpty(f.ShippingCountry.value, "Billing country");			
		}
		
		if (errorMessage != "") {
			alert(errorMessage);
			return false;
		}
		
		if (!submitInProgress) {
			submitInProgress = true;
			f.submit();
			return false;
		} else {
			alert("Form submission is in progress.");
			return false;
		}
	};
	
	this.updateState = function(oldState, newState, sectionPath) {
		
		if (newState < 0) newState = 0;

		$('form > div').each(function(i,e) {
			var showPanel = (i == newState) ? true : false;
			$(e).toggleClass('hidden-panel', !showPanel).toggleClass('visible-panel', showPanel);
			$(e).toggleClass('animate-slide', false).css('left', i * panelSpacing - oldState * panelSpacing).toggleClass('animate-slide', true).css('left', i * panelSpacing - newState * panelSpacing);
		});
		
		//CHECK FOR FINAL STATE -- NO NEXT BUTTON
		if (newState < WRC.navigation.states.length - 1)
		{
			$('.navigate-cart > a').attr('href', '#' + WRC.navigation.states[newState + 1]);
			$('.navigate-cart').removeClass('hidden');
		} else {
			//HIDE NEXT LINK
			$('.navigate-cart').addClass('hidden');
		}
		
		//SET MENU
		for (var i = 0; i < WRC.navigation.states.length; i++) {
			$('nav.steps li').eq(1 + i).toggleClass('inactive-step', (i == newState) ? false : true);
		}
		
		//SET BILLING ADDRESS IF NEEDED
		if (newState == 1) {
			$('.billing-checkbox').css('visibility', 'visible');
			setBillingAddress($('.billing-checkbox input[type="checkbox"]').first().is(':checked'));
		} else if (newState == 2) {
			$('.billing-checkbox').css('visibility', 'hidden');
		} else {
			$('.billing-checkbox').css('visibility', 'visible');
		}
		
		//RANDOMIZE BG
		if (formBackground) {
			setTimeout(function() {
				formBackground.chopGridCorners();
			}, 1000);
		}
	};
	
	function attachListeners() {
		//PROCESS CURRENT STATE
		$.address.bind('change', function(event) {
			WRC.navigation.changeToSection(event.path, self, self.updateState);
		});
		
		//INIT CHECKBOX
		$('input[type="checkbox"]').first().change(function() {
			$(this).parent('.checkbox-bg').first().toggleClass('checked', $(this).is(':checked') ? true : false);
			setBillingAddress($(this).is(':checked'));
		});
	};
	
	function initializeNavigation() {
		WRC.navigation.states = [];
		$('nav.steps li a').each(function(i, e) {
			var href = $(e).attr('href');
			if (href && href != '' && i > 0) WRC.navigation.states.push($(e).attr('href').split('#')[1]);
		});
	};	
	
	function setBillingAddress(sameAsShipping) {
		var fields = [
			['ShippingAddress', 'BillingAddress'],
			['ShippingCity', 'BillingCity'],
			['ShippingZip', 'BillingZip'],
			['ShippingCountry', 'BillingCountry']			
		];
		
		var fieldPair, fieldShipping, fieldBilling;
		for (var i = 0; i < fields.length; i++) {
			fieldPair = fields[i];
			fieldShipping = $('#' + fieldPair[0]);
			fieldBilling = $('#' + fieldPair[1]);
			
			if (sameAsShipping) {
				if (fieldShipping.val() != '') fieldBilling.val(fieldShipping.val())
				if (fieldShipping.is('select')) {
					fieldBilling.val(fieldShipping.val()).change();
				}
				fieldBilling.get(0).disabled = true;
				$('.billing label').css('opacity', 0.5);
			} else {
				fieldBilling.get(0).disabled = false;
				$('.billing label').css('opacity', 1);
			}
		}
	};
};