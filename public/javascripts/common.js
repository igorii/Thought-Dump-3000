/**
 * Common functions between pages
 */

var Common = {
    addRedirectButton: function (id, location) {
        $(id).click(function () {
            window.location = location;
        });
    }
}

