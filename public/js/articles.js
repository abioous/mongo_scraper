var templates = {};


function addEventHandlers() {


	//handle article removal
	$('.removeButton').click(function() {
		var id = $(this).attr('data-id')
		var url = '/api/articles/' + id + '?_method=delete'
		$.post(url, {}, function(data) {
				location.reload();
	
		});
	});


	$('.addCommentdButton').click(function(){
		var id = $(this).attr('data-id')
		var comment = $('#comment-' + id);
		var url = '/api/articles/' + id + '/comment'

		$.post(url, {
				'comment':comment.val(),
			}, function(data) {
				window.location= '/articles'

		});

	})


	$('.removeCommentButton').click(function() {
		var id = $(this).attr('data-id')
		var url = '/api/comment/' + id + '?_method=delete'
		$.post(url, {}, function(data) {
				window.location= '/articles'
		});
	})


	$('#scrapteButton').click(function() {
		//load handlebars template to be process on client side
		$.get('/api/scrape', function(info) {
 			window.location= '/articles?n='+info.added;
 		})

	})
}


$( document ).ready(function() {
	addEventHandlers() 

}) 