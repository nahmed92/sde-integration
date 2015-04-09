/* jshint ignore:start */

// Global variables
var isInferenceEnabled;
var isSdeIntegrationEnabled;
var inferenceEngineId;
var sdeIntegrationBaseUrl;

var parameterInputCache;
var parameterSortOrder;

var headerSortOrder;
var parameterHeaderMap;

// On document ready,
jQuery(document).ready(function() {

  // we are setting value for isInferenceEnabled, by accessing a hidden html input field by the same id.
  isInferenceEnabled = jQuery('#inferenceEnabled').val();
  isSdeIntegrationEnabled = jQuery('#sdeIntegrationEnabled').val();
  inferenceEngineId = jQuery('#inferenceEngineId').val();
  sdeIntegrationBaseUrl = jQuery('#sdeIntegrationBaseUrl').val();

  jQuery('.show-infer-iframe').click(showInferenceIframe);
  jQuery('.show-sde-iframe').click(showSdeIframe);

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

    var elemId = elem.attr('id');
    addInferenceTag(elemId);
    elem.addClass('inferred');

    // If inferred exception code
    if (inference.hasExceptionCode) {
      elem.attr('unit', ''); // Clear value
      elem.attr('ecode', inference.targetEcode); // Set exception code
      elem.attr('inferredecode', inference.targetEcode); // Set exception code
      elem.addClass('ec_' + inference.targetEcode); // add class name for exception code
      elem.val(''); // Clear value

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
          resetExceptionCodeJQuery(unit);
          unit.attr('ecode', inference.targetEcode);
          unit.addClass('ec_' + inference.targetEcode);
          unit.val('');
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
        window.parent.tinyMCE.triggerSave();
      } else {
        var oldVal = elem.val();
        elem.val(inference.targetValue);
        // This check is only for disabled values (such as touchpad) which cannot be selected on interface,
        // but do exist in coded value list and can also be present in inference based on previously published products
        // We revert the old value if this case occurs. Very rare case, also logging it.
        if (inference.targetValue != elem.val()) {
          elem.val(oldVal);
          console.error('WARNING: Inferred value cannot be set because it doesnt exist in coded values, or is disabled', inference.targetValue);
        }
        elem.attr('inferredvalue', inference.inferredValue);
      }
      if (inference.hasUnit) {
        elem.attr('unit', inference.targetUnit);
        var unit = jQuery("#DROPDOWN_" + elemId); // Find unit if attached to this
        if (unit.length > 0) {
          unit.val(inference.targetUnit);
        }
      }
      // If this is chzn, we have to remove exception code class from chzn elements as well
      if (elem.hasClass('chsn')) {
        var div = jQuery('#' + elemId + "_chzn");
        if (div != null) {
          resetExceptionCodeJQuery(div);
          div.attr('ecode', '');
        }
      }
    }
    // If this is chzn, we have to update the div
    if (elem.hasClass('chsn')) {
      elem.trigger("liszt:updated");
    }

  };

  unsavedParam.addRepeatableInferredParameter = function(elem, inference) {

    // SDE-1820 We'll have to wrap it again in jQuery , as there are chances that object in cache is expired and new object is created
    elem = jQuery('#' + elem.attr('id'));
    var inputs = elem.closest('tr').parent().find('tr[isDeleted!="true"]').find('*[parameter-id=' + inference.parameterId + ']');
    if (inputs.length == 1 && isInputEmpty(jQuery(inputs[0]))) {
      this.addInferredParameter(elem, inference);
    } else {
      var obj = {
        hasUnit: inference.hasUnit,
        ecode: inference.targetEcode,
        value: inference.targetValue,
        unitValue: inference.targetUnit
      };
      var matches = _.find(inputs, function(input) {
        return inputMatchesObject(jQuery(input), obj);
      });

      if (matches == undefined) {
        // Add new row here
        var attId = elem.closest('tr').attr('attid');
        if (addRepeatableSet(attId) == true) {
          // By this time we should have added a row at the last index.
          var targetElem = elem.closest('tr').siblings().last().find('*[parameter-id=' + inference.parameterId + ']');
          this.addInferredParameter(targetElem, inference);
        }
      } else {
        // FIXME: This check should be moved in to sde-integration project in isSameAsExtracted method
        console.log('Skipping value because it already exists');
      }
    }
  };

  unsavedParam.rejectInferredParameter = function(elem, inference) {
    // If we dont already have this elem in our array .. and if the value has changed
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

  unsavedParam.rejectRepeatableInferredParameter = function(elem, inference) {
    // TODO: Currently we are ignoring case of rejectInference where we have repeatable parameters
    // As this has some complexity and cases are rare
  };

});

