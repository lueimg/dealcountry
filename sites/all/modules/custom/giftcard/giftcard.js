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


	
	
	jQuery(".page-admin-giftcard-orders-edit .form-type-textfield").keyup(function(){
		//FINAL CHARGE EN page-admin-giftcard-orders-edit
	var charge = jQuery(".page-admin-giftcard-orders-edit [name=charge]").val() * 1;
	var ship = jQuery(".page-admin-giftcard-orders-edit #edit-shipping").val() * 1;
	var tax = jQuery(".page-admin-giftcard-orders-edit #edit-taxes").val() * 1;
	var extra = jQuery(".page-admin-giftcard-orders-edit #edit-extra").val() * 1;
 	var total  = charge + ship + tax + extra ;
 	
	jQuery("#chargetotal #amount").text(total.toFixed(2));
	//console.log("calulando ...")

	});

});


//FUNCIONES DE PAGINA ORDER 
jQuery().ready(function(){

	//ESCONDER CAMPO GIFTCARD
	jQuery(".page-giftcard-order #edit-giftcard")
    .parent()
    .hide();

    jQuery(".page-giftcard-order .form-item-combine")
    .hide()



    //VALIDANDO LUEGO DEL SUBMIT
    var select = jQuery(".page-giftcard-order #edit-codefull").val();
    var combine = jQuery(".page-giftcard-order .form-item-combine");


    if(select == "new"){
    	//MUESTRA ELCAMPO NEWGIFTCARD
    	jQuery(".page-giftcard-order #edit-giftcard")
	    .parent()
	    .show();
	    //OCULTA EL CAMPO COMBINE
        combine.hide();

    }else if(select == "combine"){

        jQuery("#edit-giftcard")
        .val('')
        .parent()
        .hide();

        combine.show();
    	jQuery("#edit-codefull").trigger("change");


    }else{

    	jQuery("#edit-codefull").trigger("change");
        combine.hide();

    }

    jQuery(".page-giftcard-order #edit-codefull")
    .change(function(){ 
    	var el = jQuery(this); 
    	var combine = jQuery(".page-giftcard-order .form-item-combine");

      if(el.val() == 'new'){
        jQuery("#edit-giftcard")
        .val('')
        .parent()
        .show('slow');

        combine.hide();

      }else if(el.val() == "combine"){
        jQuery("#edit-giftcard")
        .val('')
        .parent()
        .hide();

        combine.show("slow");


      }else{
        jQuery("#edit-giftcard")
        .val('')
        .parent()
        .hide('slow');
        combine.hide();


      }
    });
    

  });