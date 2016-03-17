var dirtyForm=false;
window.onbeforeunload = function(e){
  if(dirtyForm)
    return 'Some changes have not been exported.';
};
// https://github.com/marioizquierdo/jquery.serializeJSON/issues/32#issuecomment-71833934
(function($){
  $.fn.deserializeJSON = function(s){
    $(this).find("input, select, textarea").each(function(){
      var o = s;
      var match, arrays;
      var name = this.name;
      if (match = name.match(/^(.*):([^:]+)$/)){
        name = match[1]
      }
      var names = []
      if(name.indexOf("[") > -1){
        names.push(name.substring(0, name.indexOf("[")));
        if(match=name.match(/\[([^\]]+)\]/g)){
          for(var i=0;i<match.length;i++){
            names.push(match[i].substring(1, match[i].length-1));
          }
        }
      }else{
        names.push(name);
      }
      for(var i=0;i<names.length;i++){
        o = o[names[i]];
        if(o == null) return;
      }
      if(names.length>0 && o!=null){
        if($(this).is("[type=checkbox]")){
            if(o.toString() === "false"){
              if($(this).is(":checked")){
                $(this).click();
              }
            }else{
              if(!$(this).is(":checked")){
                $(this).click();
              }
            }
        }else{
          if ($(this).is(".modifier")){
            if (o > 0){
              o = "+" + o;
            }
          }
          $(this).val(o);
        }
      }
    });
  };
})(jQuery);
function exportSheet() {
  var customParse = function(val, inputName) {
    if (val === "") return null; // parse empty strings as nulls
    if (val === "on")  return true; // parse "on" (from checkboxes) as true
    return val;
  }
  var filename = $("#filename").val();
  var obj = $("#sheet").serializeJSON({
    checkboxUncheckedValue: 'false',
    parseAll: true,
    parseWithFunction: customParse
  });
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
  var a = $("#export-sheet")[0];
  a.href = 'data:' + data;
  a.download = filename + '.json';
  document.title = filename;
  dirtyForm=false;
}
function importSheet() {
  $("#sheet-file").trigger('click');
  $("#sheet-file").bind("change", function () {
    var upload = $("#sheet-file")[0].files[0];
    var url = window.URL.createObjectURL(upload);
    $.getJSON(url, function(data) {
      newSheet(data.meta['sheet'], data);
    });
    $("#sheet-file").val("");
  });
}
function newSheet(sheetName, sheetData) {
  var sheet = "sheets/" + sheetName + "/sheet";
  $("#sheet-css")[0].href = sheet + ".css";
  $("#sheet-html").load(sheet + ".html", function() {
    if (sheetData) {
      $("#sheet").deserializeJSON(sheetData);
      $("input[type=text]").each(autoSizeInput);
      document.title = $("#filename").val();
    };
    dirtyForm=false;
    //super simple change event on every form input
    $("form :input").change(function() {
      dirtyForm=true;
    });
    $("figure").on("click", promptImage);
    setImages();
    setFooterPostion();
  });
}

//If I thought about this longer I could probably consolodate these into one function, but I'm lazy for now
function importCheckFirst(){
  if(dirtyForm)
  {
    var result=window.confirm('Some data may be overwritten by an import. Continue?');
    if(result)
      importSheet();
  }
  else
    importSheet();
}
function titleDataCheck(){
  if(dirtyForm)
  {
    var result=window.confirm('Some data may be overwritten. Are you sure you want to create a new sheet?');
    if(result)
      newSheet('default');
  }
  else
    newSheet('default');
}
function promptImage(e) {
  var current = $(this).children("input").val();
  var url = window.prompt("Enter an image URL.", current);
  if (url === null || url === current) {
    return false;
  }
  $(this).children("input").val(url);
  setImages();
}
function setImages() {
  $("figure input").each(function(i, obj){
    var url = $(obj).val();
    $(obj).next("img").attr("src", url);
  });
}
// auto adjusts size of user input to fit field
function autoSizeInput(event) {
  // fetch all initial size values
  var textHeight = parseInt($(this).css('font-size'), 10);
  var scrollHeight = this.scrollHeight;
  var scrollWidth = this.scrollWidth;
  var fieldCssHeight = parseInt($(this).css('height'), 10);
  var fieldCssWidth = parseInt($(this).css('width'), 10);
  var fieldInnerHeight = $(this).innerHeight();
  var fieldInnerWidth = $(this).innerWidth();
  // only re-adjust if text is too short, too tall, or too wide
  if (textHeight != fieldCssHeight || scrollHeight > fieldInnerHeight || scrollWidth > fieldInnerWidth ){
    // set baseline size to field height
    $(this).css('font-size', fieldCssHeight);
    // fetch updated text sizes
    var updatedTextHeight = parseInt($(this).css('font-size'), 10);
    var updatedScrollHeight = this.scrollHeight;
    var updatedScrollWidth = this.scrollWidth;
    // if text is too tall after baseline, calculate a new font size
    if (updatedScrollHeight > fieldInnerHeight){
      var variance = updatedScrollHeight - fieldCssHeight
      var newHeight = updatedTextHeight - variance;
      $(this).css('font-size', newHeight + 'px');
    }
    // fetch updated sizes, yet one more time
    var updatedTextHeight = parseInt($(this).css('font-size'), 10);
    var updatedScrollHeight = this.scrollHeight;
    var updatedScrollWidth = this.scrollWidth;
    // if the text is still too wide, calculate a new font size
    if (updatedScrollWidth > fieldInnerWidth){
      var ratio = updatedTextHeight / updatedScrollWidth;
      var newHeight = fieldCssWidth * ratio;
      $(this).css('font-size', newHeight + 'px');
    }
  }
}
// make sure footer is always at the bottom
function setFooterPostion() {
  if ($(document).height() <= window.innerHeight){
    $("footer").css("position", "absolute");
  } else {
    $('footer').css('position', '');
  }
}
function browserCheck() {
  if (document.cookie.indexOf("browser_check") < 0) {
     // http://stackoverflow.com/a/9851769
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    if (isFirefox || isIE || isEdge){
      alert("RPG Sheet has only been tested in Chrome/Chromium. It is very likely to be broken in your browser. \n\nHere be dragons.");
    } else if (isOpera || isSafari){
      alert("RPG Sheet has only been tested in Chrome/Chromium. While it should work in most WebKit browsers, there are likely to be some bugs.\n\nHere be dragons.");
    }
    document.cookie="browser_check=true"
  }
}

$("#import-sheet").on("click", importCheckFirst);
$("#export-sheet").on("click", exportSheet);
$("#print-sheet").on("click", function(){ window.print(); });
$(".title").on("click", function(){ location.reload(true); });
$("#sheet-html").on("keyup", 'input[type=text]', autoSizeInput);
window.onload = function(){ newSheet("default"); browserCheck(); };
