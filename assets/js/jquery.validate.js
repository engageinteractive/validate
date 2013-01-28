/*-------------------------------

	VALIDATE.JS

	A barebones jQuery validation plugin

	@author Todd Francis
	@version 1.0.3

-------------------------------*/

;(function(window, $, undefined){

	'use strict';

	/**
	 * jQuery wrapper for the function
	 *
	 * @param  {Object} settings
	 * @returns {Object}
	 */
	$.fn.validate = function(settings){

		return this.each(function() {

			var $this = $(this);

			if( undefined === $this.data('validate') ){

				var plugin = new $.validate(settings, $this);
				$this.data('validate', plugin);

			}

		});
	};

	/**
	 * Validate core function
	 *
	 * @constructor
	 * @param  {Object} settings
	 * @param  {Object} [$form] jQuery selection
	 * @returns void
	 */
	$.validate = function(settings, $form){

		// Settings
		var defaults = {
			debug				: false,
			autoDetect			: false,
			visibleOnly			: true,
			beforeSubmit		: function(){},
			singleError			: function($field, failedRules){},
			overallError		: function($form, failedFields){},
			singleSuccess		: function($field, rules){},
			overallSuccess		: function($form){},
			regExp				: {
				alpha				: /^[a-zA-Z]*$/,
				numeric				: /^[0-9]*$/,
				alphanumeric		: /^[a-zA-Z0-9]*$/,
				url					: /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
				email				: /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/
			}
		};

		var o = $.extend(true, defaults, settings),
			plugin = this,
			groupFunctions = ['checkGroupRequired', 'checkGroupMin', 'checkGroupMax'];

		plugin.$form = $form;

		plugin.version = '1.0.3';

		if( $form !== undefined ){

			$form.on('submit', function(e){

				if( !plugin.validate() || o.debug )
				{
					e.stopImmediatePropagation();
					e.preventDefault();
				}

			});
		}

		/**
		 * Attempts to add a new rule if it doesn't already exist
		 *
		 * @param  {string} rule
		 * @param  {Array}  rules
		 * @returns {Array}
		 */
		function pushRule(rule, rules){

			if( $.inArray(rule, rules) == -1 ){

				rules.push(rule);

			}

			return rules;

		}

		/**
		 * Extracts the parameters from a function name
		 *
		 * @param  {string} funcName
		 * @returns {Array}
		 */
		function extractParams(funcName){

			// Get just the params string
			var params = funcName
				.slice(funcName.indexOf('[') + 1, -1);

			return params.indexOf(',') !== -1
				? params.split(',')
				: [params];

		}

		/**
		 * Checks if the plugin should autodetect the field
		 *
		 * @param  {boolean} autodetect	Set in the settings
		 * @param  {Object} $field		jQuery object
		 * @returns {boolean}
		 */
		function shouldAutoDetect(autodetect, $field){

			return o.autoDetect &&
				$field.is('input:not([type="checkbox"], [type="radio"])') &&
				$field.attr('type') != 'text';

		}

		/**
		 * Validate the form
		 *
		 * @param  {Object} $form jQuery selection object
		 * @return {boolean}
		 */
		plugin.validate = function($f)
		{
			var $toCheck = (typeof $f === 'undefined')
					? plugin.$form
					: $f,
				$fields,
				error = false,
				failedFields = $();

			o.beforeSubmit.call(plugin);

			$fields = plugin.fieldsToCheck($toCheck);

			// Loop through the fields and validate
			$fields.each(function(){

				var $field = $(this);

				if( ( o.visibleOnly && $field.is(':visible') ) || !o.visibleOnly )
				{

					if( !plugin.checkField($field) ){

						error = true;
						failedFields = failedFields.add($field);

					}

				}

			});

			if( error ){

				o.overallError.call(plugin, $toCheck, failedFields);

			}else{

				if( o.overallSuccess.call(plugin, $toCheck) === false )
				{
					error = true;
				}
			}

			return !error;
		};

		/**
		 * Checks a field
		 *
		 * @param  {Object} $field jQuery object
		 * @returns {boolean}
		 */
		plugin.checkField = function($field)
		{
			var rules = $field.data('validate')
					?	$field.data('validate').split('|')
					:	[],
				value = $field.val(),
				failedRules = [];

			// If autodetect is on, add new rules
			if( shouldAutoDetect(o.autodetect, $field) ){

				var fieldType = $field.attr('type');

				switch (fieldType){

					case 'number':
						rules = pushRule('numeric', rules);
						break;

					default:
						rules = pushRule(fieldType, rules);
						break;

				}

			}

			// Process the rules to get them in a nice array/object format
			rules = processRules(rules);

			failedRules = plugin.checkValue($field, rules);

			if( failedRules instanceof Object ){

				o.singleError.call(plugin, $field, failedRules);
				return false;

			}else{

				o.singleSuccess.call(plugin, $field, rules);
				return true;

			}
		};

		/**
		 * Checks a value against a set of rules
		 *
		 * @param  {Object} $field jQuery object
		 * @param  {Array|string} rules  Rules to check against
		 * @returns mixed        Returns true if valid, or an array of rules failed if not
		 */
		plugin.checkValue = function($field, rules){

			if (!rules) return true;

			rules = (typeof rules == 'string')
				? processRules(rules)
				: rules;

			var failedRules = [];

			// Loop through the rules and test them
			for( var i = 0; i < rules.length; i++ ){

				var ruleName = rules[i].rule,
					funcName = '',
					args = [$field].concat(rules[i].args.slice()),
					indexOfParams = ruleName.indexOf('[');

				// We need to capitalise the first letter
				funcName = 'check'+ruleName.charAt(0).toUpperCase()+ruleName.slice(1);

				// Check if we have a checkbox/radio button
				if( funcName == 'checkRequired' &&	$field.is('input[type="checkbox"]') ){

						funcName = 'checkRequiredCheckbox';

				}else if( $.inArray(funcName, groupFunctions) != -1 ){

					var $inputs = $('input[type="checkbox"]', $field);

					if( !$inputs.length ){

						$inputs = $('input[type="radio"]', $field);

					}

					// Add new inputs and remove original
					args = [$inputs].concat(args.slice(1));

				}

				// Do we have a function to call?
				if( plugin[funcName] instanceof Function ){

					// Call the function, does it pass?
					if( !plugin[funcName].apply(plugin, args) ){

						failedRules.push(rules[i]);

					}

				// Do we have a regExp to pass it though?
				}else if( o.regExp[rules[i].rule] ){

					// Need to check that the field doesn't have a value
					if( $field.val() !== '' && !plugin.checkRegExp($field, rules[i].rule) ){

						failedRules.push(rules[i]);

					}

				}else{

					// Need better error reporting here?
					// console.log('Rule not found '+funcName);

					failedRules.push(rules[i]);

				}

			}

			// If we have any failed rules, return them
			// Otherwise, we passed!
			return failedRules.length > 0 ? failedRules : true;
		};

		/**
		 * Process rules
		 *
		 * @param  {string} rules
		 * @return {array}
		 */
		function processRules(rules){

			var pRules = [];

			// Process the rules
			for( var i = 0; i < rules.length; i++ ){

				var ruleName = rules[i],
					funcName = '',
					args = [],
					indexOfParams = ruleName.indexOf('[');

				// If the rule has params
				// Add them to the args array
				if( indexOfParams !== -1 ){

					args = args.concat(extractParams(ruleName));
					ruleName = ruleName.slice(0, indexOfParams);

				}

				pRules.push({
					rule		: ruleName,
					args		: args
				});
			}

			return pRules;
		}

		/**
		 * Gets the fields to check in the supplied form
		 *
		 * @param  {Object} [$f] jQuery selection to check in
		 * @returns {Object} jQuery selection of fields to check
		 */
		plugin.fieldsToCheck = function($f){

			var $toCheck = ($f === undefined)
					? plugin.$form
					: $f,
				$fields;

			// We need to do this every time
			// In case we've added new fields
			$fields = $('[data-validate]', $toCheck);

			// autodetect turned on? Get the fields with a required attribute!
			if( o.autoDetect ){

				$fields = $('input[required]').add($fields);

			}

			return $fields;

		};

		/**
		 * Check required
		 *
		 * @param  {Object} $field
		 * @returns {boolean}
		 */
		plugin.checkRequired = function($field){

			return $field.val().length > 0 ? true : false;

		};

		/**
		 * Check the checkbox is checked
		 *
		 * @param  {Object} $field
		 * @returns {boolean}
		 */
		plugin.checkRequiredCheckbox = function($field){

			return $field.is(':checked');

		};

		/**
		 * Checks if a group of inputs have been checked at least once
		 *
		 * @param  {Object} $inputs jQuery selection of inputs
		 * @returns {boolean}
		 */
		plugin.checkGroupRequired = function($inputs){

			return $inputs.filter(':checked').length
				? true
				: false;

		};

		/**
		 * Checks if a minimum amount of inputs have been checked
		 *
		 * @param  {Object} $inputs jQuery selection of inputs
		 * @param  {number} min
		 * @returns {boolean}
		 */
		plugin.checkGroupMin = function($inputs, min){

			return $inputs.filter(':checked').length >= min;

		};

		/**
		 * Checks if a maximum amount of inputs have been checked
		 *
		 * @param  {Object} $inputs jQuery selection of inputs
		 * @param  {number} max
		 * @returns {boolean}
		 */
		plugin.checkGroupMax = function($inputs, max){

			return $inputs.filter(':checked').length <= max;

		};

		/**
		 * Checks the value against a custom regex string
		 *
		 * @param  {Object} $field
		 * @param  {string} regExp      You don't need the wrapping /
		 * @param  {string} modifiers    i, g, m etc
		 * @returns {boolean}
		 */
		plugin.checkCustomRegExp = function($field, regExp, modifiers){

			if( $field.val() === '' ) return true;

			var obj = new RegExp(regExp, modifiers);

			return $field.val().match(obj) ? true : false;

		};

		/**
		 * Evaluates the regex stored in the options
		 *
		 * @param  {Object} $field
		 * @param  {string} regExp
		 * @returns {boolean}
		 */
		plugin.checkRegExp = function($field, regExp){

			return $field.val().match(o.regExp[regExp]) ? true : false;

		};

		/**
		 * Check the value's length against the maximum
		 *
		 * @param  {Object} $field
		 * @param  {number} max
		 * @returns {boolean}
		 */
		plugin.checkMaxLength = function($field, max){

			if( $field.val() === '' ) return true;

			return $field.val().length <= max;

		};

		/**
		 * Check the value's length against the minimum
		 *
		 * @param  {Object} $field
		 * @param   min
		 * @returns {boolean}
		 */
		plugin.checkMinLength = function($field, min){

			if( $field.val() === '' ) return true;

			return $field.val().length >= min;

		};

		/**
		 * Check the fields value against the maximum
		 *
		 * @param  {Object} $field
		 * @param  {number} max
		 * @returns {boolean}
		 */
		plugin.checkMax = function($field, max){

			if( $field.val() === '' ) return true;

			return parseFloat($field.val()) <= parseFloat(max);

		};

		/**
		 * Check the fields value against the minimum
		 *
		 * @param  {Object} $field
		 * @param   min
		 * @returns {boolean}
		 */
		plugin.checkMin = function($field, min){

			if( $field.val() === '' ) return true;

			return parseFloat($field.val()) >= parseFloat(min);

		};

	};

}(window, jQuery));