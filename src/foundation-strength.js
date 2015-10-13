
/*
 * foundation-strength.js
 * Author: Alexander Egorov
 * Original author: Aaron Lumsden
 * Licensed under the MIT license
 */
(function($) {
  var FoundationStrength, defaults, plugin_name;
  plugin_name = 'strength';
  defaults = {
    show_meter: true,
    meter_style: 'radius',
    show_messages: true,
    classes: {
      nopassword: 'nopassword',
      weak: 'password-weak',
      moderate: 'password-moderate',
      strong: 'password-strong'
    }
  };
  FoundationStrength = function(form, options) {
    this.$form = $(form);
    this.options = $.extend({}, defaults, options);
    this.init();
  };
  FoundationStrength.prototype = {
    init: function() {
      var $appendee, $form, $inputs, $meter, $pass, get_password_score, get_password_strength, options, update, update_caps;
      options = this.options;
      $appendee = void 0;
      $form = this.$form;
      $pass = $form.find('input[type=password]').first();
      get_password_score = function(p) {
        var check, i, letters, score, variationCount, variations;
        score = 0;
        if (!p) {
          return score;
        }
        letters = new Object;
        i = 0;
        while (i < p.length) {
          letters[p[i]] = (letters[p[i]] || 0) + 1;
          score += 5.0 / letters[p[i]];
          i++;
        }
        variations = {
          digits: /\d/.test(p),
          lower: /[a-z]/.test(p),
          upper: /[A-Z]/.test(p),
          nonWords: /\W/.test(p)
        };
        variationCount = 0;
        for (check in variations) {
          variationCount += variations[check] === true ? 1 : 0;
        }
        score += (variationCount - 1) * 10;
        return parseInt(score);
      };
      get_password_strength = function(score) {
        if (score > 60) {
          return 'strong';
        }
        if (score > 40) {
          return 'moderate';
        }
        return 'weak';
      };
      if (this.$form.prop('localName') !== 'form') {
        console.error('Foundation strength element should be \'form\'.');
        return;
      }
      if ($pass.parent().prop('localName') === 'label') {
        $appendee = $pass.parent();
      } else {
        $appendee = $pass;
      }
      if (options.show_meter === true) {
        $appendee.after('<div class=\'strength-meter progress ' + options.meter_style + '\'>' + '<span class=\'meter\'></span></div>');
        $meter = this.$form.find('.strength-meter .meter');
      }
      update = function(l, s, p) {
        var class_to_add;
        var class_to_add, classes_all, classes_to_remove, meter_width;
        if (l === 0) {
          class_to_add = options.classes.nopassword;
        } else {
          class_to_add = options.classes[s];
        }
        classes_all = [];
        $.each(options.classes, function(k, v) {
          classes_all.push(v);
        });
        classes_to_remove = $.grep(classes_all, function(c) {
          return c !== class_to_add;
        });
        $form.addClass(class_to_add).removeClass(classes_to_remove.join(' '));
        meter_width = p < 100 ? p : 100;
        $meter.width(meter_width + '%');
      };
      update_caps = function(c) {
        var is_off, is_on;
        is_on = 'caps-on';
        is_off = 'caps-off';
        if (c) {
          $form.addClass(is_on).removeClass(false);
        } else {
          $form.addClass(is_off).removeClass(true);
        }
      };
      update(0, 'weak', 0);
      update_caps(false);
      $inputs = $form.find('[type=text],[type=email],[type=password],:text');
      $inputs.each(function(event) {
        $(this).bind('keypress', function(event) {
          var s;
          s = String.fromCharCode(event.which);
          if (s.match(/[A-Za-zА-Яа-я]/)) {
            if (s.toUpperCase() === s && s.toLowerCase() !== s && !event.shiftKey) {
              update_caps(true);
            } else {
              update_caps(false);
            }
          }
        });
      });
      $pass.bind('keypress keyup change', function(event) {
        var password, score, strength;
        password = $(this).val();
        score = get_password_score(password);
        strength = get_password_strength(score);
        update(password.length, strength, score);
      });
    }
  };
  $.fn[plugin_name] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + plugin_name)) {
        $.data(this, 'plugin_' + plugin_name, new FoundationStrength(this, options));
      }
    });
  };
})($);
