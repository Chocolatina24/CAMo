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
    const riskDescription = mapRiskToDescription(element.businessObject?.risk_type);
    
    //Return a text description for each risk type
    return html`<${DescriptionEntry} element=${element} forId='risk_type' value=${riskDescription} />`;
}

//Helper function to map each risk type to its description
function mapRiskToDescription(risk) {
  const map = {
        'data_risk': 'Data risks affect data dependencies and consistency of data. Examples include data loss, data breaches, and data quality issues.',
        'goal_risk': 'Goal risks threaten the achievement of business goals.',
        'organizational_risk': 'Organizational risks threaten compliance rules and organizational policies.',
        'structural_risk': 'Structural risks affect the model\'s correctness.',
        'technology_risk': 'Technology risks affect the technical infrastructure and systems important for achieving the business goal.',
        'not_specified': 'The risk type is not specified.'
    };
    var defaultValue = 'Select a risk type to view its description.';
    return map[risk] || defaultValue;
}