import { DropdownButton } from '../../../components/templates/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../style/Dropdown.less';


export default function(element) {

  return [
    {
      id: 'risk_likelihood',
      element,
      component: RiskLikelihood,
    }
  ];
}

function RiskLikelihood(props){

  const { element} = props;
  const modeling = useService('modeling');
  //If a risk likelihood has not been assigned yet, default to 'not_assigned'
  if(!element.businessObject.risk_likelihood) { 
    modeling.updateProperties(element, { risk_likelihood: 'not_assigned'});
  }
  //Get the currently assigned risk likelihood
  const currentRiskLikelihood = element.businessObject?.risk_likelihood;
  //Define the items for the dropdown menu
  // 'entry' is the displayed text, but 'risk_likelihood' is the actual value of the property saved in the bpmn file
  const menuItems = [
     {
      entry: "Very high risk",
      action: () => modeling.updateProperties(element, { risk_likelihood: "very_high_risk"})
    },
    {
      entry: "High risk",
      action: () => modeling.updateProperties(element, { risk_likelihood: "high_risk"})
    },
    {
      entry: "Moderate risk",
      action: () => modeling.updateProperties(element, { risk_likelihood: "moderate_risk"})
    },
    {
      entry: "Low risk",
      action: () => modeling.updateProperties(element, { risk_likelihood: "low_risk"})
    },
    {
      entry: "Not assigned",
      action: () => modeling.updateProperties(element, { risk_likelihood: "not_assigned"})
    }
  ]

  //Return the dropdown button with the selected value and menu items
   return html`<${DropdownButton}
    selectedValue=${mapRiskLikelihoodToEntry(currentRiskLikelihood)}
    menuItems=${menuItems}
    className=${"custom-dropdown"}
  />`;
}

//Helper function to display the correct text in the dropdown when a risk likelihood is selected
function mapRiskLikelihoodToEntry(riskLikelihood) {
  switch (riskLikelihood) {
    case 'very_high_risk':
      return 'Very high risk';
    case 'high_risk':
      return 'High risk';
    case 'moderate_risk':
      return 'Moderate risk';
    case 'low_risk':
      return 'Low risk';
      case 'not_assigned':
        return 'Not assigned';
    default:
      return 'Not assigned';
  }
}