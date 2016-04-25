var dirtyForm=false; // initialize form dirty state as clean
(function($){ // https://github.com/marioizquierdo/jquery.serializeJSON/issues/32#issuecomment-71833934
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
function exportSheet() { // export current sheet to a JSON file for user to download
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
function importSheet() { // import a JSON sheet uploaded by user
  var uploader = $("#sheet-file")
  uploader.trigger("click");
  uploader.bind("change", function () {
    var sheetFile = uploader[0].files[0];
    uploader.val("");
    var reader = new FileReader();
    reader.onloadend = function() {
      var sheetData;
      try {
        sheetData = JSON.parse(reader.result);
      } catch (error) {
        return alert("RPG Sheet was not able to import your sheet because of the following error:\n\n" + error);
      }
      var sheetName = sheetData.meta['sheet'];
      newSheet(sheetName, sheetData);
    }
    reader.readAsText(sheetFile)
  });
}
function newSheet(sheetName, sheetData) { // load a given sheet, deserialize data if given
  var sheetDir = "sheets/" + sheetName + "/";
  var sheetCss = sheetDir + "style.css";
  var sheetMain = sheetDir + "main.html";
  var sheetFooter = sheetDir + "footer.html";

  $("main").load(sheetMain, function(response, status, xhr) {
    if (status == "error") {
      alert("The sheet module you are attempting to load is not supported by this instance of RPG Sheet.\n\nEither the sheet module is not installed or you are importing a sheet with bad meta values.");
      return;
    }

    $("#sheet-css")[0].href = sheetCss;
    $("footer").load(sheetFooter);

    if (sheetData) {
      var sheetDataVersion = sheetData.meta['version'];
      var sheetVersion = parseInt($("input[name=meta\\[version\\]]").val());

      if (sheetDataVersion < sheetVersion) {
        alert("The version of the sheet that you are importing is older than the current version of this module. There may be some incomplete or missing data.\n\nExporting will update your sheet to the current version.");
      } else if (sheetDataVersion > sheetVersion) {
        alert("The version of the sheet that you are importing is newer than the current version of this module. There may be some incomplete or missing data.\n\nExporting will overwrite your sheet with the older version.");
      }

      $("#sheet").deserializeJSON(sheetData);
      // set the sheet version back to what it was before deserializing data
      $("input[name=meta\\[version\\]]").val(sheetVersion);
      document.title = $("#filename").val();
      // There is no DOM event to indicate that elements have fully rendered CSS
      // changes. Use a timeout to attempt to queue sizing input text until
      // after the changes are rendered.
      setTimeout(function() {
        $("input[type=text]").each(autoSizeInput);
      }, 0);
    };

    dirtyForm=false;
    //super simple change event on every form input
    $("form :input").change(function() { dirtyForm=true; });
    $("figure").on("click", promptImage);
    setImages();
    getSheetOptions();
  });
}
function importCheckFirst(){ // confirm if user tries to import over a dirty form
  if (dirtyForm) {
    var result=window.confirm('Some data may be overwritten by an import. Continue?');
    if (result) {
      importSheet();
    }
  } else {
    importSheet();
  }
}
function promptImage(e) { // prompt user for image url for given figure
  var current = $(this).children("input").val();
  var url = window.prompt("Enter an image URL.", current);

  if (url === null || url === current) {
    return false;
  }

  $(this).children("input").val(url);
  setImages();
}
function setImages() { // take the image urls in figure inputs and load them in associated img tags
  $("figure input").each(function(i, obj){
    var url = $(obj).val();
    $(obj).next("img").attr("src", url);
  });
}
function autoSizeInput(event) { // auto adjusts size of user input to fit field
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
function browserCheck() { // warn users of browser incompatability
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
function getSheetOptions() { // check #sheet-main for known data- attributes to set options for sheets
  var options = $("#sheet-main");
  if (options.data("exportable")) {
    $(".export-control").css("display", "list-item");
  }
}

$("#import-sheet").on("click", importCheckFirst);
$("#export-sheet").on("click", exportSheet);
$(".title").on("click", function(){ location.reload(true); });
$("main").on("keyup", 'input[type=text]', autoSizeInput);
window.onbeforeunload = function(){if (dirtyForm) return 'Some changes have not been exported.'};
window.onload = function(){ newSheet("home"); browserCheck(); };
// vim: set fdn=1 :
