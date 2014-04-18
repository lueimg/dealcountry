(function($) {
	
	$(document).ready(function() {
		ie_fallback_grid_list();
	});
	
	
	
	function ie_only() {
	  if ( $('.ie7').length || $('.ie8').length ) {
		  
	  }
	}
	
	function ie_fallback_grid_list() {
	  $(document).on('click', '.btn-group.deal-list label', function() {
		  console.log($(this).index());
	  });
	}
	
})(jQuery);;
