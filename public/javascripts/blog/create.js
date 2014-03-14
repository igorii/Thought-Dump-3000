function main (converter) {
    var $content = $('#edit-markdown');
    var $output  = $('#edit-markdown2');

    $content.on('keyup', function () {
        $output.html(converter.makeHtml($content.val()));
    });
}

$(function () {
    main(new Showdown.converter());
});
