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
 * Implement a simple, clickable dropbutton menu.
 *
 * See dropbutton.theme.inc for primary documentation.
 *
 * The javascript relies on four classes:
 * - The dropbutton must be fully contained in a div with the class
 *   ctools-dropbutton. It must also contain the class ctools-no-js
 *   which will be immediately removed by the javascript; this allows for
 *   graceful degradation.
 * - The trigger that opens the dropbutton must be an a tag wit hthe class
 *   ctools-dropbutton-link. The href should just be '#' as this will never
 *   be allowed to complete.
 * - The part of the dropbutton that will appear when the link is clicked must
 *   be a div with class ctools-dropbutton-container.
 * - Finally, ctools-dropbutton-hover will be placed on any link that is being
 *   hovered over, so that the browser can restyle the links.
 *
 * This tool isn't meant to replace click-tips or anything, it is specifically
 * meant to work well presenting menus.
 */

(function ($) {
  Drupal.behaviors.CToolsDropbutton = {
    attach: function() {
      // Process buttons. All dropbuttons are buttons.
      $('.ctools-button')
        .once('ctools-button')
        .removeClass('ctools-no-js');

      // Process dropbuttons. Not all buttons are dropbuttons.
      $('.ctools-dropbutton').once('ctools-dropbutton', function() {
        var $dropbutton = $(this);
        var $button = $('.ctools-content', $dropbutton);
        var $secondaryActions = $('li', $button).not(':first');
        var $twisty = $(".ctools-link", $dropbutton);
        var open = false;
        var hovering = false;
        var timerID = 0;

        var toggle = function(close) {
          // if it's open or we're told to close it, close it.
          if (open || close) {
            // If we're just toggling it, close it immediately.
            if (!close) {
              open = false;
              $secondaryActions.slideUp(100);
              $dropbutton.removeClass('open');
            }
            else {
              // If we were told to close it, wait half a second to make
              // sure that's what the user wanted.
              // Clear any previous timer we were using.
              if (timerID) {
                clearTimeout(timerID);
              }
              timerID = setTimeout(function() {
                if (!hovering) {
                  open = false;
                  $secondaryActions.slideUp(100);
                  $dropbutton.removeClass('open');
                }}, 500);
            }
          }
          else {
            // open it.
            open = true;
            $secondaryActions.animate({height: "show", opacity: "show"}, 100);
            $dropbutton.addClass('open');
          }
        }
        // Hide the secondary actions initially.
        $secondaryActions.hide();

        $twisty.click(function() {
            toggle();
            return false;
          });

        $dropbutton.hover(
          function() {
            hovering = true;
          }, // hover in
          function() { // hover out
            hovering = false;
            toggle(true);
            return false;
          }
        );
      });
    }
  }
})(jQuery);
;

