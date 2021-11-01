(function($) {
    "use strict";

    $('.image-modal').each(function () {
        $(this).attr("title", $(this).attr("alt"))
    })
    $('.image-modal').click(function () {
        $('#image-modal img').attr("src",$(this).attr("src"));
        $('#image-modal').modal('show')
    });

    // Preloader
    if ($('.loading-main').length > 0) {
        $(window).on('load', function() {
            $('.loading-main').fadeOut();
            $('.pre-loader').delay(350).fadeOut("slow", 0.0);
            $('body').css({
                'overflow-y': 'scroll'
            });
        });
    }
    // Responsive menu
    $('.slimmenu').slimmenu({
        resizeWidth: '992',
        collapserTitle: '',
        animSpeed: 'fast',
        easingEffect: null,
        indentChildren: true,
    });
    
    // Parallax Window
    
    if ($('.parallax-window').length > 0) {
    $('.parallax-window').parallax({
        naturalWidth: 600,
        naturalHeight: 400
      });
    }
    // Wow Animation
     var wow = new WOW(
        {
        boxClass:     'wow',      // default
        animateClass: 'animated', // default
        offset:       10,          // default
        mobile:       true,       // default
        live:         true        // default
      }
      )
      wow.init();
    // Video Modal
    if ($('.popup-youtube, .popup-vimeo, .popup-gmaps').length > 0) {
        $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
            disableOn: 0,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: true,
        });
    }
    // File Upload
    $(".form-action").on("change", ".file-upload-field", function(){ 
        $(this).parent(".file-upload").attr("data-text",         $(this).val().replace(/.*(\/|\\)/, '') );
    });
    // timeline animation


    var items = document.querySelectorAll(".timeline li");

    function isElementInViewport(el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  
    function callbackFunc() {
      for (var i = 0; i < items.length; i++) {
        if (isElementInViewport(items[i])) {
          items[i].classList.add("in-view");
        }
      }
    }
    window.addEventListener("load", callbackFunc);
    window.addEventListener("resize", callbackFunc);
    window.addEventListener("scroll", callbackFunc);

    // Home Top
    var offset = 10,
        offset_opacity = 1200,
        scroll_top_duration = 1000,
        $back_to_top = $('.home-top');
        $back_to_top.on('click', function(event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0,
        }, scroll_top_duration);


    });


    // search 
    // var sjs = SimpleJekyllSearch({
    //     searchInput: document.getElementById('search-input'),
    //     resultsContainer: document.getElementById('results-container'),
    //     json: '/search.json'
    // });

    
    $(".menu-heading .btn").on("click",function(){
       $(this).next("div").toggleClass("active");
    });

    $(".subitem .subitem-show").on("click",function(event){
        event.preventDefault();
        $(this).parent().toggleClass("display-dropdown");
    });

    
    
  // Sticky Sidebar	
	
	
	
})(jQuery);
	