// https://github.com/marioizquierdo/jquery.serializeJSON/issues/32#issuecomment-71833934
var dirtyForm=false;
window.onbeforeunload = function(e){
  if(dirtyForm)
    return 'Some changes have not been exported. Are you sure you want to exit?';
};
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
    dirtyForm=false;
  });
}
function newSheet(sheetName, sheetData) {
  $("#sheet-css")[0].href = "sheets/" + sheetName + "/sheet.css";
  $("#sheet-html").load( "sheets/" + sheetName + "/sheet.html", function() {
   if (sheetData) {
      $("#sheet").deserializeJSON(sheetData);
      document.title = $("#filename").val();
   };
   dirtyForm=false;
   //super simple change event on every form input
   $("form :input").change(function() {
     dirtyForm=true;
   });
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



$("#import-sheet").on("click", importCheckFirst);
$("#export-sheet").on("click", exportSheet);
$(".title").on("click", titleDataCheck);
window.onload = newSheet("default");