/**
 * Cookie plugin 1.0
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie=function(b,j,m){if(typeof j!="undefined"){m=m||{};if(j===null){j="";m.expires=-1}var e="";if(m.expires&&(typeof m.expires=="number"||m.expires.toUTCString)){var f;if(typeof m.expires=="number"){f=new Date();f.setTime(f.getTime()+(m.expires*24*60*60*1000))}else{f=m.expires}e="; expires="+f.toUTCString()}var l=m.path?"; path="+(m.path):"";var g=m.domain?"; domain="+(m.domain):"";var a=m.secure?"; secure":"";document.cookie=[b,"=",encodeURIComponent(j),e,l,g,a].join("")}else{var d=null;if(document.cookie&&document.cookie!=""){var k=document.cookie.split(";");for(var h=0;h<k.length;h++){var c=jQuery.trim(k[h]);if(c.substring(0,b.length+1)==(b+"=")){d=decodeURIComponent(c.substring(b.length+1));break}}}return d}};
;
(function ($) {

Drupal.ModuleFilter = {};

Drupal.ModuleFilter.explode = function(string) {
  var queryArray = string.match(/([a-zA-Z]+\:(\w+|"[^"]+")*)|\w+|"[^"]+"/g);
  if (!queryArray) {
    queryArray = new Array();
  }
  var i = queryArray.length;
  while (i--) {
    queryArray[i] = queryArray[i].replace(/"/g, "");
  }
  return queryArray;
};

Drupal.ModuleFilter.getState = function(key) {
  if (!Drupal.ModuleFilter.state) {
    Drupal.ModuleFilter.state = {};
    var cookie = $.cookie('DrupalModuleFilter');
    var query = cookie ? cookie.split('&') : [];
    if (query) {
      for (var i in query) {
        // Extra check to avoid js errors in Chrome, IE and Safari when
        // combined with JS like twitter's widget.js.
        // See http://drupal.org/node/798764.
        if (typeof(query[i]) == 'string' && query[i].indexOf('=') != -1) {
          var values = query[i].split('=');
          if (values.length === 2) {
            Drupal.ModuleFilter.state[values[0]] = values[1];
          }
        }
      }
    }
  }
  return Drupal.ModuleFilter.state[key] ? Drupal.ModuleFilter.state[key] : false;
};

Drupal.ModuleFilter.setState = function(key, value) {
  var existing = Drupal.ModuleFilter.getState(key);
  if (existing != value) {
    Drupal.ModuleFilter.state[key] = value;
    var query = [];
    for (var i in Drupal.ModuleFilter.state) {
      query.push(i + '=' + Drupal.ModuleFilter.state[i]);
    }
    $.cookie('DrupalModuleFilter', query.join('&'), { expires: 7, path: '/' });
  }
};

Drupal.ModuleFilter.Filter = function(element, selector, options) {
  var self = this;

  this.element = element;
  this.text = $(this.element).val();

  this.settings = Drupal.settings.moduleFilter;

  this.selector = selector;

  this.options = $.extend({
    delay: 500,
    striping: false,
    childSelector: null,
    empty: Drupal.t('No results'),
    rules: new Array()
  }, options);
  if (this.options.wrapper == undefined) {
    this.options.wrapper = $(self.selector).parent();
  }

  // Add clear button.
  this.element.after('<div class="module-filter-clear"><a href="#" class="js-hide">' + Drupal.t('clear') + '</a></div>');
  if (this.text) {
    $('.module-filter-clear a', this.element.parent()).removeClass('js-hide');
  }
  $('.module-filter-clear a', this.element.parent()).click(function() {
    self.element.val('');
    self.text = '';
    delete self.queries;
    self.applyFilter();
    self.element.focus();
    $(this).addClass('js-hide');
    return false;
  });

  this.updateQueries = function() {
    var queryStrings = Drupal.ModuleFilter.explode(self.text);

    self.queries = new Array();
    for (var i in queryStrings) {
      var query = { operator: 'text', string: queryStrings[i] };

      if (self.operators != undefined) {
        // Check if an operator is possibly used.
        if (queryStrings[i].indexOf(':') > 0) {
          // Determine operator used.
          var args = queryStrings[i].split(':', 2);
          var operator = args.shift();
          if (self.operators[operator] != undefined) {
            query.operator = operator;
            query.string = args.shift();
          }
        }
      }

      query.string = query.string.toLowerCase();

      self.queries.push(query);
    }

    if (self.queries.length <= 0) {
      // Add a blank string query.
      self.queries.push({ operator: 'text', string: '' });
    }
  };

  this.applyFilter = function() {
    self.results = new Array();

    self.updateQueries();

    if (self.index == undefined) {
      self.buildIndex();
    }

    self.element.trigger('moduleFilter:start');

    $.each(self.index, function(key, item) {
      var $item = item.element;

      for (var i in self.queries) {
        var query = self.queries[i];
        if (query.operator == 'text') {
          if (item.text.indexOf(query.string) < 0) {
            continue;
          }
        }
        else {
          var func = self.operators[query.operator];
          if (!(func(query.string, self, item))) {
            continue;
          }
        }

        var rulesResult = self.processRules(item);
        if (rulesResult !== false) {
          return true;
        }
      }

      $item.addClass('js-hide');
    });

    self.element.trigger('moduleFilter:finish', { results: self.results });

    if (self.options.striping) {
      self.stripe();
    }

    if (self.results.length > 0) {
      self.options.wrapper.find('.module-filter-no-results').remove();
    }
    else {
      if (!self.options.wrapper.find('.module-filter-no-results').length) {
        self.options.wrapper.append($('<p class="module-filter-no-results"/>').text(self.options.empty));
      };
    }
  };

  self.element.keyup(function(e) {
    switch (e.which) {
      case 13:
        if (self.timeOut) {
          clearTimeout(self.timeOut);
        }
        self.applyFilter();
        break;
      default:
        if (self.text != $(this).val()) {
          if (self.timeOut) {
            clearTimeout(self.timeOut);
          }

          self.text = $(this).val();

          if (self.text) {
            self.element.parent().find('.module-filter-clear a').removeClass('js-hide');
          }
          else {
            self.element.parent().find('.module-filter-clear a').addClass('js-hide');
          }

          self.element.trigger('moduleFilter:keyup');

          self.timeOut = setTimeout(self.applyFilter, self.options.delay);
        }
        break;
    }
  });

  self.element.keypress(function(e) {
    if (e.which == 13) e.preventDefault();
  });
};

Drupal.ModuleFilter.Filter.prototype.buildIndex = function() {
  var self = this;
  var index = new Array();
  $(this.selector).each(function(i) {
    var text = (self.options.childSelector) ? $(self.options.childSelector, this).text() : $(this).text();
    var item = {
      key: i,
      element: $(this),
      text: text.toLowerCase()
    };
    for (var j in self.options.buildIndex) {
      var func = self.options.buildIndex[j];
      item = $.extend(func(self, item), item);
    }
    $(this).data('indexKey', i);
    index.push(item);
    delete item;
  });
  this.index = index;
};

Drupal.ModuleFilter.Filter.prototype.processRules = function(item) {
  var self = this;
  var $item = item.element;
  var rulesResult = true;
  if (self.options.rules.length > 0) {
    for (var i in self.options.rules) {
      var func = self.options.rules[i];
      rulesResult = func(self, item);
      if (rulesResult === false) {
        break;
      }
    }
  }
  if (rulesResult !== false) {
    $item.removeClass('js-hide');
    self.results.push(item);
  }
  return rulesResult;
};

Drupal.ModuleFilter.Filter.prototype.stripe = function() {
  var self = this;
  var flip = { even: 'odd', odd: 'even' };
  var stripe = 'odd';

  $.each(self.index, function(key, item) {
    if (!item.element.hasClass('js-hide')) {
      item.element.removeClass('odd even')
        .addClass(stripe);
      stripe = flip[stripe];
    }
  });
};

$.fn.moduleFilter = function(selector, options) {
  var filterInput = this;
  filterInput.parents('.module-filter-inputs-wrapper').show();
  if (Drupal.settings.moduleFilter.setFocus) {
    filterInput.focus();
  }
  filterInput.data('moduleFilter', new Drupal.ModuleFilter.Filter(this, selector, options));
};

})(jQuery);
;
(function($) {

Drupal.behaviors.moduleFilter = {
  attach: function(context) {
    $('.module-filter-inputs-wrapper', context).once('module-filter', function() {
      var filterInput = $('input[name="module_filter[name]"]', context);
      var selector = '#system-modules table tbody tr';
      if (Drupal.settings.moduleFilter.tabs) {
        selector += '.module';
      }

      filterInput.moduleFilter(selector, {
        wrapper: $('#module-filter-modules'),
        delay: 500,
        striping: true,
        childSelector: 'td:nth(1)',
        rules: [
          function(moduleFilter, item) {
            if (!item.unavailable) {
              if (moduleFilter.options.showEnabled) {
                if (item.status && !item.disabled) {
                  return true;
                }
              }
              if (moduleFilter.options.showDisabled) {
                if (!item.status && !item.disabled) {
                  return true;
                }
              }
              if (moduleFilter.options.showRequired) {
                if (item.status && item.disabled) {
                  return true;
                }
              }
            }
            if (moduleFilter.options.showUnavailable) {
              if (item.unavailable || (!item.status && item.disabled)) {
                return true;
              }
            }
            return false;
          }
        ],
        buildIndex: [
          function(moduleFilter, item) {
            var $checkbox = $('td.checkbox :checkbox', item.element);
            if ($checkbox.size() > 0) {
              item.status = $checkbox.is(':checked');
              item.disabled = $checkbox.is(':disabled');
            }
            else {
              item.status = false;
              item.disabled = true;
              item.unavailable = true;
            }
            return item;
          }
        ],
        showEnabled: $('#edit-module-filter-show-enabled').is(':checked'),
        showDisabled: $('#edit-module-filter-show-disabled').is(':checked'),
        showRequired: $('#edit-module-filter-show-required').is(':checked'),
        showUnavailable: $('#edit-module-filter-show-unavailable').is(':checked')
      });

      var moduleFilter = filterInput.data('moduleFilter');

      moduleFilter.operators = {
        description: function(string, moduleFilter, item) {
          if (item.description == undefined) {
            var description = $('.description', item.element).clone();
            $('.admin-requirements', description).remove();
            $('.admin-operations', description).remove();
            item.description = description.text().toLowerCase();
          }

          if (item.description.indexOf(string) >= 0) {
            return true;
          }
        },
        requiredBy: function(string, moduleFilter, item) {
          if (item.requiredBy == undefined) {
            var requirements = Drupal.ModuleFilter.getRequirements(item.element);
            item.requires = requirements.requires;
            item.requiredBy = requirements.requiredBy;
          }

          for (var i in item.requiredBy) {
            if (item.requiredBy[i].indexOf(string) >= 0) {
              return true;
            }
          }
        },
        requires: function(string, moduleFilter, item) {
          if (item.requires == undefined) {
            var requirements = Drupal.ModuleFilter.getRequirements(item.element);
            item.requires = requirements.requires;
            item.requiredBy = requirements.requiredBy;
          }

          for (var i in item.requires) {
            if (item.requires[i].indexOf(string) >= 0) {
              return true;
            }
          }
        }
      };

      $('#edit-module-filter-show-enabled', context).change(function() {
        moduleFilter.options.showEnabled = $(this).is(':checked');
        moduleFilter.applyFilter();
      });
      $('#edit-module-filter-show-disabled', context).change(function() {
        moduleFilter.options.showDisabled = $(this).is(':checked');
        moduleFilter.applyFilter();
      });
      $('#edit-module-filter-show-required', context).change(function() {
        moduleFilter.options.showRequired = $(this).is(':checked');
        moduleFilter.applyFilter();
      });
      $('#edit-module-filter-show-unavailable', context).change(function() {
        moduleFilter.options.showUnavailable = $(this).is(':checked');
        moduleFilter.applyFilter();
      });

      if (!Drupal.settings.moduleFilter.tabs) {
        moduleFilter.element.bind('moduleFilter:start', function() {
          $('#system-modules fieldset').show();
        });

        moduleFilter.element.bind('moduleFilter:finish', function(e, data) {
          $('#system-modules fieldset').each(function(i) {
            $fieldset = $(this);
            if ($('tbody tr', $fieldset).filter(':visible').length == 0) {
              $fieldset.hide();
            }
          });
        });

        moduleFilter.applyFilter();
      }
    });
  }
};

Drupal.ModuleFilter.getRequirements = function(element) {
  var requires = new Array();
  var requiredBy = new Array();
  $('.admin-requirements', element).each(function() {
    var text = $(this).text();
    if (text.substr(0, 9) == 'Requires:') {
      // Requires element.
      requiresString = text.substr(9);
      requires = requiresString.replace(/\([a-z]*\)/g, '').split(',');
    }
    else if (text.substr(0, 12) == 'Required by:') {
      // Required by element.
      requiredByString = text.substr(12);
      requiredBy = requiredByString.replace(/\([a-z]*\)/g, '').split(',');
    }
  });
  for (var i in requires) {
    requires[i] = $.trim(requires[i].toLowerCase());
  }
  for (var i in requiredBy) {
    requiredBy[i] = $.trim(requiredBy[i].toLowerCase());
  }
  return { requires: requires, requiredBy: requiredBy };
};

})(jQuery);
;

/*
 * jQuery BBQ: Back Button & Query Library - v1.2.1 - 2/17/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,p){var i,m=Array.prototype.slice,r=decodeURIComponent,a=$.param,c,l,v,b=$.bbq=$.bbq||{},q,u,j,e=$.event.special,d="hashchange",A="querystring",D="fragment",y="elemUrlAttr",g="location",k="href",t="src",x=/^.*\?|#.*$/g,w=/^.*\#/,h,C={};function E(F){return typeof F==="string"}function B(G){var F=m.call(arguments,1);return function(){return G.apply(this,F.concat(m.call(arguments)))}}function n(F){return F.replace(/^[^#]*#?(.*)$/,"$1")}function o(F){return F.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/,"$1")}function f(H,M,F,I,G){var O,L,K,N,J;if(I!==i){K=F.match(H?/^([^#]*)\#?(.*)$/:/^([^#?]*)\??([^#]*)(#?.*)/);J=K[3]||"";if(G===2&&E(I)){L=I.replace(H?w:x,"")}else{N=l(K[2]);I=E(I)?l[H?D:A](I):I;L=G===2?I:G===1?$.extend({},I,N):$.extend({},N,I);L=a(L);if(H){L=L.replace(h,r)}}O=K[1]+(H?"#":L||!K[1]?"?":"")+L+J}else{O=M(F!==i?F:p[g][k])}return O}a[A]=B(f,0,o);a[D]=c=B(f,1,n);c.noEscape=function(G){G=G||"";var F=$.map(G.split(""),encodeURIComponent);h=new RegExp(F.join("|"),"g")};c.noEscape(",/");$.deparam=l=function(I,F){var H={},G={"true":!0,"false":!1,"null":null};$.each(I.replace(/\+/g," ").split("&"),function(L,Q){var K=Q.split("="),P=r(K[0]),J,O=H,M=0,R=P.split("]["),N=R.length-1;if(/\[/.test(R[0])&&/\]$/.test(R[N])){R[N]=R[N].replace(/\]$/,"");R=R.shift().split("[").concat(R);N=R.length-1}else{N=0}if(K.length===2){J=r(K[1]);if(F){J=J&&!isNaN(J)?+J:J==="undefined"?i:G[J]!==i?G[J]:J}if(N){for(;M<=N;M++){P=R[M]===""?O.length:R[M];O=O[P]=M<N?O[P]||(R[M+1]&&isNaN(R[M+1])?{}:[]):J}}else{if($.isArray(H[P])){H[P].push(J)}else{if(H[P]!==i){H[P]=[H[P],J]}else{H[P]=J}}}}else{if(P){H[P]=F?i:""}}});return H};function z(H,F,G){if(F===i||typeof F==="boolean"){G=F;F=a[H?D:A]()}else{F=E(F)?F.replace(H?w:x,""):F}return l(F,G)}l[A]=B(z,0);l[D]=v=B(z,1);$[y]||($[y]=function(F){return $.extend(C,F)})({a:k,base:k,iframe:t,img:t,input:t,form:"action",link:k,script:t});j=$[y];function s(I,G,H,F){if(!E(H)&&typeof H!=="object"){F=H;H=G;G=i}return this.each(function(){var L=$(this),J=G||j()[(this.nodeName||"").toLowerCase()]||"",K=J&&L.attr(J)||"";L.attr(J,a[I](K,H,F))})}$.fn[A]=B(s,A);$.fn[D]=B(s,D);b.pushState=q=function(I,F){if(E(I)&&/^#/.test(I)&&F===i){F=2}var H=I!==i,G=c(p[g][k],H?I:{},H?F:2);p[g][k]=G+(/#/.test(G)?"":"#")};b.getState=u=function(F,G){return F===i||typeof F==="boolean"?v(F):v(G)[F]};b.removeState=function(F){var G={};if(F!==i){G=u();$.each($.isArray(F)?F:arguments,function(I,H){delete G[H]})}q(G,2)};e[d]=$.extend(e[d],{add:function(F){var H;function G(J){var I=J[D]=c();J.getState=function(K,L){return K===i||typeof K==="boolean"?l(I,K):l(I,L)[K]};H.apply(this,arguments)}if($.isFunction(F)){H=F;return G}else{H=F.handler;F.handler=G}}})})(jQuery,this);
/*
 * jQuery hashchange event - v1.2 - 2/11/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,i,b){var j,k=$.event.special,c="location",d="hashchange",l="href",f=$.browser,g=document.documentMode,h=f.msie&&(g===b||g<8),e="on"+d in i&&!h;function a(m){m=m||i[c][l];return m.replace(/^[^#]*#?(.*)$/,"$1")}$[d+"Delay"]=100;k[d]=$.extend(k[d],{setup:function(){if(e){return false}$(j.start)},teardown:function(){if(e){return false}$(j.stop)}});j=(function(){var m={},r,n,o,q;function p(){o=q=function(s){return s};if(h){n=$('<iframe src="javascript:0"/>').hide().insertAfter("body")[0].contentWindow;q=function(){return a(n.document[c][l])};o=function(u,s){if(u!==s){var t=n.document;t.open().close();t[c].hash="#"+u}};o(a())}}m.start=function(){if(r){return}var t=a();o||p();(function s(){var v=a(),u=q(t);if(v!==t){o(t=v,u);$(i).trigger(d)}else{if(u!==t){i[c][l]=i[c][l].replace(/#.*/,"")+"#"+u}}r=setTimeout(s,$[d+"Delay"])})()};m.stop=function(){if(!n){r&&clearTimeout(r);r=0}};return m})()})(jQuery,this);
