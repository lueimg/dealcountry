(function ($) {
	$(document).ready(function() {
		/*if($('.view-deals-front').length > 0) {
			$(".view-deals-front").addClass("option-list");
		}*/


	   //  	$('.social-tooltip').tooltip();	    
	   //  	$('.node-type-deal .group-deal-map .panel-title').text('About ' + $('.node-type-deal .group-deal-map .views-field-field-address span.fn').text());	    
		  //   $('#edit-sort-bef-combine').selectpicker();
		  //   $('#edit-field-deal-categories-tid').selectpicker();
				// limadot_asign_list("list");			



		$(':input[placeholder]').placeholder({color: '#AEA7B9'});
		if($('.social-tooltip').length > 0) {	
	    	$('.social-tooltip').tooltip();	    
		}
		
		if($('.node-type-deal .group-deal-map .panel-title').length > 0 && $('.node-type-deal .group-deal-map .views-field-field-address span.fn').length > 0) {	
	    	$('.node-type-deal .group-deal-map .panel-title').text('About ' + $('.node-type-deal .group-deal-map .views-field-field-address span.fn').text());	    
		}
		if($('#edit-sort-bef-combine').length > 0) {	
		    $('#edit-sort-bef-combine').selectpicker();
		     jQuery("[id^='edit-sort-bef-combine']").selectpicker();
		}
		if($('#edit-field-deal-categories-tid').length > 0) {	
		    $('#edit-field-deal-categories-tid').selectpicker();
		     jQuery("[id^='edit-field-deal-categories-tid']").selectpicker();
		}
		$('input:radio[name="options-deals"]').change(
		    function(){		
	            limadot_asign_list($(this).val());	            	
		});	
		if ($('.view-deals-front.view-display-id-page').length > 0 || $('.view-deals-front.view-display-id-page_1').length > 0) {
			if(Drupal.settings.limadot_general.option_list_selected == "grid") {
				limadot_asign_list("grid");	
			} else {
				limadot_asign_list("list");			
			}		
		}
		
		if ($('.view-deals-front.view-display-id-page_2').length > 0) {
			limadot_asign_list("grid");
		}
	});

// 	Drupal.behaviors.reloadFormExpose = {
// 		  attach: function (context, settings) {
// 		    //jQuery('.view-deals-front.view-display-id-page .view-content').masonry('reload');
// 		    jQuery('.social-tooltip').tooltip();	    
// 	    	jQuery('.node-type-deal .group-deal-map .panel-title').text('About ' + jQuery('.node-type-deal .group-deal-map .views-field-field-address span.fn').text());	    
// 		    jQuery('#edit-sort-bef-combine').selectpicker();
// 		    jQuery("[id^='edit-sort-bef-combine']").selectpicker();
// 		    jQuery('#edit-field-deal-categories-tid').selectpicker();
// 		    jQuery("[id^='edit-field-deal-categories-tid']").selectpicker();
		    
// 				limadot_asign_list("list");		

// 		  }
// };
	
	Drupal.behaviors.limadot_reload_colorbox = {
		attach : function(context, settings) {
			if($('#colorbox .webform-confirmation').length > 0) {
				$.colorbox.resize();
			}
		}
	}
	
	Drupal.behaviors.limadot_reload_masonry = {
		attach : function(context, settings) {
			$(window).bind("resize", function() {
				if ($('.view-deals-front').length > 0) {
					$('.view-deals-front .view-content').masonry('reload');
				}
			});
		}
	}
	
	function limadot_asign_list(type) {
		if(type == "grid") {
			$(".view-deals-front").removeClass("option-list");
			$(".region-content").parent().removeClass("col-sm-9");
			$(".region-content").parent().addClass("col-sm-12");
			$(".region-sidebar-second").parent().hide();
			$('.view-deals-front .view-content').masonry('reload');
			$('.view-most-popular-deals .view-content').masonry('reload');
			$('input#option-grid').parent().addClass('active');
			$('input#option-list').parent().removeClass('active');
			/*$("#page-header").append($(".col-sm-3.mini").html());
			$(".col-sm-3.mini").empty();*/
			$(".region-sidebar-second-top").prependTo($("#page-header"));
			Drupal.settings.limadot_general.option_list_selected = "grid";
			window.listado = "grid";
		} else {
			$(".view-deals-front").addClass("option-list");
			$(".region-content").parent().removeClass("col-sm-12");
			$(".region-content").parent().addClass("col-sm-9");
			$(".region-sidebar-second").parent().show();
			$('.view-deals-front .view-content').masonry('reload');
			$('.view-most-popular-deals .view-content').masonry('reload');
			$('input#option-list').parent().addClass('active');
			$('input#option-grid').parent().removeClass('active');
			/*$(".col-sm-3.mini").append($("#page-header").html());
			$("#page-header").empty();*/
			$(".region-sidebar-second-top").prependTo($(".col-sm-3.mini"));
			Drupal.settings.limadot_general.option_list_selected = "list";
			window.listado = "list";

		}
	}
	
})(jQuery);