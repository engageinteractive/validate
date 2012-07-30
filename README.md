# Validate

---

A barebones jQuery validation plugin.

Fully configurable and extendable, it can be used in any size project.

---

## Usage

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

---
## Documentation