;

(function ($) {

Drupal.ModuleFilter.tabs = {};
Drupal.ModuleFilter.enabling = {};
Drupal.ModuleFilter.disabling = {};

Drupal.ModuleFilter.jQueryIsNewer = function() {
  if (Drupal.ModuleFilter.jQueryNewer == undefined) {
    var v1parts = $.fn.jquery.split('.');
    var v2parts = new Array('1', '4', '4');

    for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) {
        Drupal.ModuleFilter.jQueryNewer = true;
        return Drupal.ModuleFilter.jQueryNewer;
      }

      if (v1parts[i] == v2parts[i]) {
        continue;
      }
      else if (v1parts[i] > v2parts[i]) {
        Drupal.ModuleFilter.jQueryNewer = true;
        return Drupal.ModuleFilter.jQueryNewer;
      }
      else {
        Drupal.ModuleFilter.jQueryNewer = false;
        return Drupal.ModuleFilter.jQueryNewer;
      }
    }

    if (v1parts.length != v2parts.length) {
      Drupal.ModuleFilter.jQueryNewer = false;
      return Drupal.ModuleFilter.jQueryNewer;
    }

    Drupal.ModuleFilter.jQueryNewer = false;
  }
  return Drupal.ModuleFilter.jQueryNewer;
};

