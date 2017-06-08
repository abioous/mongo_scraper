var templates = {};


function addEventHandlers() {

	$('.removeButton').click(function() {
		var id = $(this).attr('data-id')
		var url = '/api/articles/' + id + '?_method=delete'
		console.log('deleting' + url)
		$.post(url, function(data) {
				console.log(data);
		});
	});

}

$( document ).ready(function() {




//load handlebars template to be process on client side
$.get('/template/articles.handlebars', function(source) {
    templates['articles'] = Handlebars.compile(source);
});


addEventHandlers() 


}) 