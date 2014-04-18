<?php
function theme_limadot_general_custom_search_form($variables) {
	$form = $variables['form'];
	//dpm($form);
	//$form["sort_bef_combine"]["#options"]["field_deal_price_value_value ASC"] = theme('icon', array('bundle' => 'fontello_pack_01', 'icon' => 'icon-dollar'))." ".t("PRICE");
	//$form["sort_bef_combine"]["#options"]["field_deal_price_value_value ASC"]['#attributes'] = array('class' => array('glyphicon-eye-open'));
	$output = "";
	/*$form["combine"]["#prefix"] = '<div class="views-widget-filter-combine-custom"><label for="edit-combine">'.theme('icon', array('bundle' => 'fontello_pack_01', 'icon' => 'icon-location')).' Location</label>';
	$form["combine"]["#suffix"] = '</div>';*/
	$form["combine"]["#prefix"] = '<div class="views-widget-filter-combine-custom"><label for="edit-combine">Location</label>';
	$form["combine"]["#suffix"] = '</div>';
	$form["submit"]["#value"] = '<i class="icon glyphicon glyphicon-search" aria-hidden="true"></i>';
	$form["submit"]["#prefix"] = '<span class="input-group-btn">';
	$form["submit"]["#suffix"] = '</span>';
	$form["field_deal_categories_tid"]["#title"] = t("Category");	
	//$output .= '<div class="row-fluid"><div class="container">'.drupal_render($form["field_deal_categories_tid"]).'</div></div>'; //Este era para el tipo links
	$output .= '<div class="container form-deals">'.drupal_render($form["combine"]).drupal_render($form["sort_bef_combine"]).drupal_render($form["field_deal_categories_tid"]).'<div class="btn-group search not-display">'.drupal_render($form["title"]).drupal_render($form["submit"]).'</div>';
	$output .= '<div data-toggle="buttons" class="btn-group deal-list"><label class="btn btn-primary"><input type="radio" value="list" id="option-list" name="options-deals" class="ctools-auto-submit-exclude"> <i aria-hidden="true" class="icon fontello icon-menu"></i> LIST</label><label class="btn btn-primary active"><input type="radio" value="grid" id="option-grid" name="options-deals" class="ctools-auto-submit-exclude"> <i aria-hidden="true" class="icon fontello icon-th"></i> GRID  </label></div>';
	$output .= "</div>";	
	unset($form["field_deal_categories_tid"]);
	unset($form["combine"]);
	unset($form["sort_bef_combine"]);
	unset($form["title"]);
	unset($form["submit"]);
	return $output . drupal_render_children($form);
}

function theme_limadot_general_custom_search_getaways_form($variables) {
	$form = $variables['form'];
	$output = "";
	$form["combine"]["#prefix"] = '<div class="views-widget-filter-combine-custom"><label for="edit-combine">'.theme('icon', array('bundle' => 'fontello_pack_01', 'icon' => 'icon-globe')).' Destination</label>';
	$form["combine"]["#suffix"] = '</div>';
	$form["submit"]["#value"] = '<i class="icon glyphicon glyphicon-search" aria-hidden="true"></i>';
	$form["submit"]["#prefix"] = '<span class="input-group-btn">';
	$form["submit"]["#suffix"] = '</span>';
	$form["title_1"]["#prefix"] = '<span style="display:none">';
	$form["title_1"]["#suffix"] = '</span>';
	$output .= '<div class="container form-deals">'.drupal_render($form["combine"]).drupal_render($form["sort_bef_combine"]).'<div class="btn-group search not-display">'.drupal_render($form["title"]).drupal_render($form["submit"]).'</div>'; 
	$output .= '<div data-toggle="buttons" class="btn-group deal-list"><label class="btn btn-primary"><input type="radio" value="list" id="option-list" name="options-deals" class="ctools-auto-submit-exclude"> <i aria-hidden="true" class="icon fontello icon-menu"></i> LIST</label><label class="btn btn-primary active"><input type="radio" value="grid" id="option-grid" name="options-deals" class="ctools-auto-submit-exclude"> <i aria-hidden="true" class="icon fontello icon-th"></i> GRID  </label></div>';
	$output .= "</div>";
	unset($form["combine"]);
	unset($form["sort_bef_combine"]);
	unset($form["title"]);
	unset($form["submit"]);
	return $output. drupal_render_children($form);
}