Drupal.behaviors.moduleFilterTabs = {
  attach: function(context) {
    if (Drupal.settings.moduleFilter.tabs) {
      $('#module-filter-wrapper table:not(.sticky-header)', context).once('module-filter-tabs', function() {
        var $modules = $('#module-filter-modules');
        var moduleFilter = $('input[name="module_filter[name]"]').data('moduleFilter');
        var table = $(this);

        $('thead', table).show();

        // Remove package header rows.
        $('tr.admin-package-header', table).remove();

        // Build tabs from package title rows.
        var tabs = '<ul id="module-filter-tabs">';
        for (var i in Drupal.settings.moduleFilter.packageIDs) {
          var id = Drupal.settings.moduleFilter.packageIDs[i];

          var name = id;
          var tabClass = 'project-tab';
          var title = null;
          var summary = (Drupal.settings.moduleFilter.countEnabled) ? '<span class="count">' + Drupal.ModuleFilter.countSummary(id) + '</span>' : '';

          switch (id) {
            case 'all':
              name = Drupal.t('All');
              break;
            case 'new':
              name = Drupal.t('New');
              title = Drupal.t('Modules installed within the last week.');
              if (Drupal.settings.moduleFilter.enabledCounts['new'].total == 0) {
                tabClass += ' disabled';
                summary += '<span>' + Drupal.t('No modules added within the last week.') + '</span>';
              }
              break;
            case 'recent':
              name = Drupal.t('Recent');
              title = Drupal.t('Modules enabled/disabled within the last week.');
              if (Drupal.settings.moduleFilter.enabledCounts['recent'].total == 0) {
                tabClass += ' disabled';
                summary += '<span>' + Drupal.t('No modules were enabled or disabled within the last week.') + '</span>';
              }
              break;
            default: 
              var $row = $('#' + id + '-package');
              name = $.trim($row.text());
              $row.remove();
              break;
          }

          tabs += '<li id="' + id + '-tab" class="' + tabClass + '"><a href="#' + id + '" class="overlay-exclude"' + (title ? ' title="' + title + '"' : '') + '><strong>' + name + '</strong><span class="summary">' + summary + '</span></a></li>';
        }
        tabs += '</ul>';
        $modules.before(tabs);

        // Index tabs.
        $('#module-filter-tabs li').each(function() {
          var $tab = $(this);
          var id = $tab.attr('id');
          Drupal.ModuleFilter.tabs[id] = new Drupal.ModuleFilter.Tab($tab, id);
        });

        $('tbody td.checkbox input', $modules).change(function() {
          var $checkbox = $(this);
          var key = $checkbox.parents('tr').data('indexKey');

          moduleFilter.index[key].status = $checkbox.is(':checked');

          if (Drupal.settings.moduleFilter.visualAid) {
            var type = ($checkbox.is(':checked')) ? 'enable' : 'disable';
            Drupal.ModuleFilter.updateVisualAid(type, $checkbox.parents('tr'));
          }
        });

        // Sort rows.
        var rows = $('tbody tr.module', table).get();
        rows.sort(function(a, b) {
          var compA = $('td:nth(1)', a).text().toLowerCase();
          var compB = $('td:nth(1)', b).text().toLowerCase();
          return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });
        $.each(rows, function(idx, itm) { table.append(itm); });

        // Re-stripe rows.
        $('tr.module', table)
          .removeClass('odd even')
          .filter(':odd').addClass('even').end()
          .filter(':even').addClass('odd');

        Drupal.ModuleFilter.adjustHeight();

        moduleFilter.element.bind('moduleFilter:start', function() {
          moduleFilter.tabResults = {
            'all-tab': { items: {}, count: 0 },
            'recent-tab': { items: {}, count: 0 },
            'new-tab': { items: {}, count: 0 }
          };

          // Empty result info from tabs.
          for (var i in Drupal.ModuleFilter.tabs) {
            if (Drupal.ModuleFilter.tabs[i].resultInfo != undefined) {
              Drupal.ModuleFilter.tabs[i].resultInfo.empty();
            }
          }
        });

        moduleFilter.element.bind('moduleFilter:finish', function(e, data) {
          $.each(moduleFilter.index, function(key, item) {
            if (!item.element.hasClass('js-hide')) {
              var id = Drupal.ModuleFilter.getTabID(item.element);

              if (moduleFilter.tabResults[id] == undefined) {
                moduleFilter.tabResults[id] = { items: {}, count: 0 };
              }
              if (moduleFilter.tabResults[id].items[item.key] == undefined) {
                // All tab
                moduleFilter.tabResults['all-tab'].count++;

                // Recent tab
                if (item.element.hasClass('recent-module')) {
                  moduleFilter.tabResults['recent-tab'].count++;
                }

                // New tab
                if (item.element.hasClass('new-module')) {
                  moduleFilter.tabResults['new-tab'].count++;
                }

                moduleFilter.tabResults[id].items[item.key] = item;
                moduleFilter.tabResults[id].count++;
              }

              if (Drupal.ModuleFilter.activeTab != undefined && Drupal.ModuleFilter.activeTab.id != 'all-tab') {
                if ((Drupal.ModuleFilter.activeTab.id == 'recent-tab' && !item.element.hasClass('recent-module')) || (Drupal.ModuleFilter.activeTab.id == 'new-tab' && !item.element.hasClass('new-module')) || (Drupal.ModuleFilter.activeTab.id != 'recent-tab' && Drupal.ModuleFilter.activeTab.id != 'new-tab' && id != Drupal.ModuleFilter.activeTab.id)) {
                  // The item is not in the active tab, so hide it.
                  item.element.addClass('js-hide');
                }
              }
            }
          });

          if (Drupal.settings.moduleFilter.visualAid) {
            if (moduleFilter.text) {
              // Add result info to tabs.
              for (var id in moduleFilter.tabResults) {
                var tab = Drupal.ModuleFilter.tabs[id];

                if (tab.resultInfo == undefined) {
                  var resultInfo = '<span class="result-info"></span>'
                  $('a', tab.element).prepend(resultInfo);
                  tab.resultInfo = $('span.result-info', tab.element);
                }

                tab.resultInfo.append(moduleFilter.tabResults[id].count);
              }

              if (Drupal.settings.moduleFilter.hideEmptyTabs) {
                for (var id in Drupal.ModuleFilter.tabs) {
                  if (moduleFilter.tabResults[id] != undefined) {
                    Drupal.ModuleFilter.tabs[id].element.show();
                  }
                  else if (Drupal.ModuleFilter.activeTab == undefined || Drupal.ModuleFilter.activeTab.id != id) {
                    Drupal.ModuleFilter.tabs[id].element.hide();
                  }
                }
                Drupal.ModuleFilter.adjustHeight();
              }
            }
            else {
              // Make sure all tabs are visible.
              if (Drupal.settings.moduleFilter.hideEmptyTabs) {
                $('#module-filter-tabs li').show();
              }
            }
          }

          if ((Drupal.ModuleFilter.activeTab != undefined && (moduleFilter.tabResults[Drupal.ModuleFilter.activeTab.id] == undefined || moduleFilter.tabResults[Drupal.ModuleFilter.activeTab.id].count <= 0))) {
            // The current tab contains no results.
            moduleFilter.results = 0;
          }
        });

        if (Drupal.settings.moduleFilter.useURLFragment) {
          $(window).bind('hashchange.module-filter', $.proxy(Drupal.ModuleFilter, 'eventHandlerOperateByURLFragment')).triggerHandler('hashchange.module-filter');
        }
        else {
          Drupal.ModuleFilter.selectTab();
        }

        if (Drupal.settings.moduleFilter.useSwitch) {
          $('td.checkbox div.form-item').hide();
          $('td.checkbox').each(function(i) {
            var $cell = $(this);
            var $checkbox = $(':checkbox', $cell);
            var $switch = $('.toggle-enable', $cell);
            $switch.removeClass('js-hide').click(function() {
              if (!$(this).hasClass('disabled')) {
                if (Drupal.ModuleFilter.jQueryIsNewer()) {
                  $checkbox.click();
                }
                else {
                  $checkbox.click().change();
                }
              }
            });
            $checkbox.click(function() {
              if (!$switch.hasClass('disabled')) {
                $switch.toggleClass('off');
              }
            });
          });
        }

        var $tabs = $('#module-filter-tabs');

        function getParentTopOffset($obj, offset) {
          var $parent = $obj.offsetParent();
          if ($obj[0] != $parent[0]) {
            offset += $parent.position().top;
            return getParentTopOffset($parent, offset);
          }
          return offset;
        }

        var tabsTopOffset = null;
        function getParentsTopOffset() {
          if (tabsTopOffset === null) {
            tabsTopOffset = getParentTopOffset($tabs.parent(), 0);
          }
          return tabsTopOffset;
        }

        function viewportTop() {
          var top = $(window).scrollTop();
          return top;
        }

        var pageActionsHeight;
        function viewportBottom() {
          var top = $(window).scrollTop();
          var bottom = top + $(window).height();

          bottom -= $('#page-actions').height();

          return bottom;
        }

        function fixToTop(top) {
          if ($tabs.hasClass('bottom-fixed')) {
            $tabs.css({
              'position': 'absolute',
              'top': $tabs.position().top - getParentsTopOffset(),
              'bottom': 'auto'
            });
            $tabs.removeClass('bottom-fixed');
          }

          if (($tabs.css('position') == 'absolute' && $tabs.offset().top - top >= 0) || ($tabs.css('position') != 'absolute' && $tabs.offset().top - top <= 0)) {
            $tabs.addClass('top-fixed');
            $tabs.attr('style', '');
          }
        }

        function fixToBottom(bottom) {
          if ($tabs.hasClass('top-fixed')) {
            $tabs.css({
              'position': 'absolute',
              'top': $tabs.position().top - getParentsTopOffset(),
              'bottom': 'auto'
            });
            $tabs.removeClass('top-fixed');
          }

          if ($tabs.offset().top + $tabs.height() - bottom <= 0) {
            $tabs.addClass('bottom-fixed');
            var style = '';
            var pageActionsHeight = $('#page-actions').height();
            if (pageActionsHeight > 0) {
              style = 'bottom: ' + pageActionsHeight + 'px';
            }
            $tabs.attr('style', style);
          }
        }

        var lastTop = 0;
        $(window).scroll(function() {
          var top = viewportTop();
          var bottom = viewportBottom();

          if ($modules.offset().top >= top) {
            $tabs.removeClass('top-fixed').attr('style', '');
          }
          else {
            if (top > lastTop) { // Downward scroll.
              if ($tabs.height() > bottom - top) {
                fixToBottom(bottom);
              }
              else {
                fixToTop(top);
              }
            }
            else { // Upward scroll.
              fixToTop(top);
            }
          }
          lastTop = top;
        });
      });
    }
  }
};

