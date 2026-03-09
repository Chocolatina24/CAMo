import { DropdownButton } from '../../../components/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../components/Dropdown.less';


export default function(element) {

  return [
    {
      id: 'risk_type',
      element,
      component: RiskType,
    }
  ];
}

function RiskType(props){

  const { element} = props;
  const modeling = useService('modeling');

    //If a risk type has not been assigned yet, default to 'not_assigned'
  if(!element.businessObject.risk_type) {
    modeling.updateProperties(element, { risk_type: 'not_assigned'});
  }
  //Get the currently assigned risk type
  const currentRiskType = element.businessObject?.risk_type;
  //Define the items for the dropdown menu
  // 'entry' is the displayed text, but 'risk_type' is the actual value of the property saved in the bpmn file
  const menuItems = [
    {
      entry: "Data risk",
      action: () => modeling.updateProperties(element, {risk_type: "data_risk"})
    },
    {
      entry: "Goal risk",
      action: () => modeling.updateProperties(element, {risk_type: "goal_risk"})
    },
    {
      entry: "Organizational risk",
      action: () => modeling.updateProperties(element, {risk_type: "organizational_risk"})
    },
    {
      entry: "Structural risk",
      action: () => modeling.updateProperties(element, {risk_type: "structural_risk"})
    },
    {
      entry: "Technology risk",
      action: () => modeling.updateProperties(element, {risk_type: "technology_risk"})
    },
    {
      entry: "Not assigned",
      action: () => modeling.updateProperties(element, {risk_type: "not_assigned"})
    }
  ]
  //Return the dropdown button with the selected value and menu items
   return html`<${DropdownButton}
    selectedValue=${mapRiskTypeToEntry(currentRiskType)}
    menuItems=${menuItems}
    className=${"custom-dropdown"}
  />`;
}

//Helper function to display the correct text in the dropdown when a risk type is selected
function mapRiskTypeToEntry(riskType) {
  switch (riskType){
    case "data_risk":
      return "Data risk";
    case "goal_risk":
      return "Goal risk";
    case "organizational_risk":
      return "Organizational risk";
    case "structural_risk":
      return "Structural risk";
    case "technology_risk":
      return "Technology risk";
    default:
      return "Not assigned";
  }
}