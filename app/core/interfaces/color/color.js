//  Color core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com

// Attribute          Type              Contains                                Example
// -------------------------------------------------------------------------------------------------------------------------------------
// options.schema     Backbone.Model    Structure/Schema for this table row     options.schema.get('type') [column_name, comment, type]
// options.model      Backbone.Model    Data/Model for this table row           options.model.get('id') [any column in current table row]
// options.value      String            Value for this field
// options.settings   Backbone.Model    Saved values for current UI options     options.settings.get('length') [any key from this UI options]
// options.name       String            Field name
/*jshint multistr: true */


define(['app', 'core/UIComponent', 'core/UIView', 'core/t'], function(app, UIComponent, UIView, __t) {

  'use strict';

  var defaultPalette = [
    'f44336',
    'e91e63',
    '9c27b0',
    '3f51b5',
    '2196f3',
    '4caf50',
    'ffeb3b',
    'ff9800',
    '9e9e9e',
    '000000',
    'ffffff'
  ];

  /**
   * Validates hex value
   * @param  {String} color hex color value
   * @return {Boolean}
   */
  function isValidHex(color) {
    if(!color || typeof color !== 'string') return false;

    // Validate hex values
    if(color.substring(0, 1) === '#') color = color.substring(1);

    switch(color.length) {
      case 3: return /^[0-9A-F]{3}$/i.test(color);
      case 6: return /^[0-9A-F]{6}$/i.test(color);
      case 8: return /^[0-9A-F]{8}$/i.test(color);
      default: return false;
    }

    return false;
  }

  /**
   * Validates RGB(a) value
   * @param  {Number} r
   * @param  {Number} g
   * @param  {Number} b
   * @param  {Number} [a=0]
   * @return {Boolean}
   */
  function isValidRGB(r, g, b, a) {
    a = a || 0;
    if(typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number' || typeof a !== 'number') return false;

    var regex = /\b(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\b/;
    if(
      regex.test(r) &&
      regex.test(g) &&
      regex.test(b) &&
      a >= 0 && a <= 1
    ) return true;

    return false;
  }

  /**
   * Validates HSL(a)
   * @param  {Number} h
   * @param  {Number} s
   * @param  {Number} l
   * @param  {Number} a
   * @return {Boolean}
   */
  function isValidHSL(h, s, l, a) {
    a = a || 0;
    if(typeof h !== 'number' || typeof s !== 'number' || typeof l !== 'number' || typeof a !== 'number') return false;

    if(
      h >= 0 && h <= 360 &&
      s >= 0 && s <= 100 &&
      l >= 0 && l <= 100 &&
      a >= 0 && a <= 1
    ) return true;

    return false;
  }

  function showInvalidMessage(view) {
    view.$el.find('.color-invalid')[0].innerHTML = __t('confirm_invalid_value');
  }

  function hideInvalidMessage(view) {
    view.$el.find('.color-invalid')[0].innerHTML = '';
  }

  var Input = UIView.extend({
    template: 'color/input',

    events: {
      // Disable enter button (would select first button after input == palette option)
      'keypress input': function(event) {
        if((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) return false;
      },

      'click .color-preview': function(event) {
        // Remove value from input
        this.$el.find('input').val('');

        // Clear color preview
        this.$el.find('.color-preview')[0].style.backgroundColor = 'black';

        // Disable active button
        this.$el.find('button').removeClass('active');
      },

      // Validate value on change
      'change .color-text': function(event) {
        var type = this.options.settings.get('input');
        switch(type) {
          case 'hex': {
            var color = event.target.value;
            return !isValidHex(color) && color.length !== 0 ? showInvalidMessage(this) : hideInvalidMessage(this);
          }

          case 'rgb': {
            var color = {
              r: +this.$el.find('input.red').val(),
              g: +this.$el.find('input.green').val(),
              b: +this.$el.find('input.blue').val(),
              a: +this.$el.find('input.alpha').val()
            }

            return !isValidRGB(color.r, color.g, color.b, color.a) ? showInvalidMessage(this) : hideInvalidMessage(this);
          }

          case 'hsl': {
            var color = {
              h: +this.$el.find('input.hue').val(),
              s: +this.$el.find('input.saturation').val(),
              l: +this.$el.find('input.lightness').val(),
              a: +this.$el.find('input.alpha').val()
            }

            return !isValidHSL(color.h, color.s, color.l, color.a) ? showInvalidMessage(this) : hideInvalidMessage(this);
          }
        }
      },

      // 'blur .color-text': function(event) {
      //   var color = event.target.value;
      //
      //   if(this.options.schema.isRequired() && color.length === 0) {
      //     this.$el.find('.color-invalid')[0].innerHTML = __t('this_field_is_required');
      //   }
      // },

      // 'input .color-text': function(event) {
      //   var color = event.target.value;
      //
      //   // Activate button if color matches
      //   this.$el.find('button').removeClass('active');
      //   this.$el.find('button[data-color="' + color + '"]').addClass('active');
      //
      //   // Update preview color
      //   this.$el.find('.color-preview')[0].style.backgroundColor = '#' + color;
      //
      //   // Set preview color to black when input field is empty
      //   if(color.length === 0) this.$el.find('.color-preview')[0].style.backgroundColor = '#000';
      //
      //   this.$el.find('.color-invalid')[0].innerHTML = '';
      // },
      // 'click .color-select': function(event) {
      //   // Active clicked on button
      //   var button = event.target.className === 'material-icons' ? event.target.parentNode : event.target;
      //   this.$el.find('input').val(button.getAttribute('data-color'));
      //   this.$el.find('button').removeClass('active');
      //   button.classList.add('active');
      //
      //   // Set preview color
      //   this.$el.find('.color-preview')[0].style.backgroundColor = '#' + button.getAttribute('data-color');
      //
      //   // Remove invalid message
      //   this.$el.find('.color-invalid')[0].innerHTML = '';
      // }
    },

    serialize: function() {
      var value = this.options.value || '';

      var input = this.options.settings.get('input');

      return {
        value: value,
        name: this.options.name,
        comment: this.options.schema.get('comment'),
        palette: this.options.settings.get('palette').length ? this.options.settings.get('palette').split(',') : false,
        readonly: this.options.settings.get('readonly'),
        input: input,
        output: this.options.settings.get('output'),
        hex: input === 'hex',
        rgb: input === 'rgb',
        hsl: input === 'hsl',
        alpha: this.options.settings.get('allow_alpha')
      };
    }
  });

  var Component = UIComponent.extend({
    id: 'color',
    dataTypes: ['VARCHAR'],
    variables: [
      // Disables editing of the field while still letting users see the value
      {id: 'readonly', type: 'Boolean', default_value: false, ui: 'checkbox'},
      // TODO: Add 'only allow from palette' option
      {
        id: 'input',
        type: 'String',
        default_value: 'hex',
        ui: 'select',
        options: {
          options: {
            hex: 'Hex',
            rgb: 'RGB',
            hsl: 'HSL'
          }
        }
      },
      {
        id: 'output',
        type: 'String',
        default_value: 'hex',
        ui: 'select',
        options: {
          options: {
            hex: 'Hex',
            hexWithChar: 'Hex (with `#`)',
            rgb: 'RGB',
            hsl: 'HSL'
          }
        }
      },
      {
        id: 'listing',
        type: 'String',
        default_value: 'swatch',
        ui: 'select',
        options: {
          options: {
            swatch: 'Color Swatch',
            value: 'Value'
          }
        }
      },
      {
        id: 'allow_alpha',
        type: 'Boolean',
        default_value: false,
        ui: 'checkbox'
      },
      {
        id: 'palette',
        type: 'String',
        ui: 'tags'
      }
    ],
    Input: Input,
    validate: function(value, options) {
      if (options.schema.isRequired() && _.isEmpty(value)) {
        return __t('this_field_is_required');
      }
    },
    list: function(options) {
      return (options.settings.get('show_color_on_list') === true) ? '<div title="#'+options.value+'" style="background-color:#'+options.value+'; color:#ffffff; height:20px; width:20px; border:1px solid #ffffff;-webkit-border-radius:20px;-moz-border-radius:20px;border-radius:20px;">&nbsp;</div>' : options.value;
    }
  });

  return Component;
});
