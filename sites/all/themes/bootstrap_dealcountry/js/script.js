(function($) {
	
	$(document).ready(function() {

		ie_only();		

     //Estilos boton load more
     $(".pager-load-more li").addClass("btn btn-primary");
     $('.btn-group.deal-list label').removeClass("active");
		// REORDENAR AL HACER CLICK
		$(".pager-load-more a").click(function(){
		
			//setInterval(		actualizarListado			,1000); 


		});


 
	});
	Drupal.behaviors.reloadMasonry = {
  attach: function (context, settings) {
    //jQuery('.view-deals-front.view-display-id-page .view-content').masonry('reload');
    $(".pager-load-more li").addClass("btn btn-primary");
    	var tipo_listado = window.listado;
    	//debugger;
		if( tipo_listado == "list" ){
				$('.btn-group.deal-list label:eq(0)').trigger("click");
				console.log("listado");
			}else{
				$('.btn-group.deal-list label:eq(1)').trigger("click");
				console.log("grid");
			}

    console.log("masonry reload 2");
  }
};
	function actualizarListado(){

    $(".pager-load-more li").addClass("btn btn-primary");
		if( $(".view-deals-front").hasClass("option-list") ){
				$('.btn-group.deal-list label:eq(0)').trigger("click");
				//console.log("listado");
			}else{
				$('.btn-group.deal-list label:eq(1)').trigger("click");
				//console.log("grid");
			}

	}
	
	function ie_only() {
	  if ( $('.ie7').length || $('.ie8').length ) {
		  page_deals();
		  page_node_type_deal();
	  }
	}
	
	function page_deals() {
	  if ($('.page-deals').length) {
		  ie_fallback_grid_list();
	  }
	}
	
	function page_node_type_deal() {
	  if ($('.node-type-deal').length) {
		  $('.view-deals-front').addClass('ie-grid-list');
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
	
})(jQuery);