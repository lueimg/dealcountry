jQuery().ready(function(){
	//OCULTAR UN TAB DE LA PANTALLA USER 
	jQuery('a[href$=hybridauth]').hide();
	jQuery(".userregister .hybridauth-widget-wrapper").appendTo(jQuery(".userregister")).css("text-align","left");
	//HTML DE PURCHASES , SE QUITA EL HTML NO NECESARIO
	jQuery(".purchase.html .group-info-footer div:nth-child(3)").remove()


	var value = jQuery(".page-myaccount-addfunds #edit-code").val();
	if(value == 'new'){
			jQuery(".page-myaccount-addfunds .form-item-newcode").show();
		}else{
			jQuery(".page-myaccount-addfunds .form-item-newcode").hide();
		}

	jQuery(".page-myaccount-addfunds #edit-code").change(function(){
		var value = jQuery(this).val();
		if(value == 'new'){
			jQuery(".page-myaccount-addfunds .form-item-newcode").show("slow");
		}else{
			jQuery(".page-myaccount-addfunds .form-item-newcode").hide("slow");
		}
	});

});