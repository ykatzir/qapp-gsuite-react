function executeSearch(query, callback, failure) {
    let element = arguments[3],
        argument = arguments[4],
        title = arguments[5],
        colors = arguments[6];

    $.ajax({
        url: "api/search",
        type: "POST",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ query: query })
    }).done(function(data) {
        callback(data.events, element, argument, title, colors);
    }).fail(function(err) {
        failure(element);
    })
}