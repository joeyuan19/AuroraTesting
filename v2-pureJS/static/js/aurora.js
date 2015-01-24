// global variables
var content = "<p>This is a <b>Test</b>.  " + 
	"To see if Aurora can work when the content is html-ful</p>" + 
	"<div><p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p><script src='static/js/derp.js'></script>" +
	"To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p>" +
	"<p>To see if Aurora can work when the content is html-ful</p></div>";
function init() {
	/* Set up Article */
	var elm = get('Article'), i, itr = 0, inTag = false, c, html = "";
	for (i = 0; i < content.length; i++) {
		c = content.charAt(i);
		if (c === '<') {
			inTag = true;
		}
		if (!inTag) {
			html += '<span class="article-content" id="content-index-' + itr + '">' + c + '</span>';
			itr++;
		} else {
			html += content[i];
		}
		if (c === '>') {
			inTag = false;
		}
	}
	html.replace(new RegExp("<script.*</script>"),"");
	elm.innerHTML = html;
	
	/* Set up variables */
	console.log(itr);
	initHist(itr);
	window.overlay = false;
	window.validSelection = false;

}

/* Check for a selection */
function checkSelectEvent(e) {
	checkForButton(e);
	var sel = getSelection();
	if (assertSelection(sel)) {
		if (window.validSelection) {
			deselection();
			window.validSelection = false;
			hideMenu();
			return;
		}
		window.validSelection = true;
		showMenu(e.pageY,e.pageX);
	} else {
		window.validSelection = false;
		hideMenu();
	}
	return;
};
function checkForButton(e) {
	if (isChild(e.target,get("Menu"))) {
		var elm_id = e.target.id;
		if (elm_id == "menu-btn-up") {
			rateSelection(1);
			deselection();
		} else if (elm_id == "menu-btn-down") {
			rateSelection(-1);
			deselection();
		} else if (elm_id == "menu-btn-quote") {
			alert("QUOTES COMING SOON");
			deselection();
		} else if (elm_id == "menu-btn-toggle") {
			window.overlay = window.overlay ? false : true;
			refreshOverlay();
			deselection();
		}
	}
}
/* Force deselection of text */
function deselection() {
	if (window.validSelection) {
		window.validSelection = false;
		hideMenu();
		var sel = getSelection();
		sel.removeAllRanges();
	}
};
/* Assert that a selection is non-empty lives within article */
function assertSelection(sel) {
	if (!sel || sel.isCollapsed) {
		return false;
	}
	var range = getRangeObject(getSelection());
	var inBounds = inArticle(range.startContainer) && inArticle(range.endContainer); 
	if (inBounds && sel.toString().length > 0) {
		return true;
	}
	return false;
};
/* Detect whether the element passed as an argument is a part of the Article */
function inArticle(elm) {
	return isChild(elm,get("Article"));
}
function isChild(elm,par) {
	var itr = elm; 
	while (itr != document.body && itr != null) {
		if (itr == par) {
			return true;
		}
		itr = itr.parentNode;
	}
	return false;
};
/* Selection retrieval desgined for cross-browser compatibility */
function getSelection() {
	if (document.selection){
		return document.selection;
	} else {
		return document.getSelection();
	}
};
/* Range retrieval desgined for cross-browser compatibility */
function getRangeObject(selectionObject) {
	if (!selectionObject) return;
	if (selectionObject.getRangeAt) {
		console.log(selectionObject);
		return selectionObject.getRangeAt(0);

	} else {
		var range = document.createRange();
		range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
		range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
		return range;
	}
};
/* Show/Hide Menu */
function showMenu(x,y) {
	var menu           = get('Menu');
	menu.style.left    = x+'px';
	menu.style.top     = y+'px';
	menu.style.display = 'block';
};
function hideMenu() {
	var menu           = get('Menu');
	menu.style.left    = '-100px';
	menu.style.top     = '-100px';
	menu.style.display = 'none';
};
/* retrieve the indexed character in the Article */
function getElementIndex(elm) {
	var _elm = elm.nodeName == "#text" ? elm.parentNode : elm;
	if (_elm) {
		return parseInt(_elm.id.replace("content-index-",""));
	} else {
		return null; 
	}
};
function getElementByIndex(index) {
	return get("content-index-"+index);
}
/* Apply a rating to the article */
function rateSelection(rating) {
	var range = getRangeObject(getSelection());
	var start = getElementIndex(range.startContainer),
		end   = getElementIndex(range.endContainer);
	if (rating > 0) {
		rating = 1;
	} else {
		rating = -1;
	}
	for (var i = start; i <= end; i++) {
		addToHist(i,rating);
	}
	refreshOverlay();
};
function addToHist(index,rating) {
	if (index >= hist.length) return;
	hist[index] += rating;
	if (Math.abs(hist[index]) > max) {
		max = Math.abs(hist[index]);
	}
}
/* Initialize Histogram with existing information about Article */
function initHist(n) {
	// Load existing Highlights
	// increment appropriately
	if (window.hist == null) window.hist = new Array(n);
	for (i = 0; i < n; i++) {
		if (window.hist[i] == null) {
			window.hist[i] = 0;
		}
	}
	window.max = 1;
};
function refreshOverlay() {
	for (var i = 0; i < window.hist.length; i++) {
		setRating(i); 
	}
};
function setRating(i) {
	try {
	if (!window.overlay) {
		getElementByIndex(i).style.background = "#FFFFFF"; 
		return;
	}
	var color = Math.floor(50 + 205*(Math.abs(window.hist[i])/window.max));
    var box_string = "x";
	if (window.hist[i] > 0) {
		getElementByIndex(i).style.background = "#00" + color.toString(16) + "00";
		getElementByIndex(i).style["box-shadow"] = "#00" + color.toString(16) + "00";
		getElementByIndex(i).style["-moz-box-shadow"] = "#00" + color.toString(16) + "00";
		getElementByIndex(i).style["-webkit-box-shadow"] = "#00" + color.toString(16) + "00";
	} else if (window.hist[i] < 0 ) {
		getElementByIndex(i).style.background = "#" + color.toString(16) + "0000";
	} else {
		getElementByIndex(i).style.background = "#FFFFFF"; 
	}
	} catch (e) {
		console.log("Error at: " + i); 
	}
};

/* Helper Methods */
function get(id) {
	return document.getElementById(id);
}


window.addEventListener("load",init);
window.addEventListener("mouseup",checkSelectEvent);
