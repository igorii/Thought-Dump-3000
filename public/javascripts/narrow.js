var narrowComponents = ['#recent-articles'];

function isTooNarrow () {
    return $(window).width() < 1320;
}

function hideComponents (els) { 
    els.forEach(function (el) {
        $(el).addClass('narrow');
    });
}

function showComponents (els) {
    els.forEach(function (el) {
        $(el).removeClass('narrow');
    });
}

function handleSize () {
    if (isTooNarrow()) hideComponents(narrowComponents);
    else showComponents(narrowComponents);
}

$(handleSize);
$(window).on('resize', handleSize);
