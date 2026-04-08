# CAMo: The Context-Aware Modeler

A modeler that allows to provide additional context for activity relationships. It extends [bpmn-js](https://github.com/bpmn-io/bpmn-js) and [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) with custom modules.

## About

This modeler extends the basic BPMN modeler with custom properties for Sequence Flow elements that can be modified from the properties panel. This is with the purpose of providing additional context for activity relationships, which are visually represented by the arrows (sequence flows). The custom properties are described below.

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
Relationships between activities are not always explicit, but there are still dependences and rationales behind the ordering. Therefore, a property has been added that differentiates implicit relationships from explicit ones. They are also visually differentiated by their shape, implicit arrows have a dashed pattern.


All the properties mentioned above are persisted as an extension as part of the BPMN 2.0 XML file:

```
 <bpmn2:sequenceFlow id="Flow_1b7876d" sourceRef="Activity_0xwsu3r" targetRef="Activity_088cd18" context:rationale="Law of nature" context:risk_type="Organizational risk" context:risk_likelihood="Low risk" />
    <bpmn2:sequenceFlow id="Flow_0yo7kzx" sourceRef="Activity_1mb4srl" targetRef="Activity_088cd18" context:rationale="Best practice" context:risk_type="Structural risk" context:risk_likelihood="Moderate risk" context:implicit="true" />
```

## Development of Custom Modules

#### Folder structure

```
resources/                   #Custom dashed arrow icon & basic BPMN XML to load on start

src/
  components/                # React UI components
	templates/
	  DropdownButton.js      # Dropdown entry template for properties panel
	FilterMenu.js            # Filter menu component logic
	ShowWarningsButton.js    # Warning highlight logic
	
  descriptors/
    moddle/
	  context.json           # JSON descriptor so custom properties are persisted on export
	  
  modules/
    extensions/
      contextpad/            # Context pad with custom toggle implicit entry
      renderer/              # Renderer for rationale & warning colors + dashed arrows
      
  provider/
    context/
      entries/                 # Custom entries for property groups (dropdown, description text, checkbox)
      ContextPropertiesProvider.js  # Properties provider to insert custom groups and entries in properties panel
      
  style/             # CSS styles
  
  app.js              # Main app entry
  index.html          # HTML entry  
```
#### Custom Properties Provider
We extend the properties panel to allow editing a few custom properties: rationale, risk_type, risk_likelihood, and implicit. For that, we do the following:

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
			//There is one dropdown entry to specify the rationale, and one text entry for its description
			...explanatoryRationale(element),
			...descriptionRationale(element)
		]
	};
	return rationaleGroup;
}
```

3. Add dropdown entries to each group with a list of possible values the property can take

```
function ExplanatoryRationale(props){

	...

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

Note that for the 'implicit' property group (relationshipType group in the code) there is no dropdown entry, only a checkbox entry since the property is boolean: a sequence flow is either implicit (checked) or explicit (unchecked).

Each group can have more than one entry, as is the case with the 'risk and likelihood' group that contains two dropdown entries: one for specifying the risk, and one for its likelihood. Additionally, the 'explanatory rationale' and 'risk and likelihood' groups also contain text entries.

#### Custom renderer
To have custom colors and dashed arrows persisted when exporting as SVG file, we create a custom renderer. Plus, this renderer is also used to to render unassigned arrows in red when the warnings are activated, or to render them back to their correct coloring if the warnings are off.

```

export default class ImplicitArrowRenderer extends BaseRenderer {
	
	...
	
	canRender(element) {
		// Only render sequence flows differently, other elements are rendered by the default BPMN renderer
		return element.type === 'bpmn:SequenceFlow';
	}
	
	drawConnection(visuals, connection) {
		//Get rationale and implicit properties of the connection to determine styling
		const rationale = ...
		const isImplicit = ...
		
		// Get colors for the arrows based on their rationale
		let color;
		switch (rationale) {
			// Color palette from https://davidmathlogic.com/colorblind
			case 'best_practice':
				color = '#44AA99';
			break;
			
			...
			
			default: color = 'black';
		}
		
		// Color only if both source and target are activity elements
		const activityTypes = [
			'bpmn:Task',
			...
		];
		
		...
		// Arrows should be highlighted if rationale is not assigned, warnings are enabled, and the arrow connects two activities
		const shouldHighlight = showWarnings && isRationaleNotAssigned && connectsActivities;
		
		// If rationale is not assigned and warnings are enabled, use red color and thicker stroke to highlight
		const attrs = assign({
			stroke: shouldHighlight ? 'red' : color,
			strokeWidth: shouldHighlight ? 3 : 2,
		});
		
		...
		
		 // If arrow is implicit make it dashed
		path.setAttribute('stroke-dasharray', isImplicit ? '10,4,2,4' : '');
		
		// If rationale is not assigned and warnings are enabled, add a warning highlight animation (defined in css file)
		
		...
		
		return path;
	}
}
```

#### Custom context pad entries

To create a context pad entry that allows to toggle an arrow from implicit to explicit or viceversa, we create a custom context pad provider that returns the default entries plus our custom entry.

```
getContextPadEntries(element) {

	...
	// Get default entries
	let entries = {};
	
	// Only add an entry for SequenceFlow toggle
	if (is(element, 'bpmn:SequenceFlow')) {
	
		entries['toggle-implicit'] = {
			group: 'edit',
			className: 'implicit-arrow-icon', // Custom dashed arrow icon
			
			...
			action: {
				click: function() {
					modeling.updateProperties(element, {
						// Toggle implicit property
						implicit: !element.businessObject.implicit,
						
						...
						
					});
				}
			}
		};
	}
	return entries;
}
```

#### Filters

For the filters we create a filter menu with checkboxes that, when checked, show the corresponding arrows. Each filter checkbox has an icon next to it to act as a legend indicating the colors or the shapes of the arrows that will be shown/hidden.

```
 <div class="filter-menu">
	 <button id="js-filter-toggle" class="filter-toggle">Filters</button>
	 <div class="filter-content" id="js-filter-content">
		<label>
			<span class="implicit-icon"></span>
			<input type="checkbox" class="filter-checkbox" value="Implicit" checked> Show Implicit 
		</label>
		<label>
			<span class="rationale-color rationale-color-best-practice"></span>
			<input type="checkbox" class="filter-checkbox" value="Best practice" checked> Show Best Practice
		</label>
		
		...
		
	</div>
</div>
```

Important: The 'show implicit' checkbox overrides the rationale filters for implicit arrows, i.e., when a sequence flow is implicit and 'show implicit' is unchecked, it won't be displayed regardless of the active rationale filters.

#### Warnings
The warning button toggles the visibility of the warnings. This applies to sequence flows that do not have a rationale assigned, or have 'not specified' as their rationale. A warning text is displayed next to the button explaining the missing context, and the corresponding arrows are highlighted with a red color and a pulsing animation.

```
showWarningsButton.click(function(e) {
	e.preventDefault();
	//Toggle the warnings on or off
	showWarnings = !showWarnings;
	//Change the text every time the button is clicked
	showWarningsButton.text(showWarnings ? 'Hide warnings' : 'Show warnings');
	//Apply the highlight to the corresponding arrows
	applyWarningHighlight();
	//Show or hide the text 'Warning: you have relationships with unassigned rationale'
	showWarningText();
});
```

## Running the project

This is necessary to run the project locally, for the website version visit https://context-aware-modeler.vercel.app/

##### Prerequisites:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

Clone the repository or download the code:

```
git clone https://github.com/INSM-TUM-Teaching/CAMo-context-aware-modeler-for-BPMN.git
```

Install all required dependencies:

```
npm install
```

Build and run the project:

```
npm start
```

The website should then be available at http://localhost:8080/


## Known Issues

When toggling the warnings on/off and exporting immediately after, the arrows with unassigned rationale will be rendered with the previous warning state (i.e. if it was on but then turned off before exporting, they will be red).
Workaround: toggle the warnings on/off as desired for the export, then create or modify an element. This triggers a complete re-render and will export the desired state.

In the custom context pad entry, the dashed arrow icon disappears on hover. This is a visual issue, the button toggle still works as expected.

## Sources

[bpmn-js](https://bpmn.io/toolkit/bpmn-js/walkthrough/)

[properties-panel](https://github.com/bpmn-io/properties-panel/tree/main)

[bpmn-js-examples](https://github.com/bpmn-io/bpmn-js-examples/tree/main)

[bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)

[diagram-js](https://github.com/bpmn-io/diagram-js)

## License

MIT
