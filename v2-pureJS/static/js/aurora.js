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
	var elm = get('Article'), i, itr = 0, inTag = false, c, html = "";
	for (i = 0; i < content.length; i++) {
		c = content.charAt(i);
		if (c === '<') {
			inTag = true;
		}
		if (!inTag) {
			html += '<span class="article-content" id="' + itr + '">' + c + '</span>';
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
	window.hist = new Array(itr+1);
}


// Helper Methods
function get(id) {
	return document.getElementById(id);
}

function checkSelectEvent(e) {
	var sel = getSelection();
	var output = "Check event: ";
	if (assert_selection(sel)) {
		if (valid_selection) {
			deselection();
			valid_selection = false;
			hideMenu();
			console.log(output + "fail a");
			return;
		}
		window.valid_selection = true;
		showMenu(e.pageY,e.pageX);
		console.log(output + "show b");
		return;
	} else {
		window.valid_selection = false;
		hideMenu();
		console.log(output + "fail c");
		return;
	}
	return;
};
function deselection() {
	if (window.valid_selection) {
		window.valid_selection = false;
		var sel = getSelection();
		sel.removeAllRanges();
	}
};
function assert_selection(sel) {
	if (!sel || sel.isCollapsed) {
		console.log("assert return first");
		return false;
	}
	var range = getRangeObject(getSelection());
	var ancestor = findFirstCommonAncestor(range.startContainer,range.endContainer);
	console.log(ancestor);
	var inBounds = ancestor.id === "Article";
	if (inBounds && sel.toString().length > 0) {
		console.log("assert return on last check");
		return true;
	}
	console.log("assert return on end");
	return false;
};
function getSelection() {
	if (document.selection){
		return document.selection;
	} else {
		return document.getSelection();
	}
};
function getRangeObject(selectionObject) {
	if (selectionObject.getRangeAt)
		return selectionObject.getRangeAt(0);
	else {
		var range = document.createRange();
		range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
		range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
		return range;
	}
};
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


window.addEventListener("load",init);
window.addEventListener("mouseup",checkSelectEvent);

function getElementIndex(elm) {
	if (elm.parentNode) {
		return parseInt(elm.parentNode.id);	
	} else {
		return parseInt(elm.getParent().id);
	}
}
function rateSelection(rating) {
	var sel   = getSelection();
	var range = getRangeObject(sel);
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
};
function initHist(n) {
	for (i = 0; i <= n; i++) {
		if (window.hist[i] == null) {
			window.hist[i] = 0;
		}
	}
};
function getRating(i) {
	if (!applyOverlay) return "#FFFFFF";
	var max = max, color = 0;
	color = Math.floor(50 + 248*(Math.abs(window.hist[i])/max));
	if (window.hist[i] > 0) {
		get(""+i).style.background = "#00" + color.toString(16) + "00";
	} else if (window.hist[i] < 0 ) {
		get(""+i).style.background = "#" + color.toString(16) + "0000";
	}
}
function findFirstCommonAncestor(nodeA, nodeB, ancestorsB) {
	var ancestorsB = ancestorsB || getAncestors(nodeB);
	if(ancestorsB.length == 0) return null;
	else if(ancestorsB.indexOf(nodeA) > -1) return nodeA;
	else if(nodeA == document) return null;
	else return findFirstCommonAncestor(nodeA.parentNode, nodeB, ancestorsB);
}

function getAncestors(node) {
	if(node != document) return [node].concat(getAncestors(node.parentNode));
	else return [node];
}

if(Array.prototype.indexOf === undefined) {
	Array.prototype.indexOf = function(element) {
		for(var i=0, l=this.length; i<l; i++) {
			if(this[i] == element) return i;
		}
		return -1;
	};
}

