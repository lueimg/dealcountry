(function($) {
	
	$(document).ready(function() {
		console.log('ready');
		ie_only();		
		console.log('ready after');
	});
	
	
	
	function ie_only() {
	  if ( $('.ie7').length || $('.ie8').length ) {
		  console.log('ie');
		  ie_fallback_grid_list();
	  }
	}
	
	function ie_fallback_grid_list() {
	  var view = $('.view-deals-front');	
		
		
		console.log('ie function');
	  view.addClass('option-list');
	  	
	  $('.btn-group.deal-list label:eq(0)').click(function() {
		  view.addClass('option-list');
	  });
	  
	  $('.btn-group.deal-list label:eq(1)').click(function() {
		  view.removeClass('option-list');
	  });
	} 
	
})(jQuery);;
