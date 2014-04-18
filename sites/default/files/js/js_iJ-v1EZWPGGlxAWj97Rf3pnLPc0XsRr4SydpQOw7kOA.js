(function($) {
	
	$(document).ready(function() {

		ie_only();		
 
	});
	
	
	
	function ie_only() {
	  if ( $('.ie7').length || $('.ie8').length ) {

		  ie_fallback_grid_list();
	  }
	}
	
	function ie_fallback_grid_list() {
	  var view = $('.view-deals-front');	
		

	  view.addClass('option-list');
	  	
	  $('.btn-group.deal-list label:eq(0)').click(function() {
		  view.addClass('option-list').removeClass('ie-grid-list');
	  });
	  
	  $('.btn-group.deal-list label:eq(1)').click(function() {
		  view.removeClass('option-list').addClass('ie-grid-list');
	  });
	} 
	
})(jQuery);;
