var tags=new Array();

$( document ).ready(function() {
$dynamic = $(".dynamic");

$(document).on({
    ajaxStart: function() { $dynamic.addClass("loader");    },
     ajaxStop: function() { $dynamic.removeClass("loader"); }
});
$.ajax({url: "https://api.stackexchange.com/2.2/users/138604/top-answer-tags?site=stackoverflow", success: function(result){
        var tagsFroSO=eval(result);


      for(var i=0;i<tagsFroSO.items.length;i++){
          var strTag=new String(tagsFroSO.items[i].tag_name);

          var matched=strTag.match(/^javascript$|^java$|^xml$|^json$|^jquery$|^java-ee$|^jsp$|^php$|^vim$|^python$|^c$|^c\+\+$/i);
          if(matched != null) {


          tags.push(matched);
          //$('#sotags').html="test";
          //$('#sotags').append=" appended";
         $('#sotags').append('<a href="https://stackoverflow.com/search?tab=votes&q=user%3a138604%20%5b'+matched+'%5d" tabindex="0" class="btn btn-sm btn btn-default btn-square" role="button" data-toggle="popover" data-trigger="focus" title="Please visit below link for my Stack Overflow contribution for '+matched+'" data-content="">'+matched+'</a>');

        }
      }
    var options = {
    placement: function (context, source) {
        var position = $(source).position();

        if (position.left > 515) {
            return "left";
        }

        if (position.left < 515) {
            return "right";
        }

        if (position.top < 110){
            return "bottom";
        }

        return "top";
    }
    , trigger: "focus"
};

 //   $("[data-toggle=popover]").popover(options);
    }});

});