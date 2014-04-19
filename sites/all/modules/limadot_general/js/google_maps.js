(function ($) {
	Drupal.behaviors.limadot_general_location = {
      attach: function() {
		  //var input = (document.getElementById('edit-combine'));
		  $('#edit-combine').removeClass( "ctools-auto-submit-processed" );
		  $('#edit-combine').addClass( "ctools-auto-submit-exclude" );
		  $('#edit-title').removeClass( "ctools-auto-submit-processed" );
		  $('#edit-title').addClass( "ctools-auto-submit-exclude" );
		  /*var mapOptions = {
		    componentRestrictions: {country: ["ca"]},
			types: ['(cities)'],
		  }*/
		  /*var autocomplete = new google.maps.places.Autocomplete(input, mapOptions);
		  google.maps.event.addListener(autocomplete, 'place_changed', function() {
		    var place = autocomplete.getPlace();
			//console.log(place);
			var address = place.address_components;
			//console.log(address);
			var filters = ["country", "administrative_area_level_1", "locality", "route", "postal_code"];
			var data = { "country": "All",  "province": "All", "city": "", "street": "", "postal_code": "" };
			var province = "All";
			$("#edit-country").val(data.country);
			$("#edit-province").val(data.province);
			$("#edit-city").val(data.city);
			$("#edit-street").val(data.street);
			$("#edit-postal-code").val(data.postal_code);
			$.each( address, function( key, value ) {
			  var id = $.inArray(value.types[0], filters);
			  if (id != -1) {
				switch (id) {
	            	case 0:
	                	data.country = value.short_name;
						$("#edit-country").val(value.short_name.toLowerCase());
						$("#edit-province").val(province);
	                    break;
	                case 1:
	                	data.province = value.short_name;
						$("#edit-province").val(value.short_name);
						province = value.short_name;
	                    break;
					case 2:
	                	data.city = value.short_name;
						$("#edit-city").val(value.short_name);
	                    break;
					case 3:
	                	data.street = value.short_name;
						$("#edit-street").val(value.short_name);
	                    break;
					case 4:
	                	data.postal_code = value.short_name;
						$("#edit-postal-code").val(value.short_name);
	                    break;
	          	}
			  }		  
			});
		  $("#edit-submit-deals-front").click();
		  });*/
  	  } 
	}	
	Drupal.behaviors.limadot_general_disable_location = {
	  attach: function (context, settings) {
		$('#edit-combine').keypress(function(event) {			
			if (event.keyCode == 13) {
				//event.preventDefault();
				$('#edit-submit-deals-front').attr('disabled', true);
				if ($('.view-deals-front.view-display-id-page_2').length > 0 && $('#edit-combine').val() != "") {
					$('#edit-title').val($('#edit-combine').val());
					$('#edit-title-1').val("");	
					//inicio				
					var value = $('#edit-combine').val();													  

					  	
					  	crossDomainAjax("http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address="+value, function (data_get)  {
					  						
						var filters = ["country", "administrative_area_level_1", "locality"];
					  	var data = { "country": "All",  "province": "All", "city": "" };
					  	var province = "All";
						$("#edit-country").val(data.country);
						$("#edit-province").val(data.province);
						$("#edit-city").val(data.city);						
					  	if(data_get.status == "OK") {
							var key_locality = -1;							
							$.each( data_get.results, function( key, value ) {
							  	if ($.inArray("locality", value.types) != -1) {
									if(key_locality == -1)
										key_locality = key;
								} 
							});							
						  	if(data_get.results.length > 0 && key_locality != -1) {			  	
								var place = data_get.results[key_locality];
								var address = place.address_components;
								$("#edit-country").val(data.country);
								$("#edit-province").val(data.province);
								$("#edit-city").val(data.city);
								$.each( address, function( key, value ) {
								  var id = $.inArray(value.types[0], filters);
								  if (id != -1) {
									switch (id) {
						            	case 0:
						                	data.country = value.short_name;
											$("#edit-country").val(value.short_name.toLowerCase());
											$("#edit-province").val(province);
						                    break;
						                case 1:
						                	data.province = value.short_name;
											$("#edit-province").val(value.short_name);
											province = value.short_name;
						                    break;
										case 2:
						                	data.city = value.short_name;
											$("#edit-city").val(value.short_name);
						                    break;
						          	}
								  }		  
								});
								//$('#edit-combine').val(place.formatted_address);
							    //$("#edit-submit-deals-front").click();
							} else {
								$('#edit-title-1').val($('#edit-combine').val());
							}
						}
						$('#edit-submit-deals-front').attr('disabled', false);
						$("#edit-submit-deals-front").click(); 
				    
			      });				  			
				//fin 
				} else {
					event.preventDefault();
				}					
			}
		});
	  }
	}
	Drupal.behaviors.limadot_general_redirect_search = {
	  attach: function (context, settings) {
		$('#edit-title-auxiliar').keypress(function(event) {
			if (event.keyCode == 13) {
				$('#edit-title').val($('#edit-title-auxiliar').val());
				$("#edit-submit-deals-front").click();
			}
		});
	  }
	}
	Drupal.behaviors.limadot_general_select_text = {
	  attach: function (context, settings) {
		$('#edit-combine').click(function() {
			$(this).select();
		});
	  }
	}
	/*Drupal.behaviors.limadot_general_enable_popover = {
	  attach: function (context, settings) {
		if ($('.view-deals-front.view-display-id-page').length > 0 || $('.view-deals-front.view-display-id-page_1').length > 0) {
			$("#edit-combine").hover(function(e) {
				e.stopPropagation();
		    	$('#edit-combine').editable('show');
			});
		}
	}}
	Drupal.behaviors.limadot_general_disable_popover = {
	  attach: function (context, settings) {
	  	if ($('.view-deals-front.view-display-id-page').length > 0 || $('.view-deals-front.view-display-id-page_1').length > 0) {
			$("#edit-combine").mouseout(function(e) {
				setTimeout(function(){
					if(!$('.popover').is(':hover')) {
						e.stopPropagation();
	    		 		$('#edit-combine').editable('hide');
					}				
				},2000);	   	
			});
		}
	}}*/
	/*Drupal.behaviors.limadot_general_enable_popover_location = {
	  attach: function (context, settings) {
		if ($('.view-deals-front.view-display-id-page_2').length > 0) {
			$.fn.editable.defaults.mode = 'inline';
			$("#edit-combine").click(function(e) {
				e.stopPropagation();
		    	$('#edit-combine').editable('show');
			});
		}
	}}*/
	/*Drupal.behaviors.limadot_general_enable_popover_2 = {
	  attach: function (context, settings) {
		if ($('.view-deals-front.view-display-id-page_2').length > 0) {
			$("#edit-combine").hover(function(e) {
				e.stopPropagation();
		    	$('#edit-combine').popover('show');
			});
		}
	}}
	Drupal.behaviors.limadot_general_disable_popover_2 = {
	  attach: function (context, settings) {
	  	if ($('.view-deals-front.view-display-id-page_2').length > 0) {
			$("#edit-combine").mouseout(function(e) {
				setTimeout(function(){
					if(!$('.popover').is(':hover')) {
						e.stopPropagation();
	    		 		$('#edit-combine').popover('hide');
					}				
				},2000);	   	
			});
		}
	}}*/
	
	$(document).ready(function () {		
		//$("#edit-sort-bef-combine option[value='created DESC']").attr('data-icon', 'icon-heart');
		var icons = ['<i class="icon fontello icon-fire" aria-hidden="true"></i>', '<i class="icon fontello icon-thumbs-up-alt" aria-hidden="true"></i>', '<i class="icon fontello icon-clock" aria-hidden="true"></i>', '<i class="icon fontello icon-dollar" aria-hidden="true"></i>', '<i class="icon fontello icon-money-1" aria-hidden="true"></i>'];
		/*var icons_local = {'all':'fire', '4': 'garden', '5': 'bicycle', '7': 'school', '8': 'bookmark', '9': 'food', '10': 'plus-circled'};
		var icons_prod = {'all':'fire', '11': 'tags', '12': 'tablet', '13': 'food', '14': 'gamepad', '15': 'garden', '16': 'home', '17': 'link', '18': 'smile', '19': 'plus-circled'};*/
		var icons_local = ['fire', 'garden', 'bicycle', 'school', 'bookmark', 'food', 'plus-circled'];
		var icons_prod = ['fire', 'tags', 'tablet', 'food', 'gamepad', 'garden', 'home', 'link', 'smile', 'plus-circled'];

		$(".form-item-sort-bef-combine .selectpicker li").each(function(index) {
		    var curRel = $(this).attr("rel");
	        ($(this)).children("a").prepend(icons[curRel]);

		});
		$("#views-exposed-form-deals-front-page .form-item-field-deal-categories-tid .selectpicker li").each(function(index) {
		    var curRel = $(this).attr("rel");
			var icon_l = '<i class="icon fontello icon-' + icons_local[curRel] + '" aria-hidden="true"></i> ';
	        ($(this)).children("a").prepend(icon_l);

		});
		$("#views-exposed-form-deals-front-page-1 .form-item-field-deal-categories-tid .selectpicker li").each(function(index) {
		    var curRel = $(this).attr("rel");
			var icon_p = '<i class="icon fontello icon-' + icons_prod[curRel] + '" aria-hidden="true"></i> ';
	        ($(this)).children("a").prepend(icon_p);
		});
		
		$("button[title = 'MOST RECENT']").children("span.filter-option").prepend(icons[0]);
		$("button[title = 'MOST BOUGHT']").children("span.filter-option").prepend(icons[1]);
		$("button[title = 'ENDING SOON']").children("span.filter-option").prepend(icons[2]);
		$("button[title = 'PRICE']").children("span.filter-option").prepend(icons[3]);
		$("button[title = 'DISCOUNT']").children("span.filter-option").prepend(icons[4]);
		
		if ($('.view-deals-front.view-display-id-page .view-content').find("img").length > 0) {
			$('.view-deals-front.view-display-id-page .view-content').hide();
			$('.view-deals-front.view-display-id-page .item-list').hide();
			$('#LoadingDeals').show();
			$('.view-deals-front.view-display-id-page .view-content').imagesLoaded(function() {		  		  
			  setTimeout(function() {
				$('#LoadingDeals').hide();
				$('.view-deals-front.view-display-id-page .view-content').show();
				$('.view-deals-front.view-display-id-page .view-content').masonry('reload');
			  	$('.view-deals-front.view-display-id-page .item-list').show();
			  }, 1500);
			});
		}
		
		if ($('.view-deals-front.view-display-id-page_1 .view-content').find("img").length > 0) {
			$('.view-deals-front.view-display-id-page_1 .view-content').hide();
			$('.view-deals-front.view-display-id-page_1 .item-list').hide();
			$('#LoadingDeals').show();
			$('.view-deals-front.view-display-id-page_1 .view-content').imagesLoaded(function() {		  		  
			  setTimeout(function() {
				$('#LoadingDeals').hide();
				$('.view-deals-front.view-display-id-page_1 .view-content').show();
				$('.view-deals-front.view-display-id-page_1 .view-content').masonry('reload');
			  	$('.view-deals-front.view-display-id-page_1 .item-list').show();
			  }, 1500);
			});
		}
		
		if ($('.view-deals-front.view-display-id-page_2 .view-content').find("img").length > 0) {
			$('.view-deals-front.view-display-id-page_2 .view-content').hide();
			$('.view-deals-front.view-display-id-page_2 .item-list').hide();
			$('#LoadingDeals').show();
			$('.view-deals-front.view-display-id-page_2 .view-content').imagesLoaded(function() {		  		  
			  setTimeout(function() {
				$('#LoadingDeals').hide();
				$('.view-deals-front.view-display-id-page_2 .view-content').show();
				$('.view-deals-front.view-display-id-page_2 .view-content').masonry('reload');
			  	$('.view-deals-front.view-display-id-page_2 .item-list').show();
			  }, 1500);
			});			
		}

		$(document).on('click', '.canada', function(){
		    var value = $(this).attr('id');
			$("#edit-country").val(urls_canada[value].filter_country.toLowerCase());
			$("#edit-city").val(urls_canada[value].filter_city);			
			$("#edit-combine").val(urls_canada[value].filter_city + ' ' + urls_canada[value].filter_province + ', Canada');
			$("#edit-street").val("");
			$("#edit-postal-code").val("");
			$("#edit-province").val(urls_canada[value].filter_province);
			$("#edit-submit-deals-front").click();
		});
		
		$(document).on('click', '.usa', function(){
		    var value = $(this).attr('id');
			$("#edit-country").val(urls_usa[value].filter_country.toLowerCase());
			$("#edit-city").val(urls_usa[value].filter_city);			
			$("#edit-combine").val(urls_usa[value].filter_city + ' ' + urls_usa[value].filter_province + ', United States');
			$("#edit-street").val("");
			$("#edit-postal-code").val("");
			$("#edit-province").val(urls_usa[value].filter_province);
			$("#edit-submit-deals-front").click();
		});
		
		$('#edit-submit-deals-front-auxiliar').click(function() {
			$('#edit-title').val($('#edit-title-auxiliar').val());
			$("#edit-submit-deals-front").click();
		});

	});
	
	function crossDomainAjax (url, successCallback) {

    // IE8 & 9 only Cross domain JSON GET request
    if ('XDomainRequest' in window && window.XDomainRequest !== null) {

        var xdr = new XDomainRequest(); // Use Microsoft XDR
        xdr.open('get', url);
        xdr.onload = function () {
            var dom  = new ActiveXObject('Microsoft.XMLDOM'),
                JSON = $.parseJSON(xdr.responseText);

            dom.async = false;

            if (JSON == null || typeof (JSON) == 'undefined') {
                JSON = $.parseJSON(data.firstChild.textContent);
            }

            successCallback(JSON); // internal function
        };

        xdr.onerror = function() {
            _result = false;  
        };

        xdr.send();
    } 

    // IE7 and lower can't do cross domain
    else if (navigator.userAgent.indexOf('MSIE') != -1 &&
             parseInt(navigator.userAgent.match(/MSIE ([\d.]+)/)[1], 10) < 8) {
       return false;
    }    

    // Do normal jQuery AJAX for everything else          
    else {
        $.ajax({
            url: url,
            cache: false,
            dataType: 'json',
            type: 'GET',
            async: false, // must be set to false
            success: function (data, success) {
                successCallback(data);
            }
        });
    }
}
	
	//$.fn.editable.defaults.mode = 'popup';
	//Drupal.behaviors.limadot_general_popover_editable = {
      //attach: function() {
      $(document).ready(function () {
		  if ($('.view-deals-front.view-display-id-page').length > 0 || $('.view-deals-front.view-display-id-page_1').length > 0) {
		  	$("#edit-combine").prop("readonly", true);

			$('#edit-combine').editable({
				type: 'typeaheadjs',
				pk: 1,
				placement: 'bottom',
				toggle: 'click',
				title: 'Enter your city, postal code or address',
		        typeahead: {
		            name: 'location',
					highlight: true,			
		            prefetch: '/sites/all/modules/limadot_general/js/data.json',	        
		        },
				validate: function(value) {
				   if($.trim(value) == '')
				  	return 'Enter a valid location';				  
				  
				  var filters = ["country", "administrative_area_level_1", "locality", "route", "postal_code", "postal_code_prefix"];
				  var data = { "country": "All",  "province": "All", "city": "", "street": "", "postal_code": "" };
				  var province = "All";
				  $.support.cors = true;

				  crossDomainAjax("http://maps.googleapis.com/maps/api/geocode/json?sensor=false&components=country:CA&address="+value, function (data_get)  {					  						  	
					  	if(data_get.status == "OK") {
							var key_locality = -1;
							
							$.each( data_get.results, function( key, value ) {
							  	if ($.inArray("locality", value.types) != -1 || $.inArray("route", value.types) != -1 || $.inArray("postal_code", value.types) != -1 || $.inArray("postal_code_prefix", value.types) != -1) {
									if(key_locality == -1)
										key_locality = key;
								} else {
									return "Location not found - please try another";	
								}
							});
							
						  	if(data_get.results.length > 0 && key_locality != -1) {												  	

								var place = data_get.results[key_locality];
								var address = place.address_components;
								$("#edit-country").val(data.country);
								$("#edit-province").val(data.province);
								$("#edit-city").val(data.city);
								$("#edit-street").val(data.street);
								$("#edit-postal-code").val(data.postal_code);
								$.each( address, function( key, value ) {
								  var id = $.inArray(value.types[0], filters);
								  if (id != -1) {
									switch (id) {
						            	case 0:
						                	data.country = value.short_name;
											$("#edit-country").val(value.short_name.toLowerCase());
											$("#edit-province").val(province);
						                    break;
						                case 1:
						                	data.province = value.short_name;
											$("#edit-province").val(value.short_name);
											province = value.short_name;
						                    break;
										case 2:
						                	data.city = value.short_name;
											$("#edit-city").val(value.short_name);
						                    break;
										case 3:
						                	data.street = value.short_name;
											$("#edit-street").val(value.short_name);
						                    break;
										case 4:
										//case 5:
						                	data.postal_code = value.short_name;
											$("#edit-postal-code").val(value.short_name);
						                    break;
						          	}
								  }		  
								});
								$('#edit-combine').val(place.formatted_address);
							    $("#edit-submit-deals-front").click();
							} else {
								
								$.support.cors = true;

								crossDomainAjax("http://maps.googleapis.com/maps/api/geocode/json?sensor=false&components=country:US&address="+value, function (data_get)  {								  	
								  	if(data_get.status == "OK") {
										var key_locality = -1;
										
										$.each( data_get.results, function( key, value ) {
										  	if ($.inArray("locality", value.types) != -1 || $.inArray("route", value.types) != -1 || $.inArray("postal_code", value.types) != -1 || $.inArray("postal_code_prefix", value.types) != -1) {
												if(key_locality == -1)
													key_locality = key;
											} else {
												return "Location not found - please try another";	
											}
										});
										
									  	if(data_get.results.length > 0 && key_locality != -1) {
			
											var place = data_get.results[key_locality];
											var address = place.address_components;											
											$("#edit-country").val(data.country);
											$("#edit-province").val(data.province);
											$("#edit-city").val(data.city);
											$("#edit-street").val(data.street);
											$("#edit-postal-code").val(data.postal_code);
											$.each( address, function( key, value ) {
											  var id = $.inArray(value.types[0], filters);
											  if (id != -1) {
												switch (id) {
									            	case 0:
									                	data.country = value.short_name;
														$("#edit-country").val(value.short_name.toLowerCase());
														$("#edit-province").val(province);
									                    break;
									                case 1:
									                	data.province = value.short_name;
														$("#edit-province").val(value.short_name);
														province = value.short_name;
									                    break;
													case 2:
									                	data.city = value.short_name;
														$("#edit-city").val(value.short_name);
									                    break;
													case 3:
									                	data.street = value.short_name;
														$("#edit-street").val(value.short_name);
									                    break;
													case 4:
													case 5:
									                	data.postal_code = value.short_name;
														$("#edit-postal-code").val(value.short_name);
									                    break;
									          	}
											  }		  
											});
											$('#edit-combine').val(place.formatted_address);
										    $("#edit-submit-deals-front").click();
										} else {
											return 'Location not found - please try another';
										}
									} else {
										 return "Location not found - please try another";
									}	
							    
						      });							
							}
						} else {
							 return "Location not found - please try another";
						}	
				    
			      }); 						   
			    },
				success: function(response, newValue) {					
			    },				
		    });			
		  }
		});
	
	var urls_canada = [ {"filter_country": "ca", "filter_province": "ON", "filter_city": "Toronto"}, {"filter_country": "ca", "filter_province": "BC", "filter_city": "Vancouver"}, {"filter_country": "ca", "filter_province": "ON", "filter_city": "Niagara Falls"}, {"filter_country": "ca", "filter_province": "QC", "filter_city": "Montreal"}, {"filter_country": "ca", "filter_province": "NS", "filter_city": "Halifax"}, {"filter_country": "ca", "filter_province": "AB", "filter_city": "Calgary"}, {"filter_country": "ca", "filter_province": "ON", "filter_city": "Ottawa"} ];
	var urls_usa = [ {"filter_country": "us", "filter_province": "IL", "filter_city": "Chicago"}, {"filter_country": "us", "filter_province": "NY", "filter_city": "New York"}, {"filter_country": "us", "filter_province": "CA", "filter_city": "Los Angeles"}, {"filter_country": "us", "filter_province": "NV", "filter_city": "Las Vegas"}, {"filter_country": "us", "filter_province": "FL", "filter_city": "Miami"}, {"filter_country": "us", "filter_province": "CA", "filter_city": "San Francisco"}, {"filter_country": "us", "filter_province": "WV", "filter_city": "Washington DC"} ];
		
	Drupal.behaviors.limadot_general_popover = {
      attach: function() {
	  	if ($('.view-deals-front.view-display-id-page_2').length > 0) {
	  		$('#edit-combine').popover({
				html: true,
				placement: 'right',
				trigger: 'focus',
				title: 'Popular Destination', 
				content: function() {
			      return $('#popover-cities').html();
			    }
			})
			/*.blur(function () {
				$(this).popover('hide');
			});
			.click(function() {				
				/*if ($(this).val() != "")
					$(this).popover('hide');	 
			});*/  
		}
	  }
	}	

	Drupal.behaviors.limadot_general_select_city_canada = {
	  attach: function () {
		$('a.canada').click(function() {
			var value = $(this).attr('id');
			$("#edit-country").val(urls_canada[value].filter_country.toLowerCase());
			$("#edit-city").val(urls_canada[value].filter_city);
			$("#edit-province").val(urls_canada[value].filter_province);
			$("#edit-combine").val(urls_canada[value].filter_city + ' ' + urls_canada[value].filter_province + ', Canada');
			$("#edit-street").val("");
			$("#edit-postal-code").val("");
			$("#edit-submit-deals-front").click();
		});
	  }
	}
	
	Drupal.behaviors.limadot_general_select_city_usa = {
	  attach: function () {
		$('a.usa').click(function() {
			var value = $(this).attr('id');
			$("#edit-country").val(urls_usa[value].filter_country.toLowerCase());
			$("#edit-city").val(urls_usa[value].filter_city);
			$("#edit-province").val(urls_usa[value].filter_province);
			$("#edit-combine").val(urls_usa[value].filter_city + ' ' + urls_usa[value].filter_province + ', United States');
			$("#edit-submit-deals-front").click();
		});
	  }
	}		
})(jQuery);