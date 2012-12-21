

var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;
	
	var wallpaperSVG;
	var cellGrid;
	var cellContainer;
	var fullscreenWallpaper;
	var xlink;
	var visibleCells;
	var hiddenCells;
	var thumbnailPositions;
	var wallpaper;
	var thumbnailCount;
	var fullscreen;

	var $fullScreenCell;
	var preloadDelay;
	
	this.init = function() {
		
		wallpaperSVG = $('#wallpaper-SVG');
		cellContainer = $('#wallpaper-clip');
		cellGrid = new WRC.CellGrid(wallpaperSVG, cellContainer);
		xlink = wallpaperSVG.attr('xmlns:xlink');
		thumbnailCount = $('#wallpaper-items a').length;
		fullscreenWallpaper = $('#fullscreen-wallpaper');

		initializeNavigation();
		attachListeners();
		compositeImages();
		//randomizeBg();

		if (WRC.siteController.isIE) {
			self.updateState(0, 0);
		}

		/*
		if ($.address.path().length > 1) {
			WRC.navigation.changeToSection($.address.path(), this, self.updateState);
		} else {
			WRC.navigation.changeToSection(WRC.navigation.states[0], this, self.updateState);
		}
		*/
	};
	
	this.updateState = function(oldState, newState, sectionPath) {

		var path;
		if (newState < 0) {
			//POSSIBLY SWITCHED TO FULLSCREEN MODE
			path = sectionPath.split('/');
			if (path.length === 3) {
				newState = WRC.navigation.findSectionIndex('/' + path[1]);
				WRC.navigation.state = newState;
				if (path[2] == 'fullscreen') fullscreen = true;
			}
		} else {
			fullscreen = false;
		}

		if (newState < 0) newState = 0;

		var imgPath = $('#wallpaper-items a').eq(newState).find('img').first().attr('data-src');
		fullscreenWallpaper.css({'display': fullscreen ? 'block' : 'none', 'background-image': fullscreen ? 'url(' + imgPath + ')' : 'none'});

		//SET FULLSCREEN LINK TO GO BACK
		if ($fullScreenCell) setFullScreenLink();

		//LOAD IMAGE FOR CURRENT STATE
		var oldWallpaper = $('#wallpaper-image').get(0).getAttributeNS(xlink, 'href');

		if (oldWallpaper != imgPath) {
			wallpaper = new Image();
			wallpaper.onload = onWallpaperLoaded;
			wallpaper.src = imgPath;
			preloadDelay = setTimeout(function() { $('#preload').removeClass('paused'); }, 1000);
		}

		//SET PREV/NEXT BUTTONS
		var fullscreenHash = fullscreen ? "/fullscreen" : "";
		$('nav.arrow-navigation > a.prev').attr('href', '#' + WRC.navigation.getPrevSection() + fullscreenHash);
		$('nav.arrow-navigation > a.next').attr('href', '#' + WRC.navigation.getNextSection() + fullscreenHash);

	};

	function setFullScreenLink() {
		var hash = '#' + WRC.navigation.states[WRC.navigation.state];
		$fullScreenCell.find('a').first().attr('href', fullscreen ? hash : hash + '/fullscreen');
	};

	function createFullScreenCell() {
		var cols = cellGrid.getCols();
		var rows = cellGrid.getRows();

		var colOffset = cellGrid.getColOffset();
		var rowOffset = cellGrid.getRowOffset();

		//ADD THUMBNAIL  ITEMS
		var thumbnailContainer = $('article > section').first();
		thumbnailContainer.empty();
		var index, r, c, i, x, y;
		index = thumbnailPositions[0];
		r = Math.floor(index / cols);
		c = index  % cols;
		x = c * colOffset - 7;
		y = r * rowOffset + (c % 2) * (rowOffset / 2) - 6;

		$fullScreenCell = $('article > figure').first().clone();
		$fullScreenCell.css({'display': 'block', 'left': x, 'top': y, 'visibility': 'visible'});
		$fullScreenCell.addClass('active');
		$fullScreenCell.get(0).setAttributeNS(xlink, 'href', '');

		setFullScreenLink();
		thumbnailContainer.append($fullScreenCell);
	};
	
	function onWallpaperLoaded() {

		drawCellMask();
		createFullScreenCell();

		var newWallpaper = $(wallpaper).attr('src');
		$('#wallpaper-image').get(0).setAttributeNS(xlink, 'href', newWallpaper);
		visibleCells.css('display', 'block');

		//SET DOWNLOAD LINKS
		$('.steps li:nth-child(1) a').attr('href', newWallpaper.replace('full', 'iphone'));
		$('.steps li:nth-child(2) a').attr('href', newWallpaper.replace('full', 'ipad'));
		$('.steps li:nth-child(3) a').attr('href', newWallpaper + '?action=thumbnail&width=1920&height=1080&algorithm=fill_proportional');
		$('.steps li:nth-child(4) a').attr('href', newWallpaper + '?action=thumbnail&width=1366&height=768&algorithm=fill_proportional');
		$('.steps li:nth-child(5) a').attr('href', newWallpaper + '?action=thumbnail&width=1280&height=800&algorithm=fill_proportional');

		/* //ANIMATION PERFORMING POORLY, DISABLING
		visibleCells.each(function(i, e) {
			setTimeout(function() {
				$(e).css('display', 'block');
			}, i * 30);
		});
		*/

		clearTimeout(preloadDelay);
		$('#preload').addClass('paused');

	};

	function createThumbnails() {

		var cols = cellGrid.getCols();
		var rows = cellGrid.getRows();

		var colOffset = cellGrid.getColOffset();
		var rowOffset = cellGrid.getRowOffset();

		//ADD THUMBNAIL  ITEMS
		var thumbnailContainer = $('article > section').first();
		thumbnailContainer.empty();
		var index, r, c, i, x, y, thumbnailCell, thumbnailLink, thumbnailImageSrc, thumbnailImage;
		var thumbnailSizing = '?action=thumbnail&width=210&height=190&algorithm=fill_proportional';
		for (i = 0; i < thumbnailCount; i++) {
			index = thumbnailPositions[i];
			r = Math.floor(index / cols);
			c = index  % cols;
			x = c * colOffset - 7;
			y = r * rowOffset + (c % 2) * (rowOffset / 2) - 6;
			thumbnailCell = $('article > figure').first().clone();
			thumbnailCell.css({'display': 'block', 'left': x, 'top': y, 'visibility': 'visible'});
			thumbnailLink = thumbnailCell.find('a').first();

			thumbnailImage = thumbnailCell.find('.thumbnail-icon');
			if (WRC.navigation.state == i) {
				//WALLPAPER FOR CURRENT THUMBNAIL IS ALREADY LOADED IN BACKGROUND
				//SHOW EYE ICON INSTEAD
				thumbnailCell.addClass('active');
				thumbnailImage.get(0).setAttributeNS(xlink, 'href', '');
				//console.log('fullscreen', fullscreen, WRC.navigation.states[WRC.navigation.state]);
				thumbnailLink.attr('href', fullscreen ? '#/' + WRC.navigation.states[WRC.navigation.state] : '#/' + $('#wallpaper-items a').eq(i).attr('href').split('#')[1] + '/fullscreen');
			} else {
				thumbnailCell.removeClass('active');
				thumbnailLink.attr('href', $('#wallpaper-items a').eq(i).attr('href'));
				//LOAD THUMBNAIL IMAGE
				thumbnailImageSrc = $('#wallpaper-items a').eq(i).find('img').first().data('src') + thumbnailSizing;
				thumbnailImage.get(0).setAttributeNS(xlink, 'href', thumbnailImageSrc);
			}

			thumbnailContainer.append(thumbnailCell);
		}
	};
	
	function initializeNavigation() {
		//FILL ORDER OF STATES
		WRC.navigation.states = [];
		$('#wallpaper-items a').each(function(i, e) {
			var href = $(e).attr('href');
			if (href && href != '') WRC.navigation.states.push('/' + $(e).attr('href').split('#')[1]);
		});
		
		
	};
		
	function attachListeners() {
		var resizeTimeout;
		
		//LISTEN TO RESIZE
		$(window).resize(function() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function() {
				drawCellMask(true);
			}, 500);
		});
		
		//PROCESS CURRENT STATE
		$.address.bind('change', function(event) {
			WRC.navigation.changeToSection(event.path, self, self.updateState);
		});
	};
		
	function drawCellMask(windowResize) {
		cellGrid.clear();
		
		var colOffset = cellGrid.getColOffset();
		var rowOffset = cellGrid.getRowOffset();
		
		var cols = Math.max(5, Math.ceil($(window).width() / colOffset));
		var rows = Math.max(5, Math.ceil($(window).height() / rowOffset));

		cellGrid.init(cols, rows, true);
				
		//HIDE BORDER CELLS
		var lowProbability = 0.2;
		var cellStyle = {'display': 'none', 'opacity': 0};
		
		var allCells = cellGrid.getCells();
		allCells.css({'display': 'block', 'opacity': 1});

		var topRows = allCells.slice(0, 1 * cols);
		var bottomRows = allCells.slice(rows * cols - 3 * cols, rows * cols);
		topRows.add(bottomRows).css(cellStyle);

		allCells.eq(1 * cols).css(cellStyle);
		allCells.eq(2 * cols - 1).css(cellStyle);
	
		var c, r;
		var middleRows = allCells.slice(1 * cols, rows * cols - 3 * cols);
		middleRows.each(function(index) {
			c = index  % cols;
			if (c < 1 || c >= cols - 2) {
				$(this).css(cellStyle);
			}
		});	
		
		//HIDE CORNER CELLS
		for (c = 2; c >= 0; c--) {
			for (r = 0; r < 1; r++) {
				if (Math.random() > lowProbability) middleRows.eq(2 + r * cols + (c - r)).css(cellStyle);
				if (Math.random() > lowProbability) middleRows.eq((cols - 4) + r * cols - (c - r)).css(cellStyle);
				if (Math.random() > lowProbability) middleRows.eq((middleRows.length - 4) - r * cols - (c - r)).css(cellStyle);
				if (Math.random() > lowProbability) middleRows.eq((rows - 6) * cols - r * cols + 2 + (c - r)).css(cellStyle);
			}
		}
		
		visibleCells = allCells.filter(function () {
			return $(this).css('display') != 'none';
		});
		
		hiddenCells = allCells.filter(function () {
			return $(this).css('display') == 'none';
		});
				
		visibleCells.css('display', 'none');
		
		visibleCells = shuffleArray(visibleCells);
		hiddenCells = shuffleArray(hiddenCells);

		//GENERATE THUMBNAIL POSITIONS
		var index;
		thumbnailPositions = [];
		while (thumbnailPositions.length < thumbnailCount) {
			//SELECT A COLUMN AND ROW
			c = (Math.random() >= 0.5) ? Math.round($.randomBetween(cols-5, cols-4)) : Math.round($.randomBetween(1, 3));
			r = (Math.random() >= 0.5) ? Math.round($.randomBetween(rows-6, rows-5)) : Math.round($.randomBetween(1, 3));
			index = r * cols + c;
			if ($.inArray(index, thumbnailPositions) < 0) thumbnailPositions.push(index);
		}

		if (windowResize) onWallpaperLoaded();
		
	};
	
	function randomizeBg() {
		var cells = cellGrid.getCells();
		var i, cellIndex, cell;
		for (i = 0; i < visibleCells.length; i++) {
			cellIndex = visibleCells[i][0] * cols + visibleCells[i][1];
			cell = 	cells.eq(cellIndex);
			cell.css('opacity', 0.15);
			cell.get(0).setAttribute('fill', (Math.random() < 0.3) ? '#FFFFFF' : '#000000');
		}
		
		for (i = 0; i < 10; i++) {
			cellGrid.duplicateShape(Math.round($.randomBetween(50, 400)), Math.round($.randomBetween(20, 250)), '#8FC730', $.randomBetween(20, 60) / 100, $.randomBetween(20, 70) / 100);
		}
		
		cellGrid.hideOriginalShape();
		$('#form-bg').css('visibility', 'visible');
	};

	function compositeImages() {
		//COMPOSITE DUST IMAGES
		WRC.imageTools = WRC.imageTools || new WRC.ImageTools();
		$('.composite-alpha').each(function(i, e) {
			WRC.imageTools.compositeImages($(e));
		});
	};

	function shuffleArray(array) {
		var i, j, temp;
		for (i = array.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	};
	

		
};