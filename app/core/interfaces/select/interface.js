//  Select Core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com

define(['underscore', 'core/UIView', 'core/t', 'utils', 'select2'],function(_, UIView, __t, Utils, select2) {

  'use strict';

  var SHOW_SELECT_OPTIONS = {
    text: __t('select_ui_show_options_text'),
    value: __t('select_ui_show_options_value')
  };

  var parseOptions = function (options) {
    if (_.isString(options)) {
      try {
        options = JSON.parse(options);
      } catch (e) {
        options = {};
        console.error(e);
      }
    }

    return options;
  };

  return UIView.extend({
    template: 'select/input',

    serialize: function() {
      var selectedValue = this.options.value;
      var options = this.options.settings.get('options');

      // if selectedValue is null
      // we use the schema default value
      // it should not be undefined.
      if (selectedValue === null) {
        selectedValue = this.options.schema.get('default_value');
      }

      options = parseOptions(options);

      options = _.map(options, function(value, key) {
        var item = {};

        item.value = value;
        item.key = key;
        item.selected = (item.key == selectedValue);

        return item;
      });

      return {
        options: options,
        name: this.options.name,
        comment: this.options.schema.get('comment'),
        readonly: !this.options.canWrite,
        allow_null: this.options.settings.get('allow_null') === true,
        display_search: this.options.settings.get('display_search'),
        auto_search_limit: this.options.settings.get('auto_search_limit'),
        placeholder_text: (this.options.settings.get('placeholder_text')) ?  this.options.settings.get('placeholder_text') : __t('select_from_below')
      };
    },
    initialize: function() {
      var isMobile = navigator.userAgent.match(/(iP(hone|od|ad)|Android|IEMobile)/);
      if (!isMobile) {
        var self = this;
        setTimeout(function () {
          var options = {
            placeholder: self.options.settings.get('placeholder_text')
          };
          if (self.options.settings.get('display_search') === 'auto') {
            options.minimumResultsForSearch = self.options.settings.get('auto_search_limit') || 10;
          } else if (self.options.settings.get('display_search') === 'never') {
            options.minimumResultsForSearch = Infinity;
          }
          if (self.options.settings.get('allow_null')) {
            options.allowClear = true;
          }
          self.$el.find("select").select2(options);
        }, 0);
      }
    }
  });
});
