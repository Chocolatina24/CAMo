import { html } from 'htm/preact';
import { DescriptionEntry } from '@bpmn-io/properties-panel';

export default function(element) {

  return [
    {
      id: 'description_explanatory_rationale',
      element,
      component: DescriptionExplanatoryRationale,
    }
  ];
}

function DescriptionExplanatoryRationale(props){
    const { element } = props;
    const rationaleDescription = mapRationaleToDescription(element.businessObject?.rationale);

    //Return a text description for each rationale
    return html`<${DescriptionEntry} element=${element} forId='explanatory_rationale' value=${rationaleDescription} />`;
}

//Helper function to map each rationale to its description
function mapRationaleToDescription(rationale) {
  const map = {
        'best_practice': 'A best practice is an approach that has been proven to be effective and is commonly accepted as a standard.',
        'business_rule': 'Business rules are defined internally within the organization. Business rules include strategically motivated regulations and relate to the overall goal of the business.',
        'norm_or_law': 'Norms and laws are defined by external authorities and not following them can lead to legal consequences.',
        'law_of_nature': 'Laws of nature are impossible to violate and trying to change them can break the process or make no sense at all.',
        'not_specified': 'The rationale is not specified.'
    };
    var defaultValue = 'Select a rationale to view its description.';
    return map[rationale] || defaultValue;
}