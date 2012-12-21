

var WRC = window.WRC || {};

WRC.PageController = function() {
	"use strict";
	
	var self = this;
	
	var xPixelsToDegreesRatio, yPixelsToRadiansRatio, halfPixelGlobeSize, pixelGlobeCenter;
	var radiansToDegrees = Math.PI / 180;
	
	var photoWidth = 2880;
	var photoHeight = 1920;
	var photoScaling = 1;
	var photoScalingParameters;
	
	var smallMapOffsetX = -7;
	var smallMapOffsetY = -6;
	
	var pixelGlobeSize = 161;
	xPixelsToDegreesRatio = pixelGlobeSize / 360;
	yPixelsToRadiansRatio = pixelGlobeSize / (2 * Math.PI);
	halfPixelGlobeSize = Math.round(pixelGlobeSize / 2);
	pixelGlobeCenter = {x: halfPixelGlobeSize, y: halfPixelGlobeSize};
	
	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var thumbnailSizing = '?action=thumbnail&width=270&height=164&algorithm=fill_proportional';

	var dataPreload;
	var direction;
	var preloader;
	var canvasTools;
	var currentImage = $('#location-photo .current');
	var nextImage = $('#location-photo .next');
	var previousImage = $('#location-photo .previous');

	var thumbnailSVG = $('#thumbnail-prev-SVG');
	var xlink = thumbnailSVG.attr('xmlns:xlink');

	var preloadDelay;
	var cacheDelay;
	
	this.init = function() {

 		canvasTools = new WRC.CanvasTools();
		createNavigation();
		initializeNavigation();
		attachListeners();
	};
	
	this.updateState = function(oldState, newState, sectionPath) {
		if (newState < 0) newState = 0;
		
		//SET CURRENT SECTION
		var allLocations = $('#race-locations li');
		var location = allLocations.eq(newState);
		var groupIndex = $.inArray(location.parent('ul').first()[0], $('#race-locations ul'));

		if (groupIndex > -1)
		{
			$('#race-locations ul').css('display', 'none');
			$('#race-locations ul').eq(groupIndex).css('display', 'block');
			$('#race-locations li').removeClass('active').eq(newState).addClass('active');
			
			$('#race-seasons li').removeClass('active').eq(groupIndex).addClass('active');
			$('#race-seasons ul').first().css('top', -groupIndex * 22);
		}
		
		//LOAD NECESSARY DATA FIRST
		var currentLink =  location.data('href');
		var nextIndex = newState < allLocations.length - 1 ? newState + 1 : 0;
		var nextLink = $('#race-locations li').eq(nextIndex).data('href');
		
		var previousIndex = newState > 0 ? newState - 1 : allLocations.length - 1;
		var previousLink =  $('#race-locations li').eq(previousIndex).data('href');
	
		$('#map .info').css({'opacity': 0, 'top': '+=20'});
		direction = (newState - oldState > 0) ? 1 : (newState - oldState < 0) ? -1 : 0;
		loadRaceData(currentLink, nextLink, previousLink);

		preloadDelay = setTimeout(function() { $('#preload').removeClass('paused'); }, 1000);

	};
	
	function loadRaceData(currentLink, nextLink, previousLink) {
		dataPreload = 3;
		currentImage.empty().load(currentLink + ' .race-data', onRaceDataLoaded);
		nextImage.empty().load(nextLink + ' .race-data', onRaceDataLoaded);
		previousImage.empty().load(previousLink + ' .race-data', onRaceDataLoaded);
	};
	
	function onRaceDataLoaded() {
		var photoContainer = $(this);	
		dataPreload--;
		if (dataPreload == 0) {
			//ALL DATA LOADED, NOW PRELOAD NEW IMAGE
			if (preloader) preloader = null;
			preloader = new PxLoader({statusInterval: 100, noProgressTimeout: 10000});

			var w = $(window).width();
			var h = $(window).height();
			for (var i = 0.25; i <= 1; i += 0.25) {
				if (w > h) {
					if (w < photoWidth * i) {
						photoScaling = i;
						break;
					}
				} else {
					if (h < photoHeight * i) {
						photoScaling = i;
						break;
					}
				}
			}

			photoScalingParameters = '?action=thumbnail&width=' + (photoWidth * photoScaling) + '&height=' + (photoHeight * photoScaling) + '&algorithm=fill_proportional';
			preloader.addImage(currentImage.find('.race-data .photo').text() + photoScalingParameters);
			preloader.addCompletionListener(function(e) {
				onNewImageLoaded(e.resource.img.src);
			});	
			
			preloader.start();

			//SET THUMBNAIL LINKS
			var prevLink = (WRC.navigation.state > 0) ? WRC.navigation.states[WRC.navigation.state - 1] :  WRC.navigation.states[WRC.navigation.states.length - 1];
			var nextLink = (WRC.navigation.state < WRC.navigation.states.length-1) ? WRC.navigation.states[WRC.navigation.state + 1] :  WRC.navigation.states[0];
			$('.arrow-navigation .prev').attr('href', '#' + prevLink);
			$('.arrow-navigation .next').attr('href', '#' + nextLink);
		}
		
	};
	
	function onNewImageLoaded(src) {

		clearTimeout(preloadDelay);
		$('#preload').addClass('paused');
		
		if (direction == 0) {
			photoTransitionComplete();
		} else {

			//DEBUG, NEED BETTER TRANSITION
			photoTransitionComplete();
			return;


			//TODO FROM HERE
			WRC.eventDispatcher.addEventListener(WRC.BACKGROUND_STITCH_READY, playTransition);
			var currentBg = currentImage.css('background-image');
			currentBg = currentBg.replace('url(','').replace(')','');;
	
			var stichedCanvas = canvasTools.stitchBackgrounds([currentBg, src]);
			$('#location-photo').append(stichedCanvas);
		}
	};
	
	function playTransition() {

		currentImage.css('background-image', 'none');
		$('#location-photo > canvas').first().css('text-indent', 0).animate({
			'left': '-100%',
			'text-indent': 100
		}, {
			easing: 'easeInOutElastic',
			duration: 1000,
			step: function(now, fx) {
				if (fx.prop == 'textIndent') canvasTools.shake(this, now * .01);
			},
			complete: photoTransitionComplete
		});

	};
	
	function photoTransitionComplete() {
		WRC.eventDispatcher.removeEventListener(WRC.BACKGROUND_STITCH_READY, playTransition);
		
		//REMOVE CANVAS
		currentImage.css('background-image', 'url(' + currentImage.find('.race-data .photo').text() + photoScalingParameters + ')');

		/*
		$('#location-photo canvas').delay(50).animate({
			'opacity': 0
		}, {
			easing: 'easeOutSine',
			duration: 500,
			complete: function() {
				$(this).remove();
			}
		});
		*/
		
		//SET UP MAP
		var map = $('#map');
		var raceData = currentImage.find('.race-data');
		var mapCoordinates = raceData.find('.map-coordinates').text().split(",");
		map.find('> a').attr('href', '//maps.google.com/maps?z=12&q=' + $.trim(mapCoordinates[0]) + "," + $.trim(mapCoordinates[1]));
		
		var info = map.find('.info');
		var pixelCoords = fromCoordinatesToPixel({lat: parseFloat(mapCoordinates[0]), long: parseFloat(mapCoordinates[1])});
		info.removeClass('animated');
		info.css({'left': Math.round(pixelCoords.x), 'top': Math.round(pixelCoords.y + 20)});
		info.get(0).offsetWidth;
		info.addClass('animated').css({'top': pixelCoords.y, 'opacity': 1});
		
		info.find('h3').text(raceData.find('.name').text());
		var date = raceData.find('.date').text();
		var raceStart = Date.parse(date);

		var startDay = raceStart.getUTCDate();
		var startMonth = monthNames[raceStart.getUTCMonth()];
		
		var raceEnd = new Date();
		var duration = parseInt(raceData.find('.duration').text());
		raceEnd.setTime(raceStart.getTime() + duration * 86400000);
		var endDay = raceEnd.getUTCDate();
		var endMonth = monthNames[raceEnd.getUTCMonth()];
		var year = raceEnd.getUTCFullYear();
		
		var dateLabel = startDay + ((startMonth != endMonth) ? ' ' + startMonth : '') + '–' + endDay + ' ' + endMonth + ' ' + year;
		info.find('h4').text(dateLabel);
		
		//DRIVER INFO
		var infoPoint = $('#info-point');
		var $infolink = infoPoint.find('a').first();
		var infolinkURL = raceData.find('.infolink').text();

		if (infolinkURL == "") {
			$infolink.removeAttr('href', 'target');
			$infolink.css('cursor', 'default');
		} else {
			$infolink.attr({'href': infolinkURL, 'target': '_blank'});
			$infolink.css('cursor', 'auto');
		}

		var infoData = infoPoint.find('.info-data');
		infoData.find('h4').empty().append($('<span>' + raceData.find('.firstname').text() + '</span>'));
		infoData.find('h3').empty().append($('<span>' + raceData.find('.lastname').text() + '</span>'));

		var country = $('<span>Country:</span><span>' + raceData.find('.origin').text() + '</span>');
		var carType = $('<span>Car:</span><span>' + raceData.find('.cartype').text() + '</span>');
		var coDriver = $('<span>Co-driver:</span><span>' + raceData.find('.co-driver').text() + '</span>');

		infoData.find('h5').eq(0).empty().append(country);
		infoData.find('h5').eq(1).empty().append(carType);
		infoData.find('h5').eq(2).empty().append(coDriver);
		
		var infox = parseInt(raceData.find('.infox').text());
		var infoy = parseInt(raceData.find('.infoy').text());

		//CONVERT INFO-POINT PIXEL COORDINATES TO PERCENTAGE
		var unscaledPercentageX = Math.round(infox / photoWidth * 100);
		var unscaledPercentageY = Math.round(infoy / photoHeight * 100);

		infoPoint.css({'left': unscaledPercentageX + "%", 'top': unscaledPercentageY + "%"});

		//LOAD THUMBNAIL IMAGE
		//previousImage.find('.photo').text()
		$('#th-prev-img').get(0).setAttributeNS(xlink, 'href', previousImage.find('.photo').text() + thumbnailSizing);
		$('#th-next-img').get(0).setAttributeNS(xlink, 'href', nextImage.find('.photo').text() + thumbnailSizing);

		//PRELOAD SURROUNDING IMAGES
		clearTimeout(cacheDelay);
		cacheDelay = setTimeout(function() {
			if (preloader) preloader = null;
			preloader = new PxLoader({noProgressTimeout: 10000});
			preloader.addImage(nextImage.find('.race-data .photo').text() + photoScalingParameters);
			preloader.addImage(previousImage.find('.race-data .photo').text() + photoScalingParameters);
			preloader.start();
		}, 1500);
	};
		
	function attachListeners() {
		$.address.bind('change', function(event) {
			WRC.navigation.changeToSection(event.path, self, self.updateState);
		});

		if (WRC.siteController.isIE) {
			self.updateState();
		}
		
		$('#race-locations a').bind('mouseover', randomizeMenuBg);
	};
	
	function randomizeMenuBg() {
		$('#race-locations hr:not(.fixed)').each(function() {
			$(this).css('background-position-x', Math.floor((Math.random()*800)-400));
		}); 
	};
	
	function initializeNavigation() {
		//FILL ORDER OF STATES
		WRC.navigation.states = [];
		$('#race-locations li a').each(function(i,e) {
			var path = $(e).attr('href').split("#")[1];
			if (path == $.address.path()) WRC.navigation.state = i;
			WRC.navigation.states.push(path);
		});
	};
	
	function createNavigation() {
		
		//RACE LOCATIONS
		var locationGroup;
		$('#races-info li').each(function(i, e) {
			var year = Date.parse($(e).data('date')).getFullYear().toString();

			//CREATE GROUP FOR LOCATION ITEMS
			locationGroup = $('#race-locations ul[data-season=' + year + ']');
			if (locationGroup.length == 0) {
				locationGroup = $(document.createElement('ul'));
				locationGroup.attr('data-season', year);
				var insertPosition = $('#race-locations ul').last();
				if (insertPosition.length == 0) insertPosition = $('#race-locations hr.fixed').first();
				insertPosition.after(locationGroup);
			}
			
			//CREATE ITEMS
			var menuItem = $(document.createElement('li'));
			var menuLink = $(document.createElement('a'));
			var href = $(e).data('href');
			var path = href.split("/");
			menuLink.attr('href', "#/" + path[path.length-1]);
			menuItem.attr('data-href', href);
			menuLink.text($(e).data('country'));
			
			menuItem.append(menuLink);
			locationGroup.append(menuItem);
			
			//CREATE SEASON NAVIGATION
			var $seasonItem = $('#race-seasons ul').first().find('li'); //('li[data-season=' + year + ']');
			if ($seasonItem.length == 0) {
				$seasonItem = $(document.createElement('li'));
				$seasonItem.attr('data-season', year);
				var $seasonLink =  $(document.createElement('a'));
				$seasonLink.attr('href',  "#/" + path[path.length-1]);
				var label = $.trim($(e).text().split("-")[0]).split(" ")[0];
				$seasonLink.text(label + " " + year);
				$seasonItem.append($seasonLink);
				$('#race-seasons ul').first().append($seasonItem);
			}
			
			
		});
		
		/*
		$('#race-seasons li').last().addClass('active');
		$('#race-seasons ul').first().css('top', -$('#race-seasons li.active').first().index() * 22);
		*/

		
		
		
	};
	
	function fromCoordinatesToPixel(coordinates) {
		var x = Math.round(pixelGlobeCenter.x + (coordinates.long * xPixelsToDegreesRatio));
		var f = Math.min(Math.max(Math.sin(coordinates.lat * radiansToDegrees), -0.9999), 0.9999);
		var y = Math.round(pixelGlobeCenter.y + 0.5 * Math.log((1 + f) / (1 - f)) * -yPixelsToRadiansRatio);
		return {x: Math.round(x) + smallMapOffsetX, y: Math.round(y) + smallMapOffsetY};
	};
	
};