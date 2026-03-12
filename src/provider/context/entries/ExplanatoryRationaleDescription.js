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
        'best_practice': 'Best practice description',
        'business_rule': 'Business rules are defined internally within the organization. Business rules include strategically motivated regulations and relate to the overall goal of the business.',
        'norm_or_law': 'Law or norm description',
        'law_of_nature': 'Law of nature description',
        'not_specified': 'The rationale is not specified'
    };
    var defaultValue = 'Select a rationale';
    return map[rationale] || defaultValue;
}