Drupal.ModuleFilter.Tab = function(element, id) {
  var self = this;

  this.id = id;
  this.hash = id.substring(0, id.length - 4);
  this.element = element;

  $('a', this.element).click(function() {
    if (!Drupal.settings.moduleFilter.useURLFragment) {
      var hash = (!self.element.hasClass('selected')) ? self.hash : 'all';
      Drupal.ModuleFilter.selectTab(hash);
      return false;
    }

    if (self.element.hasClass('selected')) {
      // Clear the active tab.
      window.location.hash = 'all';
      return false;
    }
  });

  $('tr.' + this.id, $('#system-modules')).hover(
    function() {
      self.element.addClass('suggest');
    },
    function() {
      self.element.removeClass('suggest');
    }
  );
};

Drupal.ModuleFilter.selectTab = function(hash) {
  if (!hash || Drupal.ModuleFilter.tabs[hash + '-tab'] == undefined || Drupal.settings.moduleFilter.enabledCounts[hash].total == 0) {
    if (Drupal.settings.moduleFilter.rememberActiveTab) {
      var activeTab = Drupal.ModuleFilter.getState('activeTab');
      if (activeTab && Drupal.ModuleFilter.tabs[activeTab + '-tab'] != undefined) {
        hash = activeTab;
      }
    }

    if (!hash) {
      hash = 'all';
    }
  }

  if (Drupal.ModuleFilter.activeTab != undefined) {
    Drupal.ModuleFilter.activeTab.element.removeClass('selected');
  }

  Drupal.ModuleFilter.activeTab = Drupal.ModuleFilter.tabs[hash + '-tab'];
  Drupal.ModuleFilter.activeTab.element.addClass('selected');

  var moduleFilter = $('input[name="module_filter[name]"]').data('moduleFilter');
  var filter = moduleFilter.applyFilter();

  if (!Drupal.ModuleFilter.modulesTop) {
    Drupal.ModuleFilter.modulesTop = $('#module-filter-modules').offset().top;
  }
  else {
    // Scroll back to top of #module-filter-modules.
    $('html, body').animate({
      scrollTop: Drupal.ModuleFilter.modulesTop
    }, 500);
    // $('html, body').scrollTop(Drupal.ModuleFilter.modulesTop);
  }

  Drupal.ModuleFilter.setState('activeTab', hash);
};

