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
    $('.comment-form').validate({
        rules : {
            'email' : {
                required : true,
                email : true
            },
            'name': {
                required : true
            }
        },
        messages : {
            email : {
                required : 'This field is required. This will not be made public.'
            }
        },
        submitHandler : function (form) {
            $(form).ajaxSubmit();
        }
    });
};

/**
 * Create a new comment reply form.
 */
CommentManager.prototype.commentReplyForm = function (parentID) {
    var $comment = $('<div>')
        .addClass('article-comment')
        .addClass('leave-comment');

    var $form = $('<form>', {
        action: '/blog/commentreply/' + parentID,
        method: 'POST'
    })
    .attr('id',    'comment-reply-' + parentID)
    .attr('class', 'comment-form');

    // Article ID
    var pathToks  = window.location.pathname.split('/');
    var articleID = pathToks[pathToks.length - 1]; 
    $form.append('<input type="hidden" name="_id" value="' + articleID + '"></input>');

    // Parent comment ID
    $form.append('<input type="hidden" name="parent_id" value="' + parentID + '"></input>');
    
    // Content input
    $form.append($('<textarea>', {
        class: 'comment-content',
        placeholder: 'Enter your reply here...',
        name: 'content'
    }));

    // Name input
    $form.append($('<input>', {
        type: 'text',
        placeholder: 'Name (required)',
        name: 'name',
        class: 'comment-full'
    }));
    
    $form.append('<br>');

    // Email input
    $form.append($('<input>', {
        type: 'text',
        placeholder: 'Email (required)',
        name: 'email',
        class: 'comment-full'
    }));
    
    $form.append('<br>');

    // Email input
    $form.append($('<input>', {
        type: 'checkbox',
        name: 'notify',
    }));

    $form.append('<span style="font-size:12px">Notify me of replies</span>');
    
    $form.append('<br>');
    $form.append('<br>');
    
    // Submit
    $form.append($('<input>', {
        type: 'submit',
        name: 'submit'
    }));

    // Add the form to the comment
    $form.appendTo($comment);

    // Insert the form below the parent
    $('#' + parentID).after($comment);

    this.validateCommentForm();
};