/**
 *
 * @param input - JQuery object of the input element.
 * @param obj - inference object having the three fields hasUnit, ecode, value, unitValue
 */
function inputMatchesObject(input, obj) {
  var matched = false;
  input = jQuery(input);
  if (input.attr('ecode') != undefined && input.attr('ecode') == obj.ecode) {
    matched = true;
  } else {
    if (obj.hasUnit == true) {
      var unitValue = jQuery('#DROPDOWN_' + input.attr('id')).val() || input.attr('unit');
      matched = input.val() == obj.value && unitValue == obj.unitValue;
    } else {
      matched = input.val() == obj.value;
    }
  }
  return matched;
};

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

  var input = elm.hasClass('ppu') ? jQuery('#' + elm.attr('id')) : elm;
  var unit = elm.hasClass('ppn') ? jQuery("#DROPDOWN_" + elm.attr('id')) : undefined;
  var obj;

  if (input.attr('parameter-id') != null) {
    obj = {
      element: input,
      parameterId: input.attr('parameter-id'),
      parameterName: input.attr('parameter-name'),
      hasUnit: unit != undefined && unit.length > 0,
      isNumber: input.hasClass('ppn'),
      isCoded: input.attr('coded') == 'true',
      isRepeatable: input.attr('repeatable') == 'true',
      extractedValue: normalizeSpace(input.val()),
      extractedEcode: input.attr('ecode') > 2 ? input.attr('ecode') : undefined
    };

    if (obj.hasUnit) {
      obj.unitValue = unit.val() || input.attr('unit');
    }

    obj.extractedDisplayValue = getDisplayValue(obj);

    if (obj.isRepeatable) {
      var inputs = input.closest('tr').parent().find('tr[isDeleted!="true"]').find('*[parameter-id=' + obj.parameterId + ']');
      if (inputs.length > 0) {
        // Concatenating the non-empty displayValues of all the input fields
        var map = _.map(inputs, function(elem) {
          // Setting extractedEcode
          if (jQuery(elem).attr('ecode') > 2) {
            obj.extractedEcode = jQuery(elem).attr('ecode');
          }
          return getDisplayValueByElement(jQuery(elem));
        });
        var compact = _.compact(map);
        obj.extractedDisplayValue = compact.join('<hr>');
      } else {}
    }
  }

  obj.getItem = function() {
    var item = this.parameterId + '|';
    if (this.extractedEcode > 2) {
      item += '_EX_' + this.extractedEcode;
    } else if (this.hasUnit) {
      item += this.extractedValue + ' ' + this.unitValue;
    } else {
      item += this.extractedValue;
    }
    return item;
  };
  return obj;
}

function getDisplayValueByElement(element) {
  var obj = getInputObjectByElement(element);
  return getDisplayValue(obj);
}

function getInputObjectByElement(elm) {
  var input = elm.hasClass('ppu') ? jQuery('#' + elm.attr('id')) : elm;
  var unit = elm.hasClass('ppn') ? jQuery("#DROPDOWN_" + elm.attr('id')) : undefined;
  var obj;

  if (input.attr('parameter-id') != null) {
    obj = {
      element: input,
      parameterId: input.attr('parameter-id'),
      parameterName: input.attr('parameter-name'),
      hasUnit: unit != undefined && unit.length > 0,
      isNumber: input.hasClass('ppn'),
      isCoded: input.attr('coded') == 'true',
      isRepeatable: input.attr('repeatable') == 'true',
      extractedValue: normalizeSpace(input.val()),
      extractedEcode: input.attr('ecode') > 2 ? input.attr('ecode') : undefined,
    };
    if (obj.hasUnit) {
      obj.unitValue = unit.val() || input.attr('unit');
    }
  }
  obj.getItem = function() {
    var item = this.parameterId + '|';
    if (this.extractedEcode > 2) {
      item += '_EX_' + this.extractedEcode;
    } else if (this.hasUnit) {
      item += this.extractedValue + ' ' + this.unitValue;
    } else {
      item += this.extractedValue;
    }
    return item;
  };
  return obj;
}

/** Will iterate through all input elements which have parameter-id attribute and add parameter ids
 * in an array to be used for sorting later on and keep the jquery object in a map against parameterid key */
