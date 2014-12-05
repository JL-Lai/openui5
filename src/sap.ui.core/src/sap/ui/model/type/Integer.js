/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/SimpleType'],
	function(jQuery, NumberFormat, SimpleType) {
	"use strict";


	/**
	 * Constructor for a Integer type.
	 *
	 * @class
	 * This class represents integer simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] formatting options. Supports the same options as {@link sap.ui.core.format.NumberFormat.getIntegerInstance NumberFormat.getIntegerInstance}
	 * @param {object} [oFormatOptions.source] additional set of format options to be used if the property in the model is not of type string and needs formatting as well. 
	 * 										   In case an empty object is given, the default is disabled grouping and a dot as decimal separator. 
	 * @param {object} [oConstraints] value constraints. 
	 * @param {int} [oConstraints.minimum] smallest value allowed for this type  
	 * @param {int} [oConstraints.maximum] largest value allowed for this type  
	 * @alias sap.ui.model.type.Integer
	 */
	var Integer = SimpleType.extend("sap.ui.model.type.Integer", /** @lends sap.ui.model.type.Integer.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Integer";
		}

	});

	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 */
	Integer.prototype.formatValue = function(vValue, sInternalType) {
		var iValue = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			iValue = this.oInputFormat.parse(vValue);
			if (iValue == null) {
				throw new sap.ui.model.FormatException("Cannot format float: " + vValue + " has the wrong format");
			}
		}
		switch (sInternalType) {
			case "string":
				return this.oOutputFormat.format(iValue);
			case "int":
			case "float":
			case "any":
				return iValue;
			default:
				throw new sap.ui.model.FormatException("Don't know how to format Integer to " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.parseValue
	 */
	Integer.prototype.parseValue = function(vValue, sInternalType) {
		var iResult;
		switch (sInternalType) {
			case "string":
				iResult = this.oOutputFormat.parse(String(vValue));
				if (isNaN(iResult)) {
					throw new sap.ui.model.ParseException(vValue + " is not a valid Integer value");
				}
				break;
			case "float":
				iResult = Math.floor(vValue);
				if (iResult != vValue) {
					throw new sap.ui.model.ParseException(vValue + " is not a valid Integer value");
				}
				break;
			case "int":
				iResult = vValue;
				break;
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse Integer from " + sInternalType);
		}
		if (this.oInputFormat) {
			iResult = this.oInputFormat.format(iResult);
		}				
		return iResult;
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 */
	Integer.prototype.validateValue = function(iValue) {
		if (this.oConstraints) {
			var aViolatedConstraints = [];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
						}
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new sap.ui.model.ValidateException("Validation of type constraints failed", aViolatedConstraints);
			}
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.setFormatOptions
	 */
	Integer.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Integer.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};
	
	/**
	 * Create formatters used by this type
	 * @private
	 */
	Integer.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getIntegerInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (jQuery.isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getIntegerInstance(oSourceOptions);
		}
	};

	return Integer;

}, /* bExport= */ true);
