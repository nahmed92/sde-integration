/* jshint ignore:start */
// Global variables
var isInferenceEnabled;

var parameterInputCache = {};
var parameterSortOrder = [];

// On document ready,
jQuery(document).ready(function() {

  // we are setting value for isInferenceEnabled, by accessing a hidden html input field by the same id.
  isInferenceEnabled = jQuery("#isInferenceEnabled").val();

  // building parameter cache
  buildParameterInputCache();

  /**
   * This method will take an inferred value object, and do the follwing steps
   * 1) Update the target value if it is different from existing, and clear out exception codes
   * 2) Update the target unit if applicable, and also update unit attribute in input field
   * 3) Update the execption code if applicable
   * 4) Apply styling class to attribute
   * 5) Reset ec_n class if applied
   * 6) Push the result into changedParams array
   *
   * @param id - id attribute of the input associated with parameter, or DOM object (prototypejs) of the target parameter
   * @param inference - An object containing the details of inference containing the follwing fields
   *    { parameterId, inferredValue, targetValue, targetUnit, targetEcode }
   * inferredValue is the exact value returned by inference service
   * targetValue and targetUnit are the values parsed from inferredValue, and can be set directly into the fields
   * targetEcode only exists if an exception code is inferred. It is mutually excuslive with the targetValue and targetUnit
   */
  // USE addClass and hasClass functions (because we are using jquery here)
  unsavedParam.addInferredParameter = function(elem, inference) {
    // If we dont already have this elem in our array .. and if the value has changed
    if ((this.changedParams.indexOf(elem) == -1)) {
      this.changedParams.push($(elem.attr('id'))); // Using $ because changedParam expects a prototype object, not a jQuery object
    }

    // First we reset any exception code if applied on the input, this will remove any ecode classes
    resetExceptionCodeJQuery(elem);
    elem.addClass('inferred');

    var elemId = elem.attr('id');

    // If inferred exception code
    if (inference.hasExceptionCode) {
      elem.attr('unit', ''); // Clear value
      elem.attr('ecode', inference.targetEcode); // Set exception code
      elem.attr('inferredecode', inference.targetEcode); // Set exception code
      elem.addClass('ec_' + inference.targetEcode); // add class name for exception code
      elem.val('').change(); // Clear value

      // If this is chzn, we have to update the div
      if (elem.hasClass('chsn')) {
        var div = jQuery('#' + elemId + "_chzn");
        if (div != null) {
          resetExceptionCodeJQuery(div);
          div.attr('ecode', inference.targetEcode);
          div.addClass('ec_' + inference.targetEcode);
        }
      }
      // Numeric fields with unit
      if (inference.hasUnit) {
        var unit = jQuery("#DROPDOWN_" + elemId); // Find unit if attached to this
        if (unit.length > 0) {
          resetExceptionCodeJQuery(unit[0]);
          unit[0].attr('ecode', inference.targetEcode);
          unit[0].addClass('ec_' + inference.targetEcode);
          unit.addClass('inferred');
          unit[0].val('').change();
        }
      }
    } else {
      if (elem.prop('tagName') === 'TEXTAREA') {
        // set inferred paragraphic value in tinymce editor
        window.parent.tinyMCE.get(elemId).setContent(inference.targetValue);
        // getting inferredvalue from editor because it makes some changes in string which fails on comparison at server side
        // so keeping both values consistent
        elem.attr('inferredvalue', window.parent.tinyMCE.get(elemId).getContent());
        elem.html(window.parent.tinyMCE.get(elemId).getContent());
      } else {
        elem.val(inference.targetValue).change();
        elem.attr('inferredvalue', inference.inferredValue);
      }
      if (inference.hasUnit) {
        elem.attr('unit', inference.targetUnit);
        var unit = jQuery("#DROPDOWN_" + elemId); // Find unit if attached to this
        if (unit.length > 0) {
          console.log('Updating unit ' + unit);
          unit.val(inference.targetUnit);
          unit.change();
          unit.addClass('inferred');
        }
      }
    }
    // If this is chzn, we have to update the div
    if (elem.hasClass('chsn')) {
      elem.trigger("liszt:updated");
      var div = jQuery('#' + elemId + '_chzn');
      if (div != null) {
        div.addClass('inferred');
      }
    }

  };

  unsavedParam.rejectInferredParameter = function(elem, inference) {
    // If we dont already have this elem in our array .. and if the value has change$F(e)d
    if ((this.changedParams.indexOf(elem) == -1)) {
      this.changedParams.push($(elem.attr('id')));
    } else {}

    // If inferred execption code
    if (inference.hasExceptionCode) {
      elem.attr('inferredecode', inference.targetEcode); // Set exception code
    } else {
      elem.attr('inferredvalue', inference.inferredValue);
    }

  };

});

