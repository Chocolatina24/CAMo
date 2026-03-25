import { DropdownButton } from '../../../components/templates/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../style/dropdownStyle.less';

// Dropdown entry that allows the user to select a risk type for an activity relationship
// The selected risk type is saved as a property in the bpmn xml file

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

  //Get the currently assigned risk type
  const currentRiskType = element.businessObject?.risk_type || 'Select a risk type';
  //Define the items for the dropdown menu
  // 'entry' is the displayed text, but 'risk_type' is the actual value of the property saved in the bpmn xml file
  const menuItems = [
    {
      entry: 'Data risk',
      action: () => modeling.updateProperties(element, {risk_type: 'data_risk'})
    },
    {
      entry: 'Goal risk',
      action: () => modeling.updateProperties(element, {risk_type: 'goal_risk'})
    },
    {
      entry: 'Organizational risk',
      action: () => modeling.updateProperties(element, {risk_type: 'organizational_risk'})
    },
    {
      entry: 'Structural risk',
      action: () => modeling.updateProperties(element, {risk_type: 'structural_risk'})
    },
    {
      entry: 'Technology risk',
      action: () => modeling.updateProperties(element, {risk_type: 'technology_risk'})
    },
    {
      entry: 'Not specified',
      action: () => modeling.updateProperties(element, {risk_type: 'not_specified'})
    }
  ]
  //Return the dropdown button with the selected value and menu items
   return html`<${DropdownButton}
    selectedValue=${mapRiskTypeToEntry(currentRiskType)}
    menuItems=${menuItems}
    className=${'custom-dropdown'}
  />`;
}

//Helper function to display the correct text in the dropdown button for the currently selected risk type
function mapRiskTypeToEntry(riskType) {
  switch (riskType){
    case 'data_risk':
      return 'Data risk';
    case 'goal_risk':
      return 'Goal risk';
    case 'organizational_risk':
      return 'Organizational risk';
    case 'structural_risk':
      return 'Structural risk';
    case 'technology_risk':
      return 'Technology risk';
      case 'not_specified':
        return 'Not specified';
    default:
      return 'Select a risk type';
  }
}