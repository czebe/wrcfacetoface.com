if (typeof jslang == "undefined") {
    LoadLangO("EN")
} else {
    if (jslang == "JP") {
        jslang = "JA"
    }
    if (jslang == "CS") {
        jslang = "CZ"
    }
    if (jslang == "SI") {
        jslang = "SL"
    }
    LoadLangO(jslang)
}
function LoadLangO(a) {
    var b = document.createElement("script");
    b.setAttribute("src", "/BcJsLang/Java_OnlineShopping.aspx?lang=" + a);
    b.setAttribute("charset", "utf-8");
    b.setAttribute("type", "text/javascript");
    document.getElementsByTagName("head")[0].appendChild(b)
}
function AddToCart(l, m, f, r, C) {
    var D = m;
    var u = "";
    var E = document.getElementById("Units_" + m);
    var x = readCookie("CartID");
    var a = document.getElementById("Grouping_" + m);
    var j = document.getElementById("Related_" + m);
    var g = document.getElementById("catProdTd_" + m);
    var z = document.getElementById("catProdAttributes_" + m);
    var v = document.getElementById("catProdAttributes2_" + m);
    var B = document.getElementById("catProdInstructions_" + m);
    var d = "";
    var q = new Array();
    var w = false;
    var y = false;
    var c;
    var e = 0;
    var s;
    var t = true;
    if (E) {
        c = E.value;
        if (c < 0) {
            alert(Oshoplang.RemoveError);
            return false
        }
    } else {
        c = 1
    }
    if (x == null || x == "") {
        x = -1
    }
    s = document.getElementById("catCartSummary");
    if (a) {
        if (a.nodeName == "SELECT") {
            D = a.value
        } else {
            var n = a.getElementsByTagName("input");
            for (var h = 0; h < n.length; h++) {
                if (n[h].checked) {
                    D = n[h].value;
                    break
                }
            }
        }
    }
    if (j) {
        u = GetCheckListValue(j);
        if (u.length > 0) {
            e = u.split(",")
                .length
        }
    }
    if (B) {
        d = B.value
    }
    if (z) {
        var k = z.getElementsByTagName("select");
        if (k) {
            if (d.length > 0) {
                d += ";"
            }
            for (var h = 0; h < k.length; h++) {
                if (k[h].value.length > 0) {
                    d += k[h].value + ";"
                }
            }
        }
    }
    if (v) {
        var o = 0;
        var k = v.getElementsByTagName("select");
        var A;
        var b;
        var p = "";
        if (k) {
            for (var h = 0; h < k.length; h++) {
                if (k[h].value.length > 0) {
                    q[o] = k[h].value + "|1";
                    o++
                } else {
                    if (k[h].getAttribute("mandatory")) {
                        alert(Oshoplang.ChooseAttribute);
                        return
                    }
                }
            }
        }
        var k = v.getElementsByTagName("input");
        if (k) {
            for (var h = 0; h < k.length; h++) {
                if (k[h].type == "checkbox" || k[h].type == "radio") {
                    if (p != k[h].getAttribute("name")) {
                        if (h > 0 && !b && k[h - 1].getAttribute("mandatory")) {
                            alert(Oshoplang.ChooseAttribute);
                            return
                        }
                        b = false
                    }
                    if (k[h].checked) {
                        q[o] = k[h].id + "|1";
                        o++;
                        b = true
                    }
                    p = k[h].getAttribute("name")
                } else {
                    if (k[h].value.length > 0) {
                        q[o] = k[h].id + "|" + k[h].value;
                        o++;
                        b = true
                    } else {
                        if (k[h].getAttribute("mandatory")) {
                            alert(Oshoplang.ChooseAttribute);
                            return
                        }
                    }
                }
            }
            if (k.length > 0 && (k[k.length - 1].type == "checkbox" || k[k.length - 1].type == "radio")) {
                if (!b && k[h - 1].getAttribute("mandatory")) {
                    alert(Oshoplang.ChooseAttribute);
                    return
                }
            }
        }
    }
    if (s) {
        if (s.getAttribute("Vertical") == "True") {
            w = true
        }
        if (s.getAttribute("Quote") == "True") {
            y = true
        }
    }
    var F = CMS.CatalogueRetrieve.ServerSideAddItemToOrder(x, l, D, c, u, q, d, w, r, y, f, t);
    if (F.value[4]) {
        e = F.value[4]
    }
    createCookie("CartID", F.value[0], 2);
    if (s) {
        s.innerHTML = F.value[2]
    }
    switch (F.value[1]) {
    case 0:
        if (!C) {
            if (g) {
                g.innerHTML = F.value[3];
                ProcessJS(g)
            }
            alert(e + Oshoplang.Added)
        } else {
            document.location = "/OrderRetrievev2.aspx?CatalogueID=" + l
        }
        break;
    case 1:
        alert(Oshoplang.OutOfStock);
        break;
    case 2:
        if (!C) {
            if (g) {
                g.innerHTML = F.value[3];
                ProcessJS(g)
            }
            alert(e + Oshoplang.PreOrder)
        } else {
            document.location = "/OrderRetrievev2.aspx?CatalogueID=" + l
        }
        break;
    case 3:
        alert(Oshoplang.MinLimit);
        break;
    case 4:
        alert(Oshoplang.MaxLimit);
        break
    }
    initSocialMediaModules();
    if (typeof AddProductExtras == "function") {
        AddProductExtras(l, D, F.value[1])
    }
}
function DrawProduct(h, j, c, g, f) {
    var i = document.getElementById("Grouping_" + j);
    var d;
    var e = true;
    var b = i;
    while (e) {
        b = b.parentNode;
        if (b.id) {
            if (b.id.indexOf("catProdTd_") != -1) {
                d = b.id.substring(10);
                e = false
            }
        }
    }
    var a = CMS.CatalogueRetrieve.ServerSideDrawProduct(h, c, f, g);
    b.innerHTML = a.value;
    ProcessJS(b);
    initSocialMediaModules();
    if (a.value.indexOf("lightbox") != -1) {
        initLightbox()
    }
}
function initSocialMediaModules() {
    if (typeof FB != "undefined" && typeof FB.init == "function") {
        FB.init({
            status: true,
            cookie: true,
            xfbml: true
        });
        if (typeof window.facebookClearLoadingTimer != "undefined") {
            clearInterval(window.facebookClearLoadingTimer)
        }
        window.facebookClearLoadingTimer = setInterval(function () {
            var a = GetElementsByClass("FB_Loader");
            if (a.length > 0) {
                a[0].parentNode.removeChild(a[0]);
                clearInterval(window.facebookClearLoadingTimer)
            }
        }, 1000)
    }
    if (typeof twttr != "undefined" && typeof twttr.widgets != "undefined" && typeof twttr.widgets.load != "undefined") {
        twttr.widgets.load()
    }
}
function UpdateItemQuantity(c, b, e, h, m, f, d) {
    var i;
    var g;
    var a = false;
    var j = false;
    var k = true;
    i = document.getElementById("catCartDetails");
    g = document.getElementById("catCartSummary");
    if (g) {
        if (g.getAttribute("Vertical") == "True") {
            a = true
        }
        if (g.getAttribute("Quote") == "True") {
            j = true
        }
    }
    if (!IsNumeric(c)) {
        alert(Oshoplang.InvalidQuantity);
        return false
    }
    if (i) {
        var l;
        l = CMS.OrderRetrievev2.ServerSideUpdateItemQuanity(b, e, h, m, c, f, d, a, j, k);
        switch (l.value[0]) {
        case 0:
        case 2:
            i.innerHTML = l.value[1];
            if (g) {
                g.innerHTML = l.value[2]
            }
            break;
        case 1:
            alert(Oshoplang.OutOfStock);
            return;
        case 3:
            alert(Oshoplang.MinLimit);
            break;
        case 4:
            alert(Oshoplang.MaxLimit);
            break;
        case -1:
            i.innerHTML = l.value[1];
            if (g) {
                g.innerHTML = l.value[2]
            }
            alert(Oshoplang.CartEmpty);
            break
        }
    }
    if (typeof UpdateProductExtras == "function") {
        UpdateProductExtras(e, h, l.value[0])
    }
}
function ClearCart(d, c) {
    var b = document.getElementById("catCartDetails");
    var a = document.getElementById("catCartSummary");
    if (b) {
        var e = CMS.OrderRetrievev2.ServerSideDrawCartEmpty(d, c);
        b.innerHTML = e.value;
        alert(Oshoplang.CartUpdateSuccess)
    }
    if (a) {
        a.innerHTML = Oshoplang.CartEmpty
    }
    if (typeof UpdateProductExtras == "function") {
        UpdateProductExtras(c, - 1, - 1)
    }
}
function UpdateShipping(e, d, c) {
    var b = document.getElementById("catCartDetails");
    if (b) {
        var a = CMS.OrderRetrievev2.ServerSideUpdateShipping(d, e, c);
        if (a.value[0]) {
            b.innerHTML = a.value[2]
        }
        if (a.value[1].length > 0) {
            alert(a.value[1])
        }
    }
}
function ApplyDiscountCode(e, d, c) {
    var b = document.getElementById("catCartDetails");
    if (b) {
        var a = CMS.OrderRetrievev2.ServerSideApplyDiscountCode(d, e, c);
        if (a.value[0]) {
            b.innerHTML = a.value[2]
        }
        if (a.value[1].length > 0) {
            alert(a.value[1])
        }
    }
}
function ApplyGiftVoucher(d, e, c) {
    var b = document.getElementById("catCartDetails");
    if (b) {
        var a = CMS.OrderRetrievev2.ServerSideApplyGiftVoucher(e, d, c);
        if (a.value[0]) {
            b.innerHTML = a.value[2]
        }
        if (a.value[1].length > 0) {
            alert(a.value[1])
        }
    }
}
function ValidateCart(g) {
    var j = document.getElementById("ShippingOptions");
    if (j) {
        if (j.value < 1) {
            alert(Oshoplang.InvalidShip);
            return false
        }
    }
    var b = document.getElementById("shippingCountry");
    ccVal = "";
    if (b) {
        ccVal = b.value
    }
    var f = document.getElementById("shippingState");
    var l = "";
    if (f) {
        l = f[f.selectedIndex].text;
        if (f.value < 1) {
            alert(Oshoplang.ChooseState);
            return false
        }
    }
    var e = document.getElementById("shippingPostcode");
    var h = "";
    if (e) {
        h = e.value;
        if (e.value.length < 1) {
            alert(Oshoplang.EnterZip);
            return false
        }
    }
    var k = document.getElementById("shippingCalc");
    if (k) {
        var d = false;
        var c = k.getElementsByTagName("input");
        if (c.length > 0) {
            for (var a = 0; a < c.length; a++) {
                if (c[a].checked) {
                    d = true;
                    break
                }
            }
        }
        if (!d) {
            alert(Oshoplang.ChooseShip);
            return false
        }
    }
    if (ccVal.length > 0 || l.length > 0 || h.length > 0) {
        CMS.OrderRetrievev2.ServerSideSetShippingAddress(g, ccVal, l, h)
    }
    return true
}
function CheckGiftVoucherSelected(c) {
    var b = document.getElementById("RecipientName");
    var d = document.getElementById("RecipientEmail");
    var a = document.getElementById("Message");
    if (!b || !d || !a) {
        alert(Oshoplang.IncorrectGForm);
        return false
    } else {
        if (b.value.length < 1) {
            alert(Oshoplang.EnterGName);
            return false
        } else {
            if (!checkEmailShop(d.value)) {
                alert(Oshoplang.InvalidGEmail);
                return false
            } else {
                if (a.value.length < 1) {
                    alert(Oshoplang.EnterGMessage);
                    return false
                }
            }
        }
    }
    CMS.OrderRetrievev2.ServerSideRegisterGiftVoucher(c, b.value, d.value, a.value)
}
function SetShippingCountry(f, e, d) {
    var b = document.getElementById("shippingPostcode");
    var g = "";
    var c = document.getElementById("shippingState");
    var i = "";
    var h = document.getElementById("catCartDetails");
    if (h) {
        if (b) {
            g = b.value
        }
        if (c) {
            if (c.selectedIndex > 0) {
                i = c[c.selectedIndex].text
            }
        }
        var a = CMS.OrderRetrievev2.ServerSideSetShippingCountry(e, f, i, g, d);
        h.innerHTML = a.value
    }
}
function RetrieveShippingCosts(h, g) {
    var e = document.getElementById("shippingPostcode");
    var j = "";
    var b = document.getElementById("shippingCountry");
    var i = "";
    var f = document.getElementById("shippingState");
    var l = "";
    var k = document.getElementById("catCartDetails");
    var d = false;
    var a = document.getElementById("shippingIsResidential");
    if (k) {
        if (b) {
            i = b.value
        }
        if (f) {
            l = f[f.selectedIndex].text
        }
        if (a) {
            d = a.checked
        }
        if (e) {
            j = e.value
        }
        var c = CMS.OrderRetrievev2.ServerSideRetrieveShipping(h, i, l, j, g, d);
        k.innerHTML = c.value
    }
}
function SaveShipping(f, e, d, b) {
    var a = document.getElementById("catCartDetails");
    if (a) {
        var c = CMS.OrderRetrievev2.ServerSideSaveShipping(e, f, d, b);
        a.innerHTML = c.value
    }
}
function ApplyTaxRate(h, f, b, k, e) {
    var j = document.getElementById("catCartDetails");
    if (j) {
        var a = document.getElementById("shippingCountry");
        var g = "";
        if (a) {
            g = a.value
        }
        var c = document.getElementById("shippingPostcode");
        var i = "";
        if (c) {
            i = c.value
        }
        var d = document.getElementById("shippingState");
        var m = "";
        if (d) {
            if (d.selectedIndex > 0) {
                m = d[d.selectedIndex].text
            }
        }
        var l = CMS.OrderRetrievev2.ServerSideUpdateTaxCode(f, h, b, k, e, g, m, i, true);
        j.innerHTML = l.value
    }
}
function RefreshCart() {
    var c = readCookie("CartID");
    var b = document.getElementById("catCartDetails");
    if (b && c != null && c != "") {
        var a = CMS.OrderRetrievev2.ServerSideReDrawShoppingCart(c);
        b.innerHTML = a.value
    }
}
function IsNumeric(a) {
    for (var b = 0; b < a.length; b++) {
        if (a.charCodeAt(b) < 48 || a.charCodeAt(b) > 57) {
            return false
        }
    }
    return true
}
function GetCheckListValue(c) {
    var d = c.getElementsByTagName("td");
    var b;
    var a = "";
    for (var e = 0; e < d.length; e++) {
        b = d[e].childNodes[0];
        if (b.checked) {
            a = a + "," + b.value
        }
    }
    if (a.substring(0, 1) == ",") {
        return a.substring(1)
    } else {
        return a
    }
}
function checkEmailShop(c) {
    if (c.length > 0) {
        var a = /^.+@.+\..{2,4}$/;
        if (!(a.test(c))) {
            return false
        } else {
            var b = /[\(\)\<\>\,\;\:\\\"\[\]]/;
            if (c.match(b)) {
                return false
            }
        }
    } else {
        return false
    }
    return true
}
function ProcessJS(ele) {
    var t = "";
    var x = ele.getElementsByTagName("script");
    for (var i = 0; i < x.length; i++) {
        t = t + x[i].text
    }
    if (t != "") {
        eval(t)
    }
}
function CCPopup(a) {
    var b = window.open("http://www.xe.com/ecc/input.cgi?Template=sw&" + a, "", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=1,height=170,width=600");
    b.focus()
}
if (typeof zoom == "undefined") {
    zoom = {
        x: 0,
        y: 0,
        offsetx: null,
        offsety: null,
        targetobj: null,
        dragapproved: 0,
        z: null,
        container: null,
        top_pos: 130,
        left_pos: 162,
        max_width: 1900,
        min_width: 10,
        time_length: 1,
        step: -1,
        img_act_width: 0,
        img_act_height: 0,
        img_org_width: 0,
        img_org_height: 0,
        original_time: 0,
        zoomingImg: null,
        initialize: function (a, b) {
            this.container = document.getElementById(b);
            this.zoomingImg = a;
            this.z = document.getElementById(this.zoomingImg);
            this.container.onmousedown = this.drag;
            this.container.onmousemove = this.moveit;
            this.container.onmouseup = function () {
                this.dragapproved = 0
            };
            this.container.onmouseout = function () {
                this.dragapproved = 0
            };
            this.img_act_width = parseInt(this.z.width) ? parseInt(this.z.width) : parseInt(this.z.style.width);
            this.img_act_height = parseInt(this.z.height) ? parseInt(this.z.height) : parseInt(this.z.style.height);
            this.InitStep();
            this.original_time = this.time_length;
            if (this.z.width != 0) {
                this.z.style.width = this.z.width + "px"
            }
            if (this.z.height != 0) {
                this.z.style.height = this.z.height + "px"
            }
            this.min_width = parseInt(this.z.width) ? parseInt(this.z.width) : parseInt(this.z.style.width)
        },
        moveit: function (b) {
            var a = window.event ? window.event : b;
            if (this.dragapproved == 1) {
                this.targetobj.style.left = this.offsetx + a.clientX - this.x + "px";
                this.targetobj.style.top = this.offsety + a.clientY - this.y + "px";
                return false
            }
        },
        drag: function (b) {
            var a = window.event ? window.event : b;
            this.targetobj = window.event ? event.srcElement : b.target;
            if (this.targetobj.className == "drag") {
                this.dragapproved = 1;
                if (isNaN(parseInt(this.targetobj.style.left))) {
                    this.targetobj.style.left = 0
                }
                if (isNaN(parseInt(this.targetobj.style.top))) {
                    this.targetobj.style.top = 0
                }
                this.offsetx = parseInt(this.targetobj.style.left);
                this.offsety = parseInt(this.targetobj.style.top);
                this.x = a.clientX;
                this.y = a.clientY;
                if (a.preventDefault) {
                    a.preventDefault()
                }
            }
        },
        InitStep: function () {
            var a = new Image();
            a.src = document.getElementById(this.zoomingImg)
                .src;
            this.img_org_width = a.width;
            this.img_org_height = a.height;
            this.step = parseInt((this.img_org_width - this.img_act_width) / this.img_act_width);
            if (this.step < 0) {
                this.step = 10
            }
        },
        zoom_out: function (a) {
            if (parseInt(this.z.style.width) == 0) {
                this.z.border = 0
            }
            if (parseInt(this.z.style.width) != 0) {
                if (parseInt(this.z.style.width) > this.min_width) {
                    var b = parseInt(this.z.style.width);
                    this.z.style.width = this.img_act_width + (a * this.step) + "px";
                    this.z.style.height = (Math.round(parseInt(this.z.style.width) * ((this.img_act_height) / (this.img_act_width)))) + "px"
                } else {
                    this.set_original()
                }
            }
        },
        zoom_in: function (a) {
            if (parseInt(this.z.style.width) == 0) {
                this.z.border = 0
            }
            if (parseInt(this.z.style.width) != 0) {
                if (parseInt(this.z.style.width) < this.max_width) {
                    var b = parseInt(this.z.style.width);
                    this.z.style.width = this.img_act_width + (a * this.step) + "px";
                    this.z.style.height = (Math.round(parseInt(this.z.style.width) * ((this.img_act_height) / (this.img_act_width)))) + "px"
                } else {}
            }
        },
        set_original: function () {
            this.z.style.width = this.img_act_width + "px";
            this.z.style.height = this.img_act_height + "px";
            this.z.style.left = 0;
            this.z.style.top = 0
        }
    }
}
var mouseover = false;
var SliderDefaultOrientation = "horizontal";
var SliderClassName = "slider";
var slider = {};
var ori;
var dist;
var lastdisplayvalue = 0;
var dec;
var val;
var from;
var to;

function AddLoadEvent(b) {
    var a = window.onload;
    if (typeof window.onload != "function") {
        window.onload = b
    } else {
        window.onload = function () {
            a();
            b()
        }
    }
}
function GetElementsByClass(c) {
    var e = new Array();
    var g = document.getElementsByTagName("*");
    var b = g.length;
    var d = new RegExp("\\b" + c + "\\b");
    for (var a = 0, f = 0; a < b; a++) {
        if (d.test(g[a].className)) {
            e[f] = g[a];
            f++
        }
    }
    return e
}
function Left(b, a) {
    if (!(b = document.getElementById(b))) {
        return 0
    }
    if (b.style && (typeof (b.style.left) == "string")) {
        if (typeof (a) == "number") {
            b.style.left = a + "px"
        } else {
            a = parseInt(b.style.left);
            if (isNaN(a)) {
                a = 0
            }
        }
    } else {
        if (b.style && b.style.pixelLeft) {
            if (typeof (a) == "number") {
                b.style.pixelLeft = a
            } else {
                a = b.style.pixelLeft
            }
        }
    }
    return a
}
function Top(b, a) {
    if (!(b = document.getElementById(b))) {
        return 0
    }
    if (b.style && (typeof (b.style.top) == "string")) {
        if (typeof (a) == "number") {
            b.style.top = a + "px"
        } else {
            a = parseInt(b.style.top);
            if (isNaN(a)) {
                a = 0
            }
        }
    } else {
        if (b.style && b.style.pixelTop) {
            if (typeof (a) == "number") {
                b.style.pixelTop = a
            } else {
                a = b.style.pixelTop
            }
        }
    }
    return a
}
function moveSlider(b) {
    var b = (!b) ? window.event : b;
    if (mouseover) {
        slider.x = slider.startOffsetX + b.screenX;
        slider.y = slider.startOffsetY + b.screenY;
        if (slider.x > slider.xMax) {
            slider.x = slider.xMax
        }
        if (slider.x < 0) {
            slider.x = 0
        }
        if (slider.y > slider.yMax) {
            slider.y = slider.yMax
        }
        if (slider.y < 0) {
            slider.y = 0
        }
        Left(slider.id, slider.x);
        Top(slider.id, slider.y);
        var d = slider.x + slider.y;
        var a = (slider.distance / slider.valuecount) * Math.round(slider.valuecount * d / slider.distance);
        var c = Math.round((a * slider.scale + slider.from) * Math.pow(10, slider.decimals)) / Math.pow(10, slider.decimals);
        if (c > 0) {
            if (lastdisplayvalue < c) {
                zoom.zoom_in(slider.x)
            } else {
                if (lastdisplayvalue > c) {
                    zoom.zoom_out(slider.x)
                }
            }
        } else {
            zoom.set_original()
        }
        lastdisplayvalue = c;
        return false
    }
    return
}
function slide(a) {
    if (!a) {
        a = window.event
    }
    slider = (a.target) ? a.target : a.srcElement;
    slider.distance = dist ? dist : DefaultSliderLength;
    var b = ((ori == "horizontal") || (ori == "vertical")) ? ori : SliderDefaultOrientation;
    slider.decimals = dec ? dec : 0;
    slider.valuecount = val ? val : slider.distance + 1;
    from = from ? from : 0;
    to = to ? to : slider.distance;
    slider.scale = (to - from) / slider.distance;
    if (b == "vertical") {
        slider.from = to;
        slider.xMax = 0;
        slider.yMax = slider.distance;
        slider.scale = -slider.scale
    } else {
        slider.from = from;
        slider.xMax = slider.distance;
        slider.yMax = 0
    }
    slider.startOffsetX = Left(slider.id) - a.screenX;
    slider.startOffsetY = Top(slider.id) - a.screenY;
    mouseover = true;
    document.onmousemove = moveSlider;
    document.onmouseup = sliderMouseUp;
    return false
}
function sliderMouseUp() {
    if (mouseover) {
        var a = (lastdisplayvalue) ? lastdisplayvalue : 0;
        var b = (a - slider.from) / (slider.scale);
        if (slider.yMax == 0) {
            b = (b > slider.xMax) ? slider.xMax : b;
            b = (b < 0) ? 0 : b;
            Left(slider.id, b)
        }
        if (slider.xMax == 0) {
            b = (b > slider.yMax) ? slider.yMax : b;
            b = (b < 0) ? 0 : b;
            Top(slider.id, b)
        }
        if (document.removeEventListener) {
            document.removeEventListener("mousemove", moveSlider, false);
            document.removeEventListener("mouseup", sliderMouseUp, false)
        } else {
            if (document.detachEvent) {
                document.detachEvent("onmousemove", moveSlider);
                document.detachEvent("onmouseup", sliderMouseUp);
                document.releaseCapture()
            }
        }
    }
    mouseover = false
}

function Init() {
    sliders = GetElementsByClass(SliderClassName);
    for (var a = 0; a < sliders.length; a++) {
        sliders[a].onmousedown = slide
    }
};