

var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;

	this.init = function() {

	};

	this.disableWarning = function() {
		$.cookie('WRC-disable-browser-warning', 'true', { path: '/', expires: 9999, domain: 'wrcfacetoface.com' });
		$.cookie('WRC-disable-browser-warning', 'true', { path: '/', expires: 9999, domain: 'wrcfacetoface.businesscatalyst.com' });
		$.cookie('WRC-disable-browser-warning', 'true', { secure: true, path: '/', expires: 9999, domain: 'wrcfacetoface.worldsecuresystems.com' });
	};
};