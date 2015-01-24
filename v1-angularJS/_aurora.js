/****************************GLOBAL VARIABLES************************************/
//Lenght(hist) = Length(article)
var hist;
var init;
function initialize(histogram){
	window.hist = histogram;
	window.init = histogram;
}

function return_changes(){
	return difference(window.init,window.hist)
}

function difference(list1,list2){
	if (list1.length != list2.length) {
		return null;
	}
	var L = list1.length
	var dif = new Array(L); 
	var i;
	for (i = 0; i < L; i++){
		dif[i] = list1[i]-list2[i];
	}
	return dif;
}

var userSessionCache = new Array();
var tmprArr = new Array();
        
//Keep track of which view is running
var highlightMode   = false;

//Article buffers for swap
var articleOriginal_noHTML  = "";    //No html elements
var articleBuffer_userView  = "";    //Contains user's highlights
var articleBuffer_bgView    = "";    //Contains all highlights
/********************************************************************************/

/*
 *  Applies the color overlay onto article 
 *  Overlay is read out from the highlightArr
 */
 function applyOverlay(highlightsArr, view){    
    //Define highlight colors
    //    THIS WILL BECOME ITS OWN MONSTROSITY IN TIME...for now RED and GREEN highlights will suffice
    //Take average of hist array and set that as yellow
    //Fit a guassian distribution to scale the color incrementation

    //Need to convert this to <style> tags soon
    var color = '';
    color = "green";
    var highlightStartTag_UP      = "<font style='color: black; background-color: "+color+";'>";
    color="red";
    var highlightStartTag_DOWN    = "<font style='color: black; background-color: "+color+";'>";
    color="yellow";
    var highlightStartTag_NEUTRAL = "<font style='color: black; background-color: "+color+";'>";
    var highlightEndTag           = "</font>";

    //Flag to help with traversal
    var insideTag = false;

    //Traversal Elements
    var index = 0;          //Counts positin in highlight array
    var editedTxt = "";     //Builds up the output string with highlights
    var tmpArticle= "";
    if(view=="bg")
      tmpArticle = articleBuffer_bgView;
    else //If not background, then view must be user view
      tmpArticle = articleBuffer_userView;

    //Go through article
    //Article (without html elements) and history array should be the same size
    for(var i=0; i<tmpArticle.length; i++){
      var focused_char = tmpArticle[i];
      if(focused_char=="<"){
        insideTag = true;
        editedTxt+=focused_char;
        continue;
      }else if(focused_char==">"){
        insideTag = false;
        editedTxt+=focused_char;
        continue;
      }

      if(insideTag){
        editedTxt+=focused_char;
        continue;
      }
      
      //console.log(focused_char);
      //There will be more to do here in terms of color gradients
      //Here we are taking the fine-grain approach, where each character
      //has a <font> tag wrapped around with 
      if(highlightsArr[index]>0){
        editedTxt+=highlightStartTag_UP;
      }else if(highlightsArr[index]<0){
        editedTxt+=highlightStartTag_DOWN;
      }else{
        if(view=="bg")
          editedTxt+=highlightStartTag_NEUTRAL;
      }
      editedTxt+=focused_char;
      editedTxt+=highlightEndTag;
      index++;
    }

    return editedTxt;
 }

/*
 *  RGB to Hex Conversion Modules
 */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/*
 *  Generates color
 *    MAX RGB value is 255
 *    NEUTRAL : [RGB] - [227,227,79]
 *      MEDIAN GETS NEUTRAL
 */
function colorGenerate(median, max, min, focus){
  var colorR    = 0;
  var colorG    = 0;
  var colorB    = 0;
  var colorHex  = '';

  //Take care of extremes in a hard-coded manner to avoid calculations
  if(focus==max){
    colorR = 0;
    colorG = 255;
    colorB = 0;
    colorHex = rgbToHex(colorR, colorG, colorB);
  }else if(focus==min){
    colorR = 255;
    colorG = 0;
    colorB = 0;
    colorHex = rgbToHex(colorR, colorG, colorB);
  }else if(focus==median){
    colorR = 255;
    colorG = 255;
    colorB = 0;
    colorHex = rgbToHex(colorR, colorG, colorB);
  }else{
    if(focus<median){
      colorR = focus * Math.abs(255. / min);
      colorG = 255 - focus * Math.abs(255. / min);
      colorB = 0;
    }else{ //must be > median
      colorR = 255 - focus * Math.abs(255. / max);
      colorG = focus * Math.abs(255. / max);
      colorB = 0;
    }
    colorHex = rgbToHex(colorR, colorG, colorB);
  }
  return colorHex;
}

/*
 *  Updates master highlights with user highlights 
 */
function updateHist(like, startInd, endInd){
  if(endInd>hist.length){
    console.log('ERROR: Selection EndIndex > Length of Data');
  //  return;//error handling
  }else{
    for (var i=startInd;i<endInd;i++){
      hist[i]+=like;
      //userSessionCache[i]+=like;    
    }
  }
}

/*
 *  Update user session cache with user highlights
 */
function updateUserCache(like, startInd, endInd){
  if(endInd>userSessionCache.length){
    console.log("EndItr > userSessionCache");
    return;
  }else{
    for(var i=startInd;i<endInd;i++){
      userSessionCache[i]+=like;
    }
  }
}

/*
 *  Swaps User Session View with Highlight History View  
 */
function swap(){
  var newTxt = "";
  if(highlightMode){
    //update() here
    newTxt = applyOverlay(userSessionCache, "uv");
    highlightMode = false;
    console.log("Switching to user mode");
  }else{
    //not highlight mode so show highlights
    //update() here
    newTxt = applyOverlay(hist, "bg");
    highlightMode = true;
    console.log("Switching to highight mode");
  }

  //apply article to page
  document.getElementById("Article").innerHTML = newTxt;
}

