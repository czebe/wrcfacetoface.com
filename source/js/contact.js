

var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;
	
	var canvasTools;
	var imageTools;
	var formBackground;
	var cols = 10;
	var rows = 5;
	
	var visibleCells = [
		[1, 4],
		[0, 5],
		[0, 6],
		[0, 8],
		
		[1, 5],
		[0, 8],
		[2, 6],
		[3, 5],
		[3, 9],
		[3, 3],
		[4, 2],
		[2, 0],
		[0, 3],
		[1, 1]
	];

	this.init = function() {
		compositeImages();
	
		formBackground = new WRC.CellGrid($('#cell-bg-SVG'), $('#cell-bg'));
		formBackground.init(cols, rows, true);
		
		randomizeBg();
	};
	
	function randomizeBg() {
		var cells = formBackground.getCells();

		var i, cellIndex, cell;
		for (i = 0; i < visibleCells.length; i++) {
			cellIndex = visibleCells[i][0] * cols + visibleCells[i][1];
			cell = 	cells.eq(cellIndex);
			cell.css('opacity', 0.15);
			cell.get(0).setAttribute('fill', (Math.random() < 0.3) ? '#FFFFFF' : '#000000');
		}
		
		for (i = 0; i < 10; i++) {
			formBackground.duplicateShape(Math.round($.randomBetween(50, 400)), Math.round($.randomBetween(20, 250)), '#8FC730', $.randomBetween(20, 60) / 100, $.randomBetween(20, 70) / 100);
		}
		
		$('#cell-bg-SVG').css('visibility', 'visible');
	};
	
	function compositeImages() {
		//COMPOSITE DUST IMAGES
		WRC.imageTools = WRC.imageTools || new WRC.ImageTools();
		$('.composite-alpha').each(function(i, e) {
			WRC.imageTools.compositeImages($(e));
		});
	};
};