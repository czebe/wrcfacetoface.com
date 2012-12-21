

/* ############################################################################################ */
/* INITIALIZATION */
/* ############################################################################################ */

var shopPage;
var productPage;

$(document).ready(function() {
	$('body.product').first().each(function(){
		productPage = new ProductPage();
		productPage.init();
	});
	$('body.shop').first().each(function(){
		shopPage = new ShopPage();
		shopPage.init();
	});
	
	/*
	if (!window.Cart) window.Cart={};
	Cart.refreshCart=function() {
		jQuery('.shop-cartSummaryContainer').load('/ModuleRender.aspx?module=module_cartSummary&template=/_System/ModuleTemplates/Shop/cartSummary.html .shop-cartSummaryContent');
	}
	
	(function() {
		var oldVersion = AddToCart;
		AddToCart = function() {
			oldVersion.apply(this, arguments);
			alert("ok goodnow");
		};
	})();
	*/
	
	
});