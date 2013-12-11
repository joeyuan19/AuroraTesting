function init_highlight_UI() {
	var t = get('Article').innerHTML;
	window.valid_selection = false;
	document.onclick = check_for_selection;
	get('Article').onblur  = hide_menu;
	return;
}

// Selection Methods
function get_selection() {
	if (document.selection){
		return document.selection;
	} else {
		return document.getSelection();
	}
}
function assert_selection(sel) {
	if (!sel || sel.isCollapsed) {
		return false;
	}
	var inBounds = false;
	if (document.selection) {
		inBounds = sel.createRange().parentElement().id == 'Article';
	} else if (window.getSelection) {
		inBounds = sel.getRangeAt(0).commonAncestorContainer.parentNode.id == 'Article';
	}
	if (inBounds && sel.toString().length > 0) {
		return true;
	}
	return false;
}
function deselection() {
	if (window.valid_selection) {
		window.valid_selection = false;
		var sel = get_selection();
		sel.removeAllRanges();
		hide_menu();
	}
}
function check_for_selection(e) {
	var sel = get_selection();
	if (assert_selection(sel)) {
		if (window.valid_selection) {
			deselection();
			window.valid_selection = false;
			return;
		}
		window.valid_selection = true;
		show_menu(e.pageX,e.pageY);
		return;
	} else {
		window.valid_selection = false;
		hide_menu();
		return;
	}
}

// Helper Methods

function set(id,html) {
	document.getElementById(id).innerHTML=html;
}
function add(id,html) {
	document.getElementById(id).innerHTML+=html;
}
function add_to_value(id,text) {
	document.getElementById(id).value += text;
}
function get(id) {
	return document.getElementById(id);
}
function parse_selection(selection,start,end) {
	var snippet = "";
	if (start < 0) {
		start = 0;
	} else if (start >= selection.length) {
		start = selection.length - 1;
	}
	if (end < 0) {
		end = 0;
	} else if (end >= selection.length) {
		end = selection.length;
	}
	for (var i = start; i < end; i++) {
		snippet += selection[i];
	}
	return snippet;
}

// Menu options

function toggle_menu() {
	var menu = get('highlight-menu');
	if (menu.style.display == 'inline') {
		menu.style.display = 'none';
	} else {
		menu.style.display = 'inline';
	}
}
function show_menu(mouseX,mouseY) {
	var menu = get('highlight-menu');
	menu.style.display = 'inline';
	menu.style.top     = mouseY + 'px';
	menu.style.left    = mouseX + 'px';
}
function hide_menu() {
	var menu = get('highlight-menu');
	menu.style.display = 'none';
	menu.style.top     = '-100px';
	menu.style.left    = '-200px';
}

// Menu Button functions

function rate_selection(rating) {
	var sel   = get_selection();
	var range = sel.getRangeAt(0); 
	var start = range.startOffset;
	var end   = range.endOffset
	/*
	if (rating > 0) {
		rating = 1;
	} else {
		rating = -1;
	}
	for (var i = start; i < end; i++) {
		window.hist[i] += rating;
	}
	*/
	alert('Rating: ' + rating + ' from ' + start + ' to ' + end );
	deselection();
}
function quote_selection() {
	var sel     = get_selection();
	var range   = sel.getRangeAt(0);
	var start   = range.startOffset;
	var end     = range.endOffset;
	var preview = parse_selection(sel.toString(),0,10);
	add_to_value('id_content','\n"' + preview + '..."\n');
	add('comment-form-highlights','[' + start + ',' + end + ']')
	deselection();
}



