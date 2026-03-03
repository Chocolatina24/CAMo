import { html } from 'htm/preact';
import { DescriptionEntry } from '@bpmn-io/properties-panel';

export default function(element) {

  return [
    {
      id: 'description_rationale',
      element,
      component: DescriptionRationale,
    }
  ];
}

function DescriptionRationale(props){
    const { element } = props;
    const rationaleDescription = mapRationaleToDescription(element.businessObject?.rationale || "Select a rationale");
    return html`<${DescriptionEntry} element=${element} forId="explanatory_rationale" value=${rationaleDescription} />`;
}

function mapRationaleToDescription(rationale) {
  const map = {
        "Best practice": "Best practice description",
        "Business rule": "Business rules are defined internally within the organization. Business rules include strategically motivated regulations and relate to the overall goal of the business.",
        "Law or norm": "Law or norm description",
        "Law of nature": "Law of nature description",
        "Select a rationale": "Select a rationale"
    };
    var defaultValue = "Could not find description";
    return map[rationale] || defaultValue;
}