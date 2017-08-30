var Images = {};

Images.setup = function () {
    "use strict";
    //--- adds hover effect for the brand logo ---//
    $(".navbar-brand").hover(
    	//--- on hover in ---//
        function (event) {
            $(event.currentTarget).find("img").attr("src", "../eva/img/hfu_logo_darkgray.png");
        },
        //--- on hover out ---//
        function (event) {
            $(event.currentTarget).find("img").attr("src", "../eva/img/hfu_logo_gray.png");
        }
    );
};
