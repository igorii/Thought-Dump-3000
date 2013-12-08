// Create a new comment manager
var cm = new CommentManager();

$(function () {
    
    // Show the comment fields when adding a new comment
    $('#comment-content').on('focus', function () {
        cm.showContactFields();
    });

    // Add the form validation
    cm.validateCommentForm();

    // Attach the comment reply handler
    $('.comment-reply-link').on('click', function (e) {
        cm.commentReplyForm(e.target.id);
        $(e.target).off('click');
    });

});
