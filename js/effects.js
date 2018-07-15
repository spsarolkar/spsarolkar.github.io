$body = $("body");

$(document).on({
    ajaxStart: function() { $body.addClass("loading-animation");    },
     ajaxStop: function() { $body.removeClass("loading-animation"); }
});