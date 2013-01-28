# Validate.js

---

A barebones jQuery validation plugin.

Fully configurable and extendable, it can be used in any size project.

**Have a look at [index.html](https://github.com/engageinteractive/validate/blob/master/index.html) for a demo.**

---

## Usage

### Basic

The plugin is designed to be used as a jQuery function, so call it like so:

```javascript
$('#form').validate(settings);
```

To return the $.validate object:

```javascript
var $validate = $('#form').data('validate');
```

To add rules to your elements, simple add in the data attribute `data-validate`:

```html
<input type="text" name="email" data-validate="required|email">
```

Rules should be separated with a pipe (|), and parameters for various rules should be enclosed in square brackets: `data-validate="min[2]|max[100]"`

The plugin will automatically be called when the form is submitted.

### Advanced

You can also use the plugin independently, by calling it like so:

```javascript
var $validate = new $.validate(settings, form);
```

---
## Documentation

### Rules

These rules can be used in the data-validate attribute. **Please note the camelCasing!**

**required**  
Returns true if a value is entered  

**alpha**  
Only allow letters  

**numeric**  
Only allow numbers  

**alphanumeric**  
Only allow letter/numbers  

**url**  
Only allow valid URLs (must include https/http/ftp)  

**email**  
Only allow valid emails  

**groupRequired**  
Check at least 1 checkbox/radio has been selected. This must be placed on the *container* of the inputs 
 
**groupMin[X]**  
Check if at least X checkboxes/radios have been checked. This must be placed on the *container* of the inputs  

**groupMax[X]**  
Check if at most X checkboxes/radios have been checked. This must be placed on the *container* of the inputs  

**regExp[name]**  
Check the value against a saved regual expression. (i.e. alpha, email etc.)  

**customRegExp[value,modifiers]**  
Check the value against a custom regular expression *without* the wrapping /. e.g., [A-Z,igm]  

**max[X]**  
Only allow numbers that are equal to or below X  

**min[X]**  
Only allow numbers that are equal to or above X  

**minLength[X]**  
Only allow values that are equal to or less than length X  

**maxLength[X]**  
Only allow values that are equal to or more than length X  


### Options

The jQuery plugin has 1 optional parameter, the options object, where as if you call the class directly, you have two optional parameters, the options object and a form element.

#### Settings object

**debug** *false*  
If set to true, the form will not submit on success.  

**autoDetect** *false*  
If set to true, html5 input types will automatically be detected (i.e. email)  

**visibleOnly** *true*  
If set to true, only visible elements will be checked  

**beforeSubmit** *function(){}*  
Function to call before the form is checked  

**singleError** *function($field, failedRules){}*  
Function to call if an error is found. This is called *per field*. So if two fields have errors, this will be called twice.  

**overallError** *function($form, failedFields){}*  
Function to be called if the form has errors  

**singleSuccess** *function($field, rules){}*  
Function to be called if a field has validated  

**overallSuccess** *function($form){}*  
Function to be called if the form has passed validation  

**regExp** *{
	alpha			: ...,
	numeric			: ...,
	alphanumeric		: ...,
	url			: ...,
	email			: ...
}*  
Object of RegExps used to validate fields. This means you can easily replace existing ones or add your own.

#### Form

You can optionally pass in a form element if you are using the class method. This means you don't have to reference it later if you're using the public methods (as shown below).

----


### Public Methods

**checkField** *($field)*  
Validates the field, returns true/false.  

**checkValue** *($field, rules)*  
Validates a field based on the array of rules you pass in. Useful if you want to add new rules as you go.

**fieldsToCheck** *($form)*  
Returns a jQuery selection of fields the form checks when validating. Pass in a form to check, or leave blank to use the currently set form.

**checkRequired** *($field)*  
Checks if the field has a value.

**checkRequiredCheckbox** *($field)*  
Checks if a checkbox has been selected. This is done automatically when auto processing the rules, and is included here just for completion.

**checkGroupRequired** *($inputs)*  
Checks if at least one input (radio/checkbox) has been selected. $inputs is the container of the inputs.

**checkGroupMax** *($inputs, max)*  
Checks if a max amount of inputs (radio/checkbox) have been selected. $inputs is the container of the inputs.

**checkGroupMin** *($inputs, min)*  
Checks if a min amount of inputs (radio/checkbox) have been selected. $inputs is the container of the inputs.

**checkRegExp** *($field, regExp)*  
Checks if the value matches a predefined regular expression. (i.e. alpha, email etc.)

**checkCustomRegExp** *($field, regExp, modifiers)*  
Checks if the value matches the custom regular expression.

**checkMax** *($field, max)*  
Checks if a number is equal to or smaller than the max value.

**checkMin** *($field, min)*  
Checks if a number is equal to or larger than the min value.

**checkMinLength** *($field, min)*  
Checks if the value is equal to or larger than the max length.

**checkMaxLength** *($field, min)*  
Checks if the value is equal to or smaller than the mix length.

---

### Custom Validation

Adding custom validation is easy! There are two ways you can add a new rule.

**1**: Add a new regExp rule when passing the settings object:

```javascript
var settings = {
    regExp    : {
        customRule : /[124]{1,2}/
    }
};
```

Then reference it in your data attribute:

```html
<input type="text" name="custom" data-validate="customRule">
```

**2**: You can add a completely new check method if you need something more advanced. **The method must be prefixed with check, and be in camelCase.**

First, get the validate object:

```javascript
var $validate = $('#form').data('validate');
```

Add your new method:

```javascript
$validate.checkCustomRule = function($field, arg1){
    return $field.val() == arg1;
};
```

Now reference it:

```html
<input type="text" name="custom" data-validate="customRule[matchme]">
```

Any parameters you specify will automatically be passed in, so `customRule[x,y,z]` will equate to:

```javascript
$validate.checkCustomRule($field, x, y, z);
```

The field to validate will always be the first parameter passed in.

For some examples, see the [custom validation gist](https://gist.github.com/3206449).