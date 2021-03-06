/*!
 * ${copyright}
 */
jQuery.sap.require("sap.ui.model.odata.ODataUtils");

sap.ui.controller("sap.ui.core.sample.ViewTemplate.scenario.Main", {
	onInit: function () {
		var oEntityTypes = {
				selectedType: "Product",
				icon: jQuery.sap.getUriParameters().get("realOData") === "true" ?
						"sap-icon://building" : "sap-icon://record",
				types: [
					{
						type: "BusinessPartner",
						itemKey: "BusinessPartnerID",
						itemKeyType: "Edm.String",
						set: "/BusinessPartnerSet"
					},
					{
						type: "Contact",
						itemKey: "ContactGuid",
						itemKeyType: "Edm.Guid",
						set: "/ContactSet"
					},
					{
						type: "Product",
						itemKey: "ProductID",
						itemKeyType: "Edm.String",
						set: "/ProductSet"
					},
					{
						type: "SalesOrder",
						itemKey: "SalesOrderID",
						itemKeyType: "Edm.String",
						set: "/SalesOrderSet"
					}
				]
			};

		this.getView().setModel(new sap.ui.model.json.JSONModel(oEntityTypes), "ui");
	},

	//TODO clarify with UI5 Core: why can view models not be accessed in onInit?
	onBeforeRendering: function () {
		this._bindSelectInstance();
	},

	onChangeType: function (oEvent) {
		this._bindSelectInstance();
	},

	onChangeInstance: function (oEvent) {
		var sInstanceKey = this.getView().getModel("ui").getProperty("/selectedInstance"),
			oType = this._getSelectedType(),
			sPath = oType.set + "("
				+ sap.ui.model.odata.ODataUtils.formatValue(sInstanceKey, oType.itemKeyType)
				+ ")";

		//TODO improve performance, do not repeat XML templating, just change data binding!
//		this.getView().byId("detail").bindElement(sPath);
		this._showDetails(sPath);
	},

	onSourceCode: function (oEvent) {
		var oView = this.getView(),
			sSource,
			bVisible = oView.byId("toggleSourceCode").getPressed();

		oView.getModel("ui").setProperty("/codeVisible", bVisible);
		if (bVisible) {
			sSource = jQuery.sap.serializeXML(oView.byId("detail").getItems()[0]._xContent)
				.replace(/<!--.*-->/g, "") // remove comments
				.replace(/\t/g, "  ") // indent by just 2 spaces
				.replace(/\n\s*\n/g, "\n"); // remove empty lines
			oView.getModel("ui").setProperty("/code",
				"<pre><code>" + jQuery.sap.encodeHTML(sSource) + "</code></pre>");
		}
	},

	_bindSelectInstance: function() {
		var oBinding,
			oType = this._getSelectedType(),
			oControl = this.getView().byId("selectInstance");

		oControl.bindAggregation("items", {
			path: oType.set,
			template: new sap.ui.core.ListItem({
				text: "{" + oType.itemKey + "}",
				key: "{" + oType.itemKey + "}"
			})
		});

		oBinding = oControl.getBinding("items");
		oBinding.attachDataReceived(
			function onDataReceived() { //select first instance
				this._showDetails(oBinding.getContexts()[0].getPath());
				oBinding.detachDataReceived(onDataReceived, this);
			},
			this);
	},

	_getSelectedType: function () {
		var oView = this.getView(),
			aTypes = oView.getModel("ui").getProperty("/types");

		for (i = 0; i < aTypes.length; i += 1) {
			if (aTypes[i].type === oView.getModel("ui").getProperty("/selectedType")) {
				return aTypes[i];
			}
		}
	},

	_showDetails: function (sPath) {
		var oDetailView,
			sEntityMetadataPath,
			oView = this.getView(),
			oMetaContext,
			oMetaModel = oView.getModel().getMetaModel(),
			sSelectedType = this._getSelectedType().type,
			i;

		jQuery.each(oMetaModel.getObject("/dataServices/schema/0/entityType"),
			function (i, oEntity) {
				if (oEntity.name === sSelectedType) {
					sEntityMetadataPath = "/dataServices/schema/0/entityType/" + i;
				}
			}
		);

		oMetaContext = oMetaModel.createBindingContext(sEntityMetadataPath);
		oDetailView = sap.ui.view({
			preprocessors: {
				xml: {
					bindingContexts: {meta: oMetaContext},
					models: {meta: oMetaModel}
				}
			},
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.scenario.Detail"
		});

		oDetailView.bindElement(sPath);
		oView.byId("detail").destroyItems().addItem(oDetailView);
		this.onSourceCode();
	}
});
