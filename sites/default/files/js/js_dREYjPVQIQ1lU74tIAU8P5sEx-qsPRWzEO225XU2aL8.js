/**
 * Provides the ability to fix a html block to a position on the page when the
 * browser is scroled.
 *
 * This code is based on tableheader.js
 */
(function ($) {

Drupal.blockFloatStack = function() {
  if( typeof Drupal.blockFloatStack.blocks == 'undefined' ) {
    Drupal.blockFloatStack.blocks = [];
  }
  return Drupal.blockFloatStack.blocks;
}

/**
 * Attaches the floating_block behavior.
 */
Drupal.behaviors.blockFloat = {
  attach: function (context) {

    var settings = Drupal.settings.floating_block;

    // This breaks in anything less than IE 7. Prevent it from running.
    if ($.browser.msie && parseInt($.browser.version, 10) < 7) {
      return;
    }

    // If this behaviour is being called as part of processing an ajax callback.
    if (jQuery.isFunction(context.parent)) {
      context = context.parent();
    }

    // Cycle through all of the blocks we want to float.
    $.each(settings, function (selector, setting) {
      // The format of a select is [float]|[container] where:
      // [float] is the jQuery selector of thing you want to stay on screen
      // [container] is the jQuery selector of container that defines a boundary
      // not to float outside of.
      $(selector.toString() + ':not(.blockFloat-processed)', context).each(function (j, block) {
        // Store information about the block to float.
        var blockInfo = [];
        blockInfo.original_css = [];
        blockInfo.original_css.left = Drupal.blockFloatCleanCSSValue($(block).css('left'));
        blockInfo.original_css.top = Drupal.blockFloatCleanCSSValue($(block).css('top'));
        blockInfo.original_css.position = $(block).css("position");
        blockInfo.floating = false;
        blockInfo.reset = true;
        blockInfo.original_identifier = 'blockFloat-' +  Drupal.blockFloatStack().length;

        // Store the selector for the container if it exists.
        if (setting.container && $(setting.container.toString()).length > 0) {
          blockInfo.container = setting.container;
        }

        if (setting.padding_top) {
          blockInfo.padding_top = setting.padding_top;
        }
        else {
          blockInfo.padding_top = 0;
        }

        if (setting.padding_bottom) {
          blockInfo.padding_bottom = setting.padding_bottom;
        }
        else {
          blockInfo.padding_bottom = 0;
        }

        // Fix the width of the block as often a block will be 100% of it's
        // container. This ensures that when it's floated it will keep it's
        // original width. There is no point using .css('width') as this will
        // return the computed value so we might as well just set it.
        $(block).width($(block).width());

        // Add class to block to indicate that we're done and give
        // Drupal.blockFloatTracker a certain way to identify the block.
        $(block).addClass('blockFloat-processed ' + blockInfo.original_identifier);

        // If the page loaded has already been scrolled calling
        // Drupal.blockFloatTracker will float the block if necessary.
        Drupal.blockFloatTracker(blockInfo);

        // Store the block in the floating_blocks array.
        Drupal.blockFloatStack().push(blockInfo);
      });
    });
  }
}

/**
 * Function that calculates whether or not the block should be floated.
 */
Drupal.blockFloatTracker = function (blockInfo) {
  // Save positioning data.
  var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  var block = $('.' + blockInfo.original_identifier);
  if (block.length == 0) {
    // The floated block must have been removed from the page - do nothing.
    return;
  }

  // (Re)calculate some values if necessary.
  if (blockInfo.scrollHeight != scrollHeight || blockInfo.reset) {
    if (blockInfo.reset) {
      // Reset block so we can calculate new offset.
      Drupal.blockFloatResetPosition(block, blockInfo);
      blockInfo.original_offset = $(block).offset();

      // Reset completed - set value so we don't do unnecessary resets.
      blockInfo.reset = false;
    }

    // Save the scrollHeight - if this changes we will need to recalculate.
    blockInfo.scrollHeight = scrollHeight;
    // The minimum offset is always defined by the blocks starting position.
    blockInfo.minOffset = blockInfo.original_offset.top - blockInfo.padding_top;

    // Calulate the maxOffset which depends on whether or not a container is
    // defined. Otherwise use the scrollHeight.
    if (blockInfo.container) {
      blockInfo.maxOffset = $(blockInfo.container).height() + $(blockInfo.container).offset().top - blockInfo.padding_bottom;
    }
    else {
      blockInfo.maxOffset = scrollHeight;
    }
  }

  // Track positioning relative to the viewport and set position.
  var vScroll = (document.documentElement.scrollTop || document.body.scrollTop);
  if (vScroll > blockInfo.minOffset) {
    var topPosition = blockInfo.padding_top;
    // Block height can change if there a collapsible fields etc... inside the
    // block so recalculate everytime we are floating the block.
    var blockHeight = block.height();
    // Don't let the bottom of the block go beneath maxOffset.
    if ((vScroll + blockHeight) > blockInfo.maxOffset) {
      // At this point topPosition will become a negative number to keep the
      // block from going out of the defined container.
      topPosition = blockInfo.maxOffset - vScroll - blockHeight;
    }

    block.css({
      left:  blockInfo.original_offset.left + 'px',
      position: 'fixed',
      top: topPosition + 'px'
    }).addClass('floating-block-active');

    blockInfo.floating = true;
  }
  else {
    // Put the block back in it's original postion
    Drupal.blockFloatResetPosition(block, blockInfo);
  }
}

/**
 * Resets the position of a floated block back to non floated position.
 */
Drupal.blockFloatResetPosition = function (block, blockInfo) {
  if (blockInfo.floating) {
    block.css({
      left: blockInfo.original_css.left,
      position: blockInfo.original_css.position,
      top: blockInfo.original_css.top
    }).removeClass('floating-block-active');
    blockInfo.floating = false;
  }
}

/**
 * If the css value is 0px for top and left then it is not actually set using
 * CSS - this will be the computed value. Setting to a blank string will ensure
 * that when Drupal.blockFloatResetPosition is called these css value will be
 * unset.
 */
Drupal.blockFloatCleanCSSValue = function (cssvalue) {
  if (cssvalue == '0px') {
    cssvalue = '';
  }
  return cssvalue;
}

/**
 * Callback to be added to the scroll event. Each time the user scrolls this
 * function will be called.
 */
Drupal.blockFloatOnScroll = function() {
  $(Drupal.blockFloatStack()).each(function () {
    Drupal.blockFloatTracker(this);
  });
};

/**
 * Callback to be added to the resize event. Each time the user resizes the
 * this window this function will be called. A timeout is used to prevent
 * this function from causing a slow down during resizing.
 */
Drupal.blockFloatWindowResize = function() {
  if( typeof Drupal.blockFloatWindowResize.timer == 'undefined' ) {
    Drupal.blockFloatWindowResize.timer = false;
  }
  // Ensure minimum time between adjustments.
  if (Drupal.blockFloatWindowResize.timer) {
    return;
  }
  Drupal.blockFloatWindowResize.timer = setTimeout(function () {
    $(Drupal.blockFloatStack()).each(function () {
      this.reset = true;
      Drupal.blockFloatTracker(this);
    });
    // Reset timer
    Drupal.blockFloatWindowResize.timer = false;
  }, 250);
};

/**
 * Attach callbacks to resize and scroll events. Add a class to the body to
 * prevent doing this multiple times.
 */
if (!$('body').hasClass('blockFloat-processed')) {
  $('body').addClass('blockFloat-processed');
  $(window).scroll(Drupal.blockFloatOnScroll);
  $(document.documentElement).scroll(Drupal.blockFloatOnScroll);
  $(window).resize(Drupal.blockFloatWindowResize);
}

})(jQuery);
;
/*! http://mths.be/placeholder v2.0.7 by @mathias */
;(function(window, document, $) {

	// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var prototype = $.fn;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = prototype.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		placeholder = prototype.placeholder = function() {
			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value == '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass('placeholder')) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.placeholder', this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.placeholder').each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass('placeholder');
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value == '') {
			if (input.type == 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass('placeholder');
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass('placeholder');
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (err) {}
	}

}(this, document, jQuery));
;
(function ($) {
	$(document).ready(function() {
		/*if($('.view-deals-front').length > 0) {
			$(".view-deals-front").addClass("option-list");
		}*/
		$(':input[placeholder]').placeholder({color: '#AEA7B9'});
		if($('.social-tooltip').length > 0) {	
	    	$('.social-tooltip').tooltip();	    
		}
		
		if($('.node-type-deal .group-deal-map .panel-title').length > 0 && $('.node-type-deal .group-deal-map .views-field-field-address span.fn').length > 0) {	
	    	$('.node-type-deal .group-deal-map .panel-title').text('About ' + $('.node-type-deal .group-deal-map .views-field-field-address span.fn').text());	    
		}
		if($('#edit-sort-bef-combine').length > 0) {	
		    $('#edit-sort-bef-combine').selectpicker();
		}
		if($('#edit-field-deal-categories-tid').length > 0) {	
		    $('#edit-field-deal-categories-tid').selectpicker();
		}
		$('input:radio[name="options-deals"]').change(
		    function(){		
	            limadot_asign_list($(this).val());	            	
		});	
		if ($('.view-deals-front.view-display-id-page').length > 0 || $('.view-deals-front.view-display-id-page_1').length > 0 || $('.view-deals-front.view-display-id-page_2').length > 0) {
			if(Drupal.settings.limadot_general.option_list_selected == "grid") {
				limadot_asign_list("grid");	
			} else {
				limadot_asign_list("list");			
			}		
		}
	});
	
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
		}
	}
	
})(jQuery);;
(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + Drupal.settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;
/**
 * @file
 * Provides dependent visibility for form items in CTools' ajax forms.
 *
 * To your $form item definition add:
 * - '#process' => array('ctools_process_dependency'),
 * - '#dependency' => array('id-of-form-item' => array(list, of, values, that,
 *   make, this, item, show),
 *
 * Special considerations:
 * - Radios are harder. Because Drupal doesn't give radio groups individual IDs,
 *   use 'radio:name-of-radio'.
 *
 * - Checkboxes don't have their own id, so you need to add one in a div
 *   around the checkboxes via #prefix and #suffix. You actually need to add TWO
 *   divs because it's the parent that gets hidden. Also be sure to retain the
 *   'expand_checkboxes' in the #process array, because the CTools process will
 *   override it.
 */

(function ($) {
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.dependent = {};

  Drupal.CTools.dependent.bindings = {};
  Drupal.CTools.dependent.activeBindings = {};
  Drupal.CTools.dependent.activeTriggers = [];

  Drupal.CTools.dependent.inArray = function(array, search_term) {
    var i = array.length;
    while (i--) {
      if (array[i] == search_term) {
         return true;
      }
    }
    return false;
  }


  Drupal.CTools.dependent.autoAttach = function() {
    // Clear active bindings and triggers.
    for (i in Drupal.CTools.dependent.activeTriggers) {
      $(Drupal.CTools.dependent.activeTriggers[i]).unbind('change');
    }
    Drupal.CTools.dependent.activeTriggers = [];
    Drupal.CTools.dependent.activeBindings = {};
    Drupal.CTools.dependent.bindings = {};

    if (!Drupal.settings.CTools) {
      return;
    }

    // Iterate through all relationships
    for (id in Drupal.settings.CTools.dependent) {
      // Test to make sure the id even exists; this helps clean up multiple
      // AJAX calls with multiple forms.

      // Drupal.CTools.dependent.activeBindings[id] is a boolean,
      // whether the binding is active or not.  Defaults to no.
      Drupal.CTools.dependent.activeBindings[id] = 0;
      // Iterate through all possible values
      for(bind_id in Drupal.settings.CTools.dependent[id].values) {
        // This creates a backward relationship.  The bind_id is the ID
        // of the element which needs to change in order for the id to hide or become shown.
        // The id is the ID of the item which will be conditionally hidden or shown.
        // Here we're setting the bindings for the bind
        // id to be an empty array if it doesn't already have bindings to it
        if (!Drupal.CTools.dependent.bindings[bind_id]) {
          Drupal.CTools.dependent.bindings[bind_id] = [];
        }
        // Add this ID
        Drupal.CTools.dependent.bindings[bind_id].push(id);
        // Big long if statement.
        // Drupal.settings.CTools.dependent[id].values[bind_id] holds the possible values

        if (bind_id.substring(0, 6) == 'radio:') {
          var trigger_id = "input[name='" + bind_id.substring(6) + "']";
        }
        else {
          var trigger_id = '#' + bind_id;
        }

        Drupal.CTools.dependent.activeTriggers.push(trigger_id);

        if ($(trigger_id).attr('type') == 'checkbox') {
          $(trigger_id).siblings('label').addClass('hidden-options');
        }

        var getValue = function(item, trigger) {
          if ($(trigger).size() == 0) {
            return null;
          }

          if (item.substring(0, 6) == 'radio:') {
            var val = $(trigger + ':checked').val();
          }
          else {
            switch ($(trigger).attr('type')) {
              case 'checkbox':
                var val = $(trigger).attr('checked') ? true : false;

                if (val) {
                  $(trigger).siblings('label').removeClass('hidden-options').addClass('expanded-options');
                }
                else {
                  $(trigger).siblings('label').removeClass('expanded-options').addClass('hidden-options');
                }

                break;
              default:
                var val = $(trigger).val();
            }
          }
          return val;
        }

        var setChangeTrigger = function(trigger_id, bind_id) {
          // Triggered when change() is clicked.
          var changeTrigger = function() {
            var val = getValue(bind_id, trigger_id);

            if (val == null) {
              return;
            }

            for (i in Drupal.CTools.dependent.bindings[bind_id]) {
              var id = Drupal.CTools.dependent.bindings[bind_id][i];
              // Fix numerous errors
              if (typeof id != 'string') {
                continue;
              }

              // This bit had to be rewritten a bit because two properties on the
              // same set caused the counter to go up and up and up.
              if (!Drupal.CTools.dependent.activeBindings[id]) {
                Drupal.CTools.dependent.activeBindings[id] = {};
              }

              if (val != null && Drupal.CTools.dependent.inArray(Drupal.settings.CTools.dependent[id].values[bind_id], val)) {
                Drupal.CTools.dependent.activeBindings[id][bind_id] = 'bind';
              }
              else {
                delete Drupal.CTools.dependent.activeBindings[id][bind_id];
              }

              var len = 0;
              for (i in Drupal.CTools.dependent.activeBindings[id]) {
                len++;
              }

              var object = $('#' + id + '-wrapper');
              if (!object.size()) {
                // Some elements can't use the parent() method or they can
                // damage things. They are guaranteed to have wrappers but
                // only if dependent.inc provided them. This check prevents
                // problems when multiple AJAX calls cause settings to build
                // up.
                var $original = $('#' + id);
                if ($original.is('fieldset') || $original.is('textarea')) {
                  continue;
                }

                object = $('#' + id).parent();
              }

              if (Drupal.settings.CTools.dependent[id].type == 'disable') {
                if (Drupal.settings.CTools.dependent[id].num <= len) {
                  // Show if the element if criteria is matched
                  object.attr('disabled', false);
                  object.addClass('dependent-options');
                  object.children().attr('disabled', false);
                }
                else {
                  // Otherwise hide. Use css rather than hide() because hide()
                  // does not work if the item is already hidden, for example,
                  // in a collapsed fieldset.
                  object.attr('disabled', true);
                  object.children().attr('disabled', true);
                }
              }
              else {
                if (Drupal.settings.CTools.dependent[id].num <= len) {
                  // Show if the element if criteria is matched
                  object.show(0);
                  object.addClass('dependent-options');
                }
                else {
                  // Otherwise hide. Use css rather than hide() because hide()
                  // does not work if the item is already hidden, for example,
                  // in a collapsed fieldset.
                  object.css('display', 'none');
                }
              }
            }
          }

          $(trigger_id).change(function() {
            // Trigger the internal change function
            // the attr('id') is used because closures are more confusing
            changeTrigger(trigger_id, bind_id);
          });
          // Trigger initial reaction
          changeTrigger(trigger_id, bind_id);
        }
        setChangeTrigger(trigger_id, bind_id);
      }
    }
  }

  Drupal.behaviors.CToolsDependent = {
    attach: function (context) {
      Drupal.CTools.dependent.autoAttach();

      // Really large sets of fields are too slow with the above method, so this
      // is a sort of hacked one that's faster but much less flexible.
      $("select.ctools-master-dependent")
        .once('ctools-dependent')
        .change(function() {
          var val = $(this).val();
          if (val == 'all') {
            $('.ctools-dependent-all').show(0);
          }
          else {
            $('.ctools-dependent-all').hide(0);
            $('.ctools-dependent-' + val).show(0);
          }
        })
        .trigger('change');
    }
  }
})(jQuery);
;
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
(function ($) {
    Drupal.behaviors.colorboxNode = {
        // Lets find our class name and change our URL to
        // our defined menu path to open in a colorbox modal.
        attach: function (context, settings) {
            $('.colorbox-node', context).once('init-colorbox-node-processed', function () {
                $(this).colorboxNode({'launch': false});
            });

            // When using contextual links and clicking from within the colorbox
            // we need to close down colorbox when opening the built in overlay.
            $('ul.contextual-links a', context).once('colorboxNodeContextual').click(function () {
                $.colorbox.close();
            });
        }
    };

    // Bind our colorbox node functionality to an anchor
    $.fn.colorboxNode = function (options) {
        var settings = {
            'launch': true
        };

        $.extend(settings, options);

        var href = $(this).attr('data-href');
        if (typeof href == 'undefined' || href == false) {
            href = $(this).attr('href');
        }
        // Create an element so we can parse our a URL no matter if its internal or external.
        var parse = document.createElement('a');
        parse.href = href;
        // Lets add our colorbox link after the base path if necessary.
        var base_path = Drupal.settings.basePath;
        var pathname = parse.pathname;

        // Lets check to see if the pathname has a forward slash.
        // This problem happens in IE7/IE8
        if (pathname.charAt(0) != '/') {
            pathname = '/' + parse.pathname;
        }

        if (base_path != '/') {
            var link = pathname.replace(base_path, base_path + 'colorbox/') + parse.search;
        } else {
            var link = base_path + 'colorbox' + pathname + parse.search;
        }

        // Bind Ajax behaviors to all items showing the class.
        var element_settings = {};

        // This removes any loading/progress bar on the clicked link
        // and displays the colorbox loading screen instead.
        element_settings.progress = { 'type': 'none' };
        // For anchor tags, these will go to the target of the anchor rather
        // than the usual location.
        if (href) {
            element_settings.url = link;
            element_settings.event = 'click';
        }

        $(this).click(function () {
            $this = $(this);

            // Lets extract our width and height giving priority to the data attributes.
            var innerWidth = $this.data('inner-width');
            var innerHeight = $this.data('inner-height');
            if (typeof innerWidth != 'undefined' && typeof innerHeight != 'undefined') {
                var params = $.urlDataParams(innerWidth, innerHeight);
            } else {
                var params = $.urlParams(href);
            }

            params.html = '<div id="colorboxNodeLoading"></div>';
            params.onComplete = function () {
                $this.colorboxNodeGroup();
            }
            params.open = true;

            // Launch our colorbox with the provided settings
            $(this).colorbox($.extend({}, Drupal.settings.colorbox, params));
        });

        // Log our click handler to our ajax object
        var base = $(this).attr('id');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);

        // Default to auto click for manual call to this function.
        if (settings.launch) {
            Drupal.ajax[base].eventResponse(this, 'click');
            $(this).click();
        }
    }

    // Allow for grouping on links to showcase a gallery with left/right arrows.
    // This function will find the next index of each link on the page by the rel
    // and manually force a click on the link to call that AJAX and update the
    // modal window.
    $.fn.colorboxNodeGroup = function () {
        // Lets do something wonky with galleries.
        var rel = $(this).attr('rel');
        if ($('a[rel="' + rel + '"]:not("#colorbox a[rel="' + rel + '"]")').length > 1) {
            $related = $('a[rel="' + rel + '"]:not("#colorbox a[rel="' + rel + '"]")');
            var idx = $related.index($(this));
            var tot = $related.length;

            // Show our gallery buttons
            $('#cboxPrevious, #cboxNext').show();
            $.colorbox.next = function () {
                index = getIndex(1);
                $related[index].click();

            };
            $.colorbox.prev = function () {
                index = getIndex(-1);
                $related[index].click();
            };

            // Setup our current HTML
            $('#cboxCurrent').html(Drupal.settings.colorbox.current.replace('{current}', idx + 1).replace('{total}', tot)).show();

            var prefix = 'colorbox';
            // Remove Bindings and re-add
            // @TODO: There must be a better way?  If we don't remove it causes a memory to be exhausted.
            $(document).unbind('keydown.' + prefix);

            // Add Key Bindings
            $(document).bind('keydown.' + prefix, function (e) {
                var key = e.keyCode;
                if ($related[1] && !e.altKey) {
                    if (key === 37) {
                        e.preventDefault();
                        $.colorbox.prev();
                    } else if (key === 39) {
                        e.preventDefault();
                        $.colorbox.next();
                    }
                }
            });
        }

        function getIndex(increment) {
            var max = $related.length;
            var newIndex = (idx + increment) % max;
            return (newIndex < 0) ? max + newIndex : newIndex;
        }
    }

    // Utility function to parse out our width/height from our url params
    $.urlParams = function (url) {
        var p = {},
            e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&=]+)=?([^&]*)/g,
            d = function (s) {
                return decodeURIComponent(s.replace(a, ' '));
            },
            q = url.split('?');
        while (e = r.exec(q[1])) {
            e[1] = d(e[1]);
            e[2] = d(e[2]);
            switch (e[2].toLowerCase()) {
                case 'true':
                case 'yes':
                    e[2] = true;
                    break;
                case 'false':
                case 'no':
                    e[2] = false;
                    break;
            }
            if (e[1] == 'width') {
                e[1] = 'innerWidth';
            }
            if (e[1] == 'height') {
                e[1] = 'innerHeight';
            }
            p[e[1]] = e[2];
        }
        return p;
    };

    // Utility function to return our data attributes for width/height
    $.urlDataParams = function (innerWidth, innerHeight) {
        return {'innerWidth':innerWidth,'innerHeight':innerHeight};
    };

})(jQuery);
;
