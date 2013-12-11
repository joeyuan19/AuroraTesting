var auroraApp = angular.module('auroraApp', []);
auroraApp.config(function($interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
});
auroraApp.controller('Aurora',function Puzzle($scope) {
	$scope.test = '1 2 3 4 5 6 7 8 9 t e s t i n g 1 2 3 4 5 6 7 8 9 t e s t i n g 1 2 3 4 5 6 7 8 9'
	$scope.valid_selection = false;
	$scope.applyOverlay = false;
	$scope.toggleOverlay = function() {
		$scope.applyOverlay = $scope.applyOverlay ? false : true;
	};
	$scope.click_top = 0;
	$scope.click_left = 0;
	$scope.mixedColor = false;
	$scope.article = {'url':'article.html'};	
	$scope.content = "This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test This is a test";
	$scope.hist = new Array();
	$scope.nRatings = new Array();
	$scope.checkSelectEvent = function(e) {
		var sel = getSelection();
		if ($scope.assert_selection(sel)) {
			if ($scope.valid_selection) {
				$scope.deselection();
				$scope.valid_selection = false;
				$scope.click_top = 0;
				$scope.click_left = 0;
				return;
			}
			$scope.valid_selection = true;
			$scope.click_top = e.pageY;
			$scope.click_left = e.pageX;
			return;
		} else {
			$scope.valid_selection = false;
			$scope.click_top = 0;
			$scope.click_left = 0;
			return;
		}
		return;
	};
	$scope.deselection = function() {
		if ($scope.valid_selection) {
			$scope.valid_selection = false;
			var sel = getSelection();
			sel.removeAllRanges();
			console.log('deselection');
		}
	};
	$scope.assert_selection = function(sel) {
		if (!sel || sel.isCollapsed) {
			return false;
		}
		var inBounds = false;
		if (document.selection) {
			inBounds = sel.createRange().parentElement().id == 'Article';
		} else if (window.getSelection) {
			inBounds = sel.getRangeAt(0).commonAncestorContainer.id == 'Article';
		}
		if (inBounds && sel.toString().length > 0) {
			return true;
		}
		return false;
	};
	var getSelection = function() {
		if (document.selection){
			return document.selection;
		} else {
			return document.getSelection();
		}
	};
	var getRangeObject = function(selectionObject) {
		if (selectionObject.getRangeAt)
			return selectionObject.getRangeAt(0);
		else {
			var range = document.createRange();
			range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
			range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
			return range;
		}
	}
	var getElementIndex = function(elm) {
		if (elm.parentNode) {
			return parseInt(elm.parentNode.id);	
		} else {
			return parseInt(elm.getParent().id);
		}
	}
	$scope.rateSelection = function(rating) {
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
			$scope.addToHist(i,rating);
		}
	};
	$scope.init = function() {
		initHist($scope.content.length);
	};
	var initHist = function(n) {
		for (i = 0; i <= n; i++) {
			if ($scope.hist[i] == null) {
				$scope.hist[i] = 0;
				if ($scope.mixedColor) {
					$scope.nRatings[i] = 0;
				}
			}
		}
	};
	$scope.max = 0;
	$scope.getRating = function(i) {
		if (!$scope.applyOverlay) return "#FFFFFF";
		var max = $scope.max, color = 0;
		
		if (!$scope.mixedColor) {
			color = Math.floor(50 + 205*(Math.abs($scope.hist[i])/max));
			if ($scope.hist[i] > 0) {
				return "#00" + color.toString(16) + "00";
			} else if ($scope.hist[i] < 0 ) {
				return "#" + color.toString(16) + "0000";
			} else {
				return "#FFFFFF";
			}
		} else {
			color_pos = Math.floor(50 + 205*(Math.abs($scope.hist[i])/max));
			color_neg = Math.floor(50 + 205*(Math.abs($scope.nRatings[i]-$scope.hist[i])/max));
			if ($scope.nRatings[i] == 0) {
				return "#FFFFFF";
			} else {
				return "#" + color_neg.toString(16) + color_pos.toString(16) + "00";
			}
		}
	};
	$scope.addToHist = function(i,rating) {
		if ($scope.hist[i] == null) {initHist(i);}
		if ($scope.mixedColor) {
			if (rating > 0) {
				$scope.hist[i]++;
			}
			$scope.nRatings[i]++;
			if (Math.abs($scope.nRatings[i]) > $scope.max) {
				$scope.max = Math.abs($scope.nRatings[i]);
			}
		} else {
			$scope.hist[i] += rating;	
			if (Math.abs($scope.hist[i]) > $scope.max) {
				$scope.max = Math.abs($scope.hist[i]);
			}
		}
	};
	$scope.getNRatings = function(n){
		return $scope.nRatings[n];
	}
});
function get(id) {
	return document.getElementById(id);
}