Drupal.ModuleFilter.eventHandlerOperateByURLFragment = function(event) {
  var hash = $.param.fragment();
  Drupal.ModuleFilter.selectTab(hash);
};

Drupal.ModuleFilter.countSummary = function(id) {
  return Drupal.t('@enabled of @total', { '@enabled': Drupal.settings.moduleFilter.enabledCounts[id].enabled, '@total': Drupal.settings.moduleFilter.enabledCounts[id].total });
};

Drupal.ModuleFilter.Tab.prototype.updateEnabling = function(name, remove) {
  this.enabling = this.enabling || {};
  if (!remove) {
    this.enabling[name] = name;
  }
  else {
    delete this.enabling[name];
  }
};

Drupal.ModuleFilter.Tab.prototype.updateDisabling = function(name, remove) {
  this.disabling = this.disabling || {};
  if (!remove) {
    this.disabling[name] = name;
  }
  else {
    delete this.disabling[name];
  }
};

Drupal.ModuleFilter.Tab.prototype.updateVisualAid = function() {
  var visualAid = '';
  var enabling = new Array();
  var disabling = new Array();

  if (this.enabling != undefined) {
    for (var i in this.enabling) {
      enabling.push(this.enabling[i]);
    }
    if (enabling.length > 0) {
      enabling.sort();
      visualAid += '<span class="enabling">+' + enabling.join('</span>, <span class="enabling">') + '</span>';
    }
  }
  if (this.disabling != undefined) {
    for (var i in this.disabling) {
      disabling.push(this.disabling[i]);
    }
    if (disabling.length > 0) {
      disabling.sort();
      if (enabling.length > 0) {
        visualAid += '<br />';
      }
      visualAid += '<span class="disabling">-' + disabling.join('</span>, <span class="disabling">') + '</span>';
    }
  }

  if (this.visualAid == undefined) {
    $('a span.summary', this.element).append('<span class="visual-aid"></span>');
    this.visualAid = $('span.visual-aid', this.element);
  }

  this.visualAid.empty().append(visualAid);
};

