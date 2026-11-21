$(document).ready(function(){
    $('#google_translate_element').bind('DOMNodeInserted', function(event) {
        $('.goog-te-menu-value span:first').html('LANGUAGE');
        $('.goog-te-menu-frame.skiptranslate').load(function(){
            setTimeout(function(){
            $('.goog-te-menu-frame.skiptranslate').contents().find('.goog-te-menu2-item-selected .text').html('LANGUAGE');    
            }, 100);
        });
    });
});