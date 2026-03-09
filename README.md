# CAMo: The Context-Aware Modeler

A modeler that allows to provide additional context for activity relationships. It extends [bpmn-js](https://github.com/bpmn-io/bpmn-js) and [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) with custom modules.

## About

This modeler extends the basic BPMN modeler with custom properties for Sequence Flow elements that can be modified from the properties panel. The custom properties are described below.

### The properties
#### Explanatory rationale of the relationship
It describes the nature of the relationship beyond the control flow. These rationales are the reason why two activities occur in a set order in the process model. There are four possible rationales: 
- Best practice
- Business rule
- Law or norm
- Law of nature

#### Risk type of the relationship
In process redesign, changing the relationships between activities comes with a risk. It could be one of these five:
- Data risk
- Goal risk
- Organizational risk
- Structural risk
- Technology risk

#### Risk likelihood
It defines the likelihood of the risk type provided.
- Very high risk
- High risk
- Moderate risk
- Low risk

#### Implicit or explicit relationship
Relationships between activities are not always explicit, but there are still dependences and rationales behind the ordering. Therefore, a property has been added that differentiates implicit relationships from explicit ones.


These properties are persisted as an extension as part of the BPMN 2.0 document:

```
 <bpmn2:sequenceFlow id="Flow_1b7876d" sourceRef="Activity_0xwsu3r" targetRef="Activity_088cd18" context:rationale="Law of nature" context:risk_type="Organizational risk" context:risk_likelihood="Low risk" />
    <bpmn2:sequenceFlow id="Flow_0yo7kzx" sourceRef="Activity_1mb4srl" targetRef="Activity_088cd18" context:rationale="Best practice" context:risk_type="Structural risk" context:risk_likelihood="Moderate risk" context:implicit="true" />
```

### Custom modules

#### Custom properties provider
We extend the properties panel to allow editing a few custom properties: rationale, risk_type and risk_likelihood. For that, we do the following:

1. Create a custom properties provider that contains all the groups

```
export default function ContextPropertiesProvider(propertiesPanel, translate) {
	
	...
	
	this.getGroups = function(element) {
	
	...
	
		// Add custom groups 
		return function(groups) {
			
			//The properties are only for sequence flow elements
			if (is(element, 'bpmn:SequenceFlow')) {
				groups.push(explanatoryRationaleGroup(element, translate));
				groups.push(createRiskTypeGroup(element, translate));
				groups.push(createRelationshipTypeGroup(element, translate));
			}
			return groups;
		};
	};
}
  
// Register our custom context properties provider.
// Use a lower priority to ensure it is loaded after the basic BPMN properties.
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
 }
```

2. Add a group for each property

```
// Create the custom groups
function explanatoryRationaleGroup(element, translate) {
	const rationaleGroup = {
		id: 'explanatory_rationale_group',
		label: translate('Explanatory Rationale'),
		shouldOpen: true,
		tooltip: translate('Provide additional context for activity relationships'),
		entries: [
			...explanatoryRationale(element),
			...descriptionRationale(element)
		]
	};
	return rationaleGroup;
}
```

3. Add a dropdown entry to each group with a list of possible values the property can take

```
function ExplanatoryRationale(props){
	const { element} = props;
	const modeling = useService('modeling');
	const currentExplanatoryRationale = element.businessObject?.rationale || "Select a rationale";
	const menuItems = [
		{
			entry: "Best practice",
			action: () => modeling.updateProperties(element, { rationale: "Best practice" })
		},
		
		...
		
	]
	return html`<
		${DropdownButton}
		selectedValue=${currentExplanatoryRationale}
		menuItems=${menuItems}
		className=${"my-custom-dropdown"}
	/>`;
}
```

4. Add a description entry that maps to each dropdown value

```
function DescriptionRationale(props){
	
	const { element } = props;
	const rationaleDescription = [ ... ]
	
	return html`<
		${DescriptionEntry} 
		element=${element} 
		forId="explanatory_rationale" 
		value=${rationaleDescription} 
	/>`;
}

function mapRationaleToDescription(rationale) {

	const map = {
		...
		"Business rule": "Business rules are defined internally within the organization. Business rules include strategically motivated regulations and relate to the overall goal of the business.",
		
		...
	};
	var defaultValue = "Could not find description";
	return map[rationale] || defaultValue;
}
```

5. Create a moddle extension so the properties can be persisted

```
 "types": [
	{
		"name": "SequenceFlow",
		"extends": [
			"bpmn:SequenceFlow"
		],
		"properties": [
			{
			"name": "rationale",
			"isAttr": true,
			"type": "String"
		},
		{
			"name": "risk_type",
			"isAttr": true,
			"type": "String"
		},
		
		...
	}
]
```

#### Custom renderer

#### Custom context pad entries

#### Filters & warnings



## Running the project

Install all required dependencies:

```
npm install
```

Build and run the project:

```
npm start
```
## Sources

[bpmn-js](https://bpmn.io/toolkit/bpmn-js/walkthrough/)
[properties-panel](https://github.com/bpmn-io/properties-panel/tree/main)
[bpmn-js-examples](https://github.com/bpmn-io/bpmn-js-examples/tree/main)
[bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)
[diagram-js](https://github.com/bpmn-io/diagram-js)

## License

MIT