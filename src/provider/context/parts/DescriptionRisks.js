import { html } from 'htm/preact';
import { DescriptionEntry } from '@bpmn-io/properties-panel';

export default function(element) {

  return [
    {
      id: 'description_risks',
      element,
      component: DescriptionRisks,
    }
  ];
}

function DescriptionRisks(props){
    const { element } = props;
    const riskDescription = mapRiskToDescription(element.businessObject?.risk_type || "Select a risk type");
    return html`<${DescriptionEntry} element=${element} forId="risk_type" value=${riskDescription} />`;
}

function mapRiskToDescription(risk) {
  const map = {
        "Data risk": "Data risk description",
        "Goal risk": "Goal risk description",
        "Organizational risk": "Organizational risk description",
        "Structural risk": "Structural risk description",
        "Technology risk": "Technology risk description",
        "Select a risk type": "Select a risk type"
    };
    var defaultValue = "Could not find description";
    return map[risk] || defaultValue;
}