/*
 * This gets the highlighted text and passes it to the
 * highlighting function
 */
function getBodyTextOffset(node, offset) {
  var sel = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(document.getElementById('Article'));
  range.setEnd(node, offset);
  sel.removeAllRanges();
  sel.addRange(range);

  return sel.toString().length;
}
function getSelectionOffsets(like) {
  //Only allow editting under user view
  console.log("HIGHLIGHT MODE: "+highlightMode);
  if(highlightMode){
    window.alert("Plase switch to user mode to highlight");
    return;
  }
  var sel, range;
  var start = 0, end = 0;
  var goodStartHighlight = false;
  var goodEndHighlight = false;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(sel.rangeCount - 1);

      for(var i = 0; i < $(sel.anchorNode).parents().length; i++){
        if ($(sel.anchorNode).parents()[i].id == "Article"){
          goodStarHighlight = true;
        }
      }
      for(var i = 0; i < $(sel.focusNode).parents().length; i++){
        if ($(sel.focusNode).parents()[i].id == "Article"){
          goodEndHighlight = true;
        }
      }

      if (goodStarHighlight && goodEndHighlight){
        start = getBodyTextOffset(range.startContainer, range.startOffset);
        end   = getBodyTextOffset(range.endContainer, range.endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        alert("Invalid Selection");
      }
      console.log("["+start + ", " + end+"]\t"+sel.toString());
            
    }
  } else if (document.selection) { //IE stuff
      //This needs verification to make sure it works properly
      var oSelection;
      var oTxtRange;
      var units = -100000;
      var iStartIndex = -1, iEndIndex = -1;

      oSelection = document.selection;
      oTxtRange = oSelection.createRange();

      if(oTxtRange){
        iStartIndex = oTxtRange.moveStart('character',units);
        iEndIndex = oTxtRange.moveEnd('character',units);
        iStartIndex *= -1;
        iEndIndex *= -1;
      }
    }

    //Update data model with likes
    //var fudgeFactor = 97;  //use until localize to article div
    updateUserCache(like,start+1,end+1);
    updateHist(like,start+1,end+1);

    var newTxt = applyOverlay(userSessionCache);
    document.getElementById("Article").innerHTML = newTxt;

    return {
      start: start,
      end: end
    };
  }

/*
 * Merge two arrays, can't find the built in function so w.e.
 *  Arr1.length = Arr2.length
 */
function merge(arr1,arr2){
  var tmp = new Array();
  for(var i=0; i<arr1; i++){
      tmp.push(arr1[i]+arr2[i]);
  }
  return tmp;
}

/*
 * Loads up the content inside <div id="Article"></div> into
 * articleBuffer and returns it. 
 */
function formArticleBuffer(){
  //KEEP in mind that <p> and other tags are included in this buffer
  var articleBuffer = document.getElementById('Article').innerHTML;
  console.log("Original Article\n"+articleBuffer);
  var insideTag=false;
  var encounteredFirstChar = false;

  for(var i=0; i<articleBuffer.length; i++){
    var focused_char  = articleBuffer[i];
    if(focused_char=="<"){
      insideTag=true;
      continue;
    }if(focused_char==">"){
      insideTag=false;
      continue;
    }if(focused_char=="\n" || focused_char=="\r"){
      continue;
    }
    if(insideTag){
      continue;
    }
    articleOriginal_noHTML+=focused_char;
    tmprArr.push(focused_char);
    
  }
  console.log(articleOriginal_noHTML);
  console.log(tmprArr);
  articleBuffer_userView = articleBuffer;
  articleBuffer_bgView  = articleBuffer;
  console.log(articleBuffer_userView);
}

/*
 *  Initializes an array of zeros representing user session.
 *    Remember to skip html elements
 */
function formUserSessionCache(){
  var insideTag=false;
  for (var i = 0; i < articleBuffer_userView.length+1; i++){
    var focused_char = articleBuffer_userView[i];
    if(focused_char=='<'){
      insideTag=true;
      continue;
    }else if(focused_char=='>'){
      insideTag=false;
      continue;
    }else if(insideTag){
      continue;
    }
    userSessionCache.push(0);
  }
  console.log("Length of article:"+articleBuffer_userView.length);
  console.log("Length of cache:"+userSessionCache.length);
  console.log(userSessionCache); 
}

/*
 *  remove highights
 */
function removeHighlightFromSelectedText() {
  highlighter.unhighlightSelection();
}

/*
 *  Calculates the average of an array (Why is this not built-in :/ )
 */
function average(array){
  var tmp = 0;
  for(var i=0; i<array.length; i++){
    tmp+=array[i];
  }
  return tmp / array.length;
}
/*
 *  Calculates the std of an array...again fuck javascript ITS NOT A REAL LANGUAGE
 */
function std(array){

}
/*
 *  Calculates the median...I am not even going to bother whining
 */
function getMedian(array) {
  array.sort( function(a,b) {return a - b;} );
  var half = Math.floor(array.length/2);
  if(array.length % 2)
    return array[half];
  else
    return (array[half-1] + array[half]) / 2.0;
}

/*
 *  Returns the max of an array
 */
function getMax(array){
  var tmp = array.sort(array);
  return tmp[tmp.length];
}

/*
 * Return the min of an array
 */
function getMin(array){
  var tmp = array.sort(array);
  return tmp[0];
}

/*
 *  Runner becuse onload is stupid and works once
 */
 function load(){

  formArticleBuffer();
  formUserSessionCache();

}
window.onload = load;