Drupal.ModuleFilter.getTabID = function($row) {
  var id = $row.data('moduleFilterTabID');
  if (!id) {
    // Find the tab ID.
    var classes = $row.attr('class').split(' ');
    for (var i in classes) {
      if (Drupal.ModuleFilter.tabs[classes[i]] != undefined) {
        id = classes[i];
        break;
      }
    }
    $row.data('moduleFilterTabID', id);
  }
  return id;
};

Drupal.ModuleFilter.updateVisualAid = function(type, $row) {
  var id = Drupal.ModuleFilter.getTabID($row);

  if (!id) {
    return false;
  }

  var tab = Drupal.ModuleFilter.tabs[id];
  var name = $('td:nth(1) strong', $row).text();
  switch (type) {
    case 'enable':
      if (Drupal.ModuleFilter.disabling[id + name] != undefined) {
        delete Drupal.ModuleFilter.disabling[id + name];
        tab.updateDisabling(name, true);
        $row.removeClass('disabling');
      }
      else {
        Drupal.ModuleFilter.enabling[id + name] = name;
        tab.updateEnabling(name);
        $row.addClass('enabling');
      }
      break;
    case 'disable':
      if (Drupal.ModuleFilter.enabling[id + name] != undefined) {
        delete Drupal.ModuleFilter.enabling[id + name];
        tab.updateEnabling(name, true);
        $row.removeClass('enabling');
      }
      else {
        Drupal.ModuleFilter.disabling[id + name] = name;
        tab.updateDisabling(name);
        $row.addClass('disabling');
      }
      break;
  }

  tab.updateVisualAid();
};