/**
 * returns a javascript object which can be used by sde-integration service
 * The object also contains a reference to the jQuery object of the input box associated with this
 * parameter. In all cases where the input box is hidden by some other control (such as chosen or tinyMCE), we send
 * the reference to the original input/select/textarea because this is the element used for form submission
 * @param - parameterId
 * A string or numeric parameterid
 */
function getInputObjectByParameterId(parameterId) {
  return (parameterInputCache[parameterId]) ? getInputObject(parameterInputCache[parameterId]) : undefined;
}

/**
 * This function expects a jquery element, and returns a javascript object, which contains all information needed by sde-integration
 */
function getInputObject(elm) {

  var input = elm.hasClass('ppu') ? jQuery('#' + elm.attr('inputId')) : elm;
  var unit = elm.hasClass('ppn') ? jQuery("#DROPDOWN_" + elm.id) : ((elm.attr('inputId') != null) ? elm : undefined);
  var obj;

  if (input.attr('parameter-id') != null) {
    var obj = {
      element: input,
      parameterId: input.attr('parameter-id'),
      parameterName: input.attr('parameter-name'),
      hasUnit: unit != null,
      isNumber: input.hasClass('ppn'),
      extractedValue: input.val(),
      extractedEcode: input.attr('ecode') > 2 ? input.attr('ecode') : undefined
    };

    if (unit != null) {
      obj.unitValue = unit.val() || input.attr('unit');
    }
  }
  return obj;
}

/** Will iterate through all input elements which have parameter-id attribute and add parameter ids
 * in an array to be used for sorting later on and keep the jquery object in a map against parameterid key */
function buildParameterInputCache() {
  jQuery('*[parameter-id]').each(function(index) {
    var elem = jQuery(this);
    var parameterId = elem.attr('parameter-id');
    parameterInputCache[parameterId] = elem;
    parameterSortOrder.push(parameterId);
  });
}

function getInferenceForParameterId(parameterId) {
  try {
    // If inference service is enabled for this category, and this parameter exists in the parameter cache,
    if (isInferenceEnabled && parameterId && parameterInputCache.hasOwnProperty(parameterId)) {

      var input = parameterInputCache[parameterId];
      if ((input.val() != '' && input.val() != 0) || input.attr('ecode') > 2) {
        // ppn is the class for all numbers, and floats
        // If its a number and element with id DROPDOWN_<id> exists it means unit is attached
        var hasUnit = input.hasClass('ppn') ? jQuery("#DROPDOWN_" + input.attr('id')).length > 0 : undefined;

        // The objective is to get a javascript object with all the required values
        var obj = {
          parameterId: input.attr('parameter-id'),
          parameterName: input.attr('parameter-name'),
          hasUnit: hasUnit,
          isNumber: input.hasClass('ppn'),
          value: input.val(),
          ecode: input.attr('ecode')
        };

        if (hasUnit) {
          obj.unitValue = input.attr('unit') || jQuery("#DROPDOWN_" + input.attr('id')).val();
        }

        // This getInference() method resides in sde-integration project
        // Should display popover here
        getInference(obj);
      } else {
        console.log('To get infernece, input must be non empty, or exception code must be marked.');
      }
    }
  } catch (e) {
    console.log('Exception in getting inference for parameterid', e);
  }

}

/**
 * Resets exception code, and removes exception code class for the input
 * @param input - A jquery object
 */
function resetExceptionCodeJQuery(input) {
  //resetting the code settings for this input field.... first removing
  //any exception code class if attached to our input element
  input.removeClass('ec_3').removeClass('ec_4').removeClass('ec_5').removeClass('ec_7').removeClass('ec_8').removeClass('ec_9').removeClass('ec_10').removeClass('ec_11');
  input.attr('ecode', '');
}

function closePopover() {
    //$('button.show-pop-iframe').webuiPopover('destroy');
  }
  /* jshint ignore:end */
