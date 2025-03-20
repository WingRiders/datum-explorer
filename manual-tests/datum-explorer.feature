Feature: Datum explorer

	Scenario: Select schema
		Given User is on the main app page
		When User clicks the Schema select dropdown field
		Then All schemas from cardano-datum-registry (https://github.com/WingRiders/cardano-datum-registry) are shown in the dropdown
		* User can select a schema by clicking on it
		* The schema is selected
		* The schema is still selected when user reloads the page

	Scenario: Parse valid datum CBOR
		Given User selected the indigo/CDPContent schema
		When User inserts the following CBOR into the Datum input field: d8799fd8799fd8799f581c767d3148ed3c84d3ba32b8892a037a14c603cd2e236d36b612d3d76bff4469455448190bd3d8799f1b000001948ea3b1401b0168de1a1f9c4e52ffffff
		Then The app displays the parsed datum with following values:
			- owner: 767d3148ed3c84d3ba32b8892a037a14c603cd2e236d36b612d3d76b
			- iAsset: 69455448
			- mintedAmount: 3027
			- accumulatedFees:
			- lastUpdated: 1737559880000
			- iAssetAmount: 101575195396689490

	Scenario: Parse invalid datum CBOR
		Given User selected the indigo/CDPContent schema
		When User inserts the following CBOR into the Datum input field: d8799fd8799fd8799f581c767d3148ed3c84d3ba32b8892a037a14c603cd2e236d36b612d3d76bff4469455448190bd3d8799f1b000001948ea3b1401b0168de1a1f9c4e52fffff
		Then The app displays an error message "Error while parsing datum - CBOR is not a hex string"

	Scenario: Add new local schema
		When User clicks the Schema select dropdown and then the "Add new local schema" option
		* Enter the schema name
		* Enters a valid schema CDDL (examples can be found in https://github.com/WingRiders/cardano-datum-registry/tree/main/projects)
		* Clicks the "Add schema" button
		Then The new local schema is successfully added
		* The new schema is automatically selected
		* The new schema is under "Your local schemas" in the Schema select dropdown

	Scenario: Edit local schema
		Given User has a local schema created
		When User clicks the edit icon button of the local schema in the Schema select dropdown
		* Edits the schema name and/or the schema CDDL
		* Clicks the "Save" button
		Then The local schema is updated in "Your local schemas"

	Scenario: Delete local schema
		Given User has a local schema created
		When User clicks the edit icon button of the local schema in the Schema select dropdown
		* Clicks the "Delete" button
		* Confirms the deletion
		Then The local schema is deleted

	Scenario: Auto schema detection - matching schema
		Given User selects the "Detect schema" option in the Schema select dropdown
		When User inserts the following CBOR into the Datum input field: d8799fd8799fd8799f581c767d3148ed3c84d3ba32b8892a037a14c603cd2e236d36b612d3d76bff4469455448190bd3d8799f1b000001948ea3b1401b0168de1a1f9c4e52ffffff
		Then The app displays the parsed datum with the "CDPContent (Indigo)" schema name and with following values:
			- owner: 767d3148ed3c84d3ba32b8892a037a14c603cd2e236d36b612d3d76b
			- iAsset: 69455448
			- mintedAmount: 3027
			- accumulatedFees:
			- lastUpdated: 1737559880000
			- iAssetAmount: 101575195396689490

	Scenario: Auto schema detection - no matching schemas
		Given User selects the "Detect schema" option in the Schema select dropdown
		When User inserts the following CBOR into the Datum input field: d8799fd8799fd8799f581c767d3148ed3c84d3ba32b8892a037a14c603cd2e236d36b612d3d76bff4469455448190bd3d8799f1b000001948ea3b1401b0168de1a1f9c4e52fffff
		Then The app displays an error message "The given datum cannot be parsed by any of the available schemas."