Drupal.ModuleFilter.adjustHeight = function() {
  // Hack for adjusting the height of the modules section.
  var minHeight = $('#module-filter-tabs').height() + 10;
  if (Drupal.settings.moduleFilter.dynamicPosition) {
    minHeight += $('#module-filter-submit').height();
  }
  $('#module-filter-modules').css('min-height', minHeight);
}

})(jQuery);
;
(function($) {

Drupal.behaviors.moduleFilterDynamicPosition = {
  attach: function(context) {
    var $window = $(window);

    $('#module-filter-wrapper', context).once('dynamic-position', function() {
      // Move the submit button just below the tabs.
      $('#module-filter-modules'). before($('#module-filter-submit'));
      if (Drupal.settings.moduleFilter.hideEmptyTabs) {
        // Trigger window scroll. When the save buttons dynamic position is enabled
        // we need this to ensure the save button's position updates with the new
        // height of the tabs.
        $window.trigger('scroll');
      }

      // Control the positioning.
      $window.scroll(function() {
        var $tabs = $('#module-filter-tabs');
        var $submit = $('#module-filter-submit');

        // Vertical movement.
        var top = $tabs.offset().top;
        var bottom = top + $tabs.height();
        var windowHeight = $window.height();
        var topOffset = Drupal.settings.tableHeaderOffset ? eval(Drupal.settings.tableHeaderOffset + '()') : 0;
        if (((bottom - windowHeight) > ($window.scrollTop() - $submit.height())) && $window.scrollTop() + windowHeight - $submit.height() - $('li:first', $tabs).height() > top) {
          $submit.css('margin-top', 0);
          $submit.removeClass('fixed-top').addClass('fixed fixed-bottom');
        }
        else if (bottom < ($window.scrollTop() + topOffset)) {
          $submit.css('margin-top', topOffset);
          $submit.removeClass('fixed-bottom').addClass('fixed fixed-top');
        }
        else {
          $submit.css('margin-top', 0);
          $submit.removeClass('fixed fixed-bottom fixed-top');
        }

        // Horizontal movement.
        if ($submit.hasClass('fixed-bottom') || $submit.hasClass('fixed-top')) {
          var left = $tabs.offset().left - $window.scrollLeft();
          if (left != $submit.offset().left - $window.scrollLeft()) {
            $submit.css('left', left);
          }
        }
      });
      $window.trigger('scroll');
      $window.resize(function() {
        $window.trigger('scroll');
      });
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Attaches sticky table headers.
 */
Drupal.behaviors.tableHeader = {
  attach: function (context, settings) {
    if (!$.support.positionFixed) {
      return;
    }

    $('table.sticky-enabled', context).once('tableheader', function () {
      $(this).data("drupal-tableheader", new Drupal.tableHeader(this));
    });
  }
};

/**
 * Constructor for the tableHeader object. Provides sticky table headers.
 *
 * @param table
 *   DOM object for the table to add a sticky header to.
 */
Drupal.tableHeader = function (table) {
  var self = this;

  this.originalTable = $(table);
  this.originalHeader = $(table).children('thead');
  this.originalHeaderCells = this.originalHeader.find('> tr > th');
  this.displayWeight = null;

  // React to columns change to avoid making checks in the scroll callback.
  this.originalTable.bind('columnschange', function (e, display) {
    // This will force header size to be calculated on scroll.
    self.widthCalculated = (self.displayWeight !== null && self.displayWeight === display);
    self.displayWeight = display;
  });

  // Clone the table header so it inherits original jQuery properties. Hide
  // the table to avoid a flash of the header clone upon page load.
  this.stickyTable = $('<table class="sticky-header"/>')
    .insertBefore(this.originalTable)
    .css({ position: 'fixed', top: '0px' });
  this.stickyHeader = this.originalHeader.clone(true)
    .hide()
    .appendTo(this.stickyTable);
  this.stickyHeaderCells = this.stickyHeader.find('> tr > th');

  this.originalTable.addClass('sticky-table');
  $(window)
    .bind('scroll.drupal-tableheader', $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    .bind('resize.drupal-tableheader', { calculateWidth: true }, $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    // Make sure the anchor being scrolled into view is not hidden beneath the
    // sticky table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceAnchor.drupal-tableheader', function () {
      window.scrollBy(0, -self.stickyTable.outerHeight());
    })
    // Make sure the element being focused is not hidden beneath the sticky
    // table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceFocus.drupal-tableheader', function (event) {
      if (self.stickyVisible && event.clientY < (self.stickyOffsetTop + self.stickyTable.outerHeight()) && event.$target.closest('sticky-header').length === 0) {
        window.scrollBy(0, -self.stickyTable.outerHeight());
      }
    })
    .triggerHandler('resize.drupal-tableheader');

  // We hid the header to avoid it showing up erroneously on page load;
  // we need to unhide it now so that it will show up when expected.
  this.stickyHeader.show();
};

/**
 * Event handler: recalculates position of the sticky table header.
 *
 * @param event
 *   Event being triggered.
 */
Drupal.tableHeader.prototype.eventhandlerRecalculateStickyHeader = function (event) {
  var self = this;
  var calculateWidth = event.data && event.data.calculateWidth;

  // Reset top position of sticky table headers to the current top offset.
  this.stickyOffsetTop = Drupal.settings.tableHeaderOffset ? eval(Drupal.settings.tableHeaderOffset + '()') : 0;
  this.stickyTable.css('top', this.stickyOffsetTop + 'px');

  // Save positioning data.
  var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  if (calculateWidth || this.viewHeight !== viewHeight) {
    this.viewHeight = viewHeight;
    this.vPosition = this.originalTable.offset().top - 4 - this.stickyOffsetTop;
    this.hPosition = this.originalTable.offset().left;
    this.vLength = this.originalTable[0].clientHeight - 100;
    calculateWidth = true;
  }

  // Track horizontal positioning relative to the viewport and set visibility.
  var hScroll = document.documentElement.scrollLeft || document.body.scrollLeft;
  var vOffset = (document.documentElement.scrollTop || document.body.scrollTop) - this.vPosition;
  this.stickyVisible = vOffset > 0 && vOffset < this.vLength;
  this.stickyTable.css({ left: (-hScroll + this.hPosition) + 'px', visibility: this.stickyVisible ? 'visible' : 'hidden' });

  // Only perform expensive calculations if the sticky header is actually
  // visible or when forced.
  if (this.stickyVisible && (calculateWidth || !this.widthCalculated)) {
    this.widthCalculated = true;
    var $that = null;
    var $stickyCell = null;
    var display = null;
    var cellWidth = null;
    // Resize header and its cell widths.
    // Only apply width to visible table cells. This prevents the header from
    // displaying incorrectly when the sticky header is no longer visible.
    for (var i = 0, il = this.originalHeaderCells.length; i < il; i += 1) {
      $that = $(this.originalHeaderCells[i]);
      $stickyCell = this.stickyHeaderCells.eq($that.index());
      display = $that.css('display');
      if (display !== 'none') {
        cellWidth = $that.css('width');
        // Exception for IE7.
        if (cellWidth === 'auto') {
          cellWidth = $that[0].clientWidth + 'px';
        }
        $stickyCell.css({'width': cellWidth, 'display': display});
      }
      else {
        $stickyCell.css('display', 'none');
      }
    }
    this.stickyTable.css('width', this.originalTable.outerWidth());
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
