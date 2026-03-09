import { html } from 'htm/preact';
import { DescriptionEntry } from '@bpmn-io/properties-panel';

export default function(element) {

  return [
    {
      id: 'description_risk_type',
      element,
      component: DescriptionRiskType,
    }
  ];
}

function DescriptionRiskType(props){
    const { element } = props;
    const riskDescription = mapRiskToDescription(element.businessObject?.risk_type || "Select a risk type");
    
    //Return a text description for each risk type
    return html`<${DescriptionEntry} element=${element} forId="risk_type" value=${riskDescription} />`;
}

//Helper function to map each risk type to its description
function mapRiskToDescription(risk) {
  const map = {
        "data_risk": "Data risk description",
        "goal_risk": "Goal risk description",
        "organizational_risk": "Organizational risk description",
        "structural_risk": "Structural risk description",
        "technology_risk": "Technology risk description",
        "not_assigned": "Select a risk type"
    };
    var defaultValue = "Could not find description";
    return map[risk] || defaultValue;
}