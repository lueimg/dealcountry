<?php

/**
 * @file
 * template.php
 */
 
 function bootstrap_dealcountry_preprocess_page(&$vars) {
  if (drupal_is_front_page()) {
  	  $form = drupal_get_form('user_register_form');
      $vars['home_login'] = drupal_render($form);
  }
}