function CommentManager() {}

/**
 * Show the name, email, and submit button.
 */
CommentManager.prototype.showContactFields = function () {
    $('.comment-field').show();
};

/**
 * Comment form validation.
 */
CommentManager.prototype.validateCommentForm = function () {
    $('#comment-form').validate({
        rules: {
            'email': {
                required   : true,
                email      : true
            },
            'name': {
                required  : true
            }
        },
        submitHandler: function (form) {
            $(form).ajaxSubmit();
        }
    });
};