function buildParameterInputCache() {
  parameterInputCache = {};
  parameterHeaderMap = {};
  parameterSortOrder = [];
  headerSortOrder = [];

  jQuery('*[parameter-id]').each(function(index) {
    var elem = jQuery(this);
    var parameterId = elem.attr('parameter-id');
    var headerId = elem.closest('div.header_content').attr('header-id');
    if (!_.contains(_.keys(parameterInputCache), parameterId)) {
      parameterInputCache[parameterId] = elem;
      parameterHeaderMap[parameterId] = headerId;
      parameterSortOrder.push(parameterId);
    }
  });

  // Headers
  jQuery('div.header_label').each(function(index) {
    var elem = jQuery(this);
    var headerId = elem.attr('header-id');
    var headerName = elem.text();
    headerSortOrder.push({
      headerId: headerId,
      headerName: headerName
    });
  });
}

/**
 * This function replaces new line characters ( \r \n ) with space and trims it, as its done by data_cleansing and normalizeSpace (of apache commons lang as used in sampling-service SDE)
 * This will make sure paragraph values when compared will be equal to the one received from inference service
 *
 * @param value
 * @returns
 */
function normalizeSpace(value) {
  if (typeof value == 'string') {
    return value.replace(/\r/g, ' ').replace(/\n/g, ' ').trim();
  } else {
    return value;
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

var iframeSettings = {
  placement: 'auto',
  width: 768, // Setting it at 768px to qualify for bootstrap col-sm classes
  height: 320,
  delay: 300,
  closeable: true,
  padding: false,
  multi: false,
  type: 'iframe',
  url: '//localhost/sde/#/'
};

/**
 * This event handler has to be attached to all inference buttons. We need to attach this using jQuery.
 * The button on which this handler is attached should have an attribute param-id with the parameter id on it
 */

function showInferenceIframe(e) {
  e.preventDefault();
  e.stopPropagation();
  var button = jQuery(e.currentTarget);
  var parameterId = button.attr('param-id');
  var input = button.closest('td').find('*[parameter-id=' + parameterId + ']');
  var obj = getInputObjectByElement(input);
  var productId = jQuery('#productId').val();

  if (obj.extractedValue !== '' || obj.extractedEcode !== undefined) {
    iframeSettings.title = 'Inferred Values for ' + obj.parameterName + ': ' + getDisplayValue(obj);
    iframeSettings.url = '//' + sdeIntegrationBaseUrl + '/#/infer?engineId=' + inferenceEngineId + '&analyticsKey=' + productId + '&item=' + encodeURIComponent(obj.getItem());
    iframeSettings.item = button;
    jQuery(button).webuiPopover('destroy').webuiPopover(iframeSettings).webuiPopover('toggle');
    jQuery(button).click(showInferenceIframe);
    sendEventToGA(obj);
  }
}

function showSdeIframe(e) {

  e.preventDefault();
  e.stopPropagation();
  var button = jQuery(e.currentTarget);

  var attributeId = button.attr('attribute-id');
  var element = jQuery('#attribute_source_' + attributeId);
  var productId = jQuery('#productId').val();

  iframeSettings.title = 'Smart Data Extraction for ' + element.text(); // FIXME: This is not working
  iframeSettings.url = '//' + sdeIntegrationBaseUrl + '/#/extract?attributeId=' + attributeId + '&productId=' + productId;
  iframeSettings.item = button;

  jQuery(button).webuiPopover('destroy').webuiPopover(iframeSettings).webuiPopover('toggle');
  jQuery(button).click(showSdeIframe);

}

function getDisplayValue(obj) {
  var extractedDisplayValue = '';
  if (obj.extractedEcode > 2) {
    extractedDisplayValue = jQuery("#eCodeMasterDropDown option[value='" + obj.extractedEcode + "']").text();
  } else if (obj.hasUnit) {
    extractedDisplayValue = ((obj.unitValue && obj.extractedValue == '') ? '[no value]' : obj.extractedValue) + ' ' + obj.unitValue;
  } else if (obj.extractedValue != null) {
    extractedDisplayValue = obj.extractedValue;
  }
  return extractedDisplayValue.trim();
}

function closeInferencePopover() {
  jQuery(iframeSettings.item).webuiPopover('destroy');
  jQuery(iframeSettings.item).click(showInferenceIframe);
}

function closeExtractionPopover() {
  jQuery(iframeSettings.item).webuiPopover('destroy');
  jQuery(iframeSettings.item).click(showSdeIframe);
}

function sendEventToGA(obj) {
  ga('send', 'event', {
    eventCategory: 'EditSpecs',
    eventAction: 'Infer',
    eventLabel: unsavedParam.categoryId + '|' + obj.parameterId + '|' + obj.parameterName,
    eventValue: 1
  });
}

/** adds inference tag on attribute row on which parameter is inferred **/
function addInferenceTag(elemId) {
  if (elemId.indexOf('pp_') == 0) {
    var input = jQuery('#' + elemId);
    if (!input.hasClass('inferred')) {
      input.addClass('inferred');
    }
    var attributeId = elemId.split('_')[1];
    jQuery('#att_heading_' + attributeId).parent().addClass('inferred_row');
  }
}

/**
 * removes inference tag from attribute in case all its parameters are manually
 * extracted i.e. even if 1 parameter is inferred it won't remove tag
 */
function removeInferenceTag(elem) {
  elem.removeClassName('inferred');
  var elemId = elem.id;
  if (elemId.indexOf('pp_') == 0) {
    var attributeId = elemId.split('_')[1];
    var parentDiv = jQuery('#att_heading_' + attributeId).parent();
    if (parentDiv.find('.inferred').length == 0) {
      parentDiv.removeClass('inferred_row');
    }
  }
}

function isInputEmpty(input) {
  if (input.attr('ecode') != undefined && input.attr('ecode') > 2) return false;
  else if (input.val() != '') return false;
  return true;
}

/**
 * This method will add/remove inference tag from parameter's row if its value is same as inferred
 *
 * @param elm
 */
function setInferenceTagIfRequired(elm) {
  if (valueEqualsToInferred(elm)) {
    var inputId = elm.hasClassName('ppu') ? elm.getAttribute('inputId') : elm.id;
    addInferenceTag(inputId);
  } else {
    // removing inferred class, which is attached on inferred parameter values
    var input = elm.hasClassName('ppu') ? $(elm.getAttribute('inputId')) : elm;
    removeInferenceTag(input);
  }
}

function valueEqualsToInferred(elm) {
  // if its a number
  if (elm.hasClassName('ppn')) {
    var unit = $("DROPDOWN_" + elm.id);
    var displayValue = elm.value;
    if (unit != null && !isEmpty(unit.value)) {
      displayValue += ' ' + unit.value;
    }
    if (displayValue == elm.getAttribute('inferredvalue') && !isEmpty(elm.getAttribute('inferredvalue'))) {
      return true;
    }
  } else if (elm.hasClassName('ppu')) {
    var input = $(elm.getAttribute('inputId'));
    var displayValue = input.value + ' ' + elm.value;
    if (displayValue == input.getAttribute('inferredvalue') && !isEmpty(input.getAttribute('inferredvalue'))) {
      return true;
    }
  } else if (elm.getAttribute('ecode') > 2) {
    // if its an exception code
    if (elm.getAttribute('ecode') == elm.getAttribute('inferredecode') && !isEmpty(elm.getAttribute('inferredecode'))) {
      return true;
    }
  } else {
    // if its coded/text/paragraph
    if (elm.value == elm.getAttribute('inferredvalue') && !isEmpty(elm.getAttribute('inferredvalue'))) {
      return true;
    }
  }
  return false;
}

function isEmpty(val) {
  if (val === undefined || val == null) {
    return true;
  }
  if (typeof val == 'string' && val.trim() === '') {
    return true;
  }
  return false;
}

/**
 * This method takes an attribute Id, and returns an object
 * @param attributeId
 */

function getObjectByAttributeId(attributeId) {
  var element = jQuery(getAttributeSourceElementByAttributeId(attributeId));
  var headerLabel = element.closest('tr').find('div.header_label');

  var obj = {
    attributeId: attributeId,
    productId: jQuery('#productId').val(),
    text: element.editable('getValue', true),
    headerName: headerLabel.text(),
    headerId: headerLabel.attr('header-id'),
    categoryId: jQuery('#categoryId').val(),
    categoryName: jQuery('#categoryName').val(),
  };
  return obj;
}

function getAttributeSourceElementByAttributeId(attributeId) {
    return jQuery('#attribute_source_' + attributeId).length > 0 ? jQuery('#attribute_source_' + attributeId) : undefined;
  }
  /* jshint ignore:end */
