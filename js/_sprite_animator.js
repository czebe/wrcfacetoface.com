
var DustAnimator = function() {
	"use strict";
	
	var renderElements = [];
	var renderTick;
	var animator = this;
	
	this.init = function() {
		
		//GENERATE SPRITESHEET FOR DUST IMAGES
		$('img.dustanimated').each(function() {
			renderSpriteSheet($(this));
		});
	}
	
	this.addToRenderLoop = function(container, cols, rows, w, h, steps) {
		renderElements.push({container: container, cols: cols, rows: rows, w: w, h: h, steps: steps, currentstep: 0});
		if (!renderTick) {
			renderTick = setInterval(this.render, 1000 / 20);
		}
	}
	
	this.render = function() {
		var i, element, column, row, canvas;
		for (i = 0; i < renderElements.length; i++) {
			element = renderElements[i];
			element.currentstep = (element.currentstep < element.steps - 1) ? element.currentstep + 1 : 0;
			row = Math.floor(element.currentstep / element.rows);
			column = element.currentstep  % element.rows;
			canvas = element.container.firstChild;
			canvas.style.webkitTransform = 'translate(-' +  (column * element.w) + 'px,-' + (row * element.h) + 'px)';
			//canvas.style.left = '-' + (column * element.w) + 'px';
			//canvas.style.top = '-' + (row * element.h) + 'px';
			//canvas.style.opacity = (element.steps / 2 - Math.abs(element.currentstep - element.steps / 2)) / element.steps*2 ;
		}
	}
	
	
	function renderSpriteSheet($img) {
		
		
		var container = document.createElement('div');
		var canvas = document.createElement('canvas');
		canvas.style.position = 'absolute';
		
		
		var tmpImg = new Image();
		tmpImg.src = $img.attr('src');
		tmpImg.onload = function() {
			var w = $img.get(0).width;
			var h = $img.get(0).height;
	
			var boundWidth = getBoundingRect(w/2, h/2, 0, 0, w, h, 45);
			var boundHeight = getBoundingRect(w/2, h/2, 0, 0, w, h, 135);
			
			var frameW = Math.ceil(Math.max(boundWidth.width, boundHeight.width));
			var frameH = Math.ceil(Math.max(boundWidth.height, boundHeight.height));
			
			container.style.width = frameW + 'px';
			container.style.height = frameH + 'px';
			container.style.overflow = 'hidden';
			container.style.position = 'absolute';
			container.style.top = '0';
			container.style.left = '0';
			
			var cols = Math.floor(6000 / frameW);
			var rows = Math.floor(6000 / frameH);
			
			canvas.width = frameW * cols; 
			canvas.height = frameH * rows;
			var context = canvas.getContext('2d');
			context = canvas.getContext('2d');
			
			//context.fillStyle = "rgb(0,0,0)";
			//context.fillRect (0, 0, canvas.width, canvas.height);
		
			var c, r, column, row;
			var step = 0;
			for (r = 0; r < rows; r++) {
				for (c = 0; c < cols; c++) {
					context.save();
					context.translate(c * frameW + frameW / 2, r * frameH + frameH / 2);
					context.rotate(step * (180 / (cols * rows)) * (Math.PI/180));
					context.drawImage($img.get(0), -w / 2, -h / 2);
					context.restore();
					step++;
				}
			}
			
			container.appendChild(canvas);
			$img.after(container);
			
			animator.addToRenderLoop(container, cols, rows, frameW, frameH, cols * rows);
		}
	}
	
	
	
	
	function getBoundingRect(centerX, centerY, x1, y1, x2, y2, angleDegrees) {
		var angleRadians = angleDegrees * (Math.PI/180);
		var x1prim = (x1 - centerX) * Math.cos(angleRadians) - (y1 - centerX) * Math.sin(angleRadians);
		var y1prim = (x1 - centerX) * Math.sin(angleRadians) + (y1 - centerX) * Math.cos(angleRadians);
	 
		var x12prim = (x1 - centerX) * Math.cos(angleRadians) - (y2 - centerX) * Math.sin(angleRadians);
		var y12prim = (x1 - centerX) * Math.sin(angleRadians) + (y2 - centerX) * Math.cos(angleRadians);
	 
		var x2prim = (x2 - centerX) * Math.cos(angleRadians) - (y2 - centerX) * Math.sin(angleRadians);
		var y2prim = (x2 - centerX) * Math.sin(angleRadians) + (y2 - centerX) * Math.cos(angleRadians);
	 
		var x21prim = (x2 - centerX) * Math.cos(angleRadians) - (y1 - centerX) * Math.sin(angleRadians);
		var y21prim = (x2 - centerX) * Math.sin(angleRadians) + (y1 - centerX) * Math.cos(angleRadians);         
	 
		var rx1 = centerX + Math.min(x1prim, x2prim, x12prim, x21prim);
		var ry1 = centerY + Math.min(y1prim, y2prim, y12prim, y21prim);
	 
		var rx2 = centerX + Math.max(x1prim, x2prim, x12prim, x21prim);
		var ry2 = centerY + Math.max(y1prim, y2prim, y12prim, y21prim);
	
		return {x: rx1, y: ry1, width: rx2 - rx1, height: ry2 - ry1};
	}
	
	
};



var dustAnimator;
$(window).ready(function(e) {
	$('body.dustanimated').first().each(function() {
		dustAnimator = new DustAnimator();
		dustAnimator.init();
	});
});