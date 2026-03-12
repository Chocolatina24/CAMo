import { DropdownButton } from '../../../components/templates/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../style/Dropdown.less';
export default function(element) {

  return [
    {
      id: 'explanatory_rationale',
      element,
      component: ExplanatoryRationale,
    }
  ];
}

function ExplanatoryRationale(props){

  const { element} = props;
  const modeling = useService('modeling');

  //If a rationale has not been assigned yet, default to 'not_specified'
  /*if(!element.businessObject.rationale){
    modeling.updateProperties(element, { rationale: 'not_specified'});
  }*/
  //Get the currently assigned rationale
  const currentExplanatoryRationale = element.businessObject?.rationale || 'Select a rationale';
  //Define the items for the dropdown menu
  // 'entry' is the displayed text, but 'rationale' is the actual value of the property saved in the bpmn file
  const menuItems = [
    {
      entry: 'Best practice',
      action: () => modeling.updateProperties(element, { rationale: 'best_practice'})
    },
    {
      entry: 'Business rule',
      action: () => modeling.updateProperties(element, { rationale: 'business_rule'})
    },
    {
      entry: 'Norm or Law',
      action: () => modeling.updateProperties(element, { rationale: 'norm_or_law'})
    },
    {
      entry: 'Law of nature',
      action: () => modeling.updateProperties(element, { rationale: 'law_of_nature'})
    },
    {
      entry: 'Not specified',
      action: () => modeling.updateProperties(element, { rationale: 'not_specified'})
    }
  ]

  //Return the dropdown button with the selected value and menu items
   return html`<${DropdownButton}
    selectedValue=${mapRationaleToMenuEntry(currentExplanatoryRationale)}
    menuItems=${menuItems}
    className=${"custom-dropdown"}
  />`;
}

//Helper function to display the correct text in the dropdown when a rationale is selected
function mapRationaleToMenuEntry(explanatoryRationale) {
  switch (explanatoryRationale) {
    case 'best_practice':
      return 'Best practice';
    case 'business_rule':
      return 'Business rule';
    case 'norm_or_law':
      return 'Norm or Law';
    case 'law_of_nature':
      return 'Law of nature';
      case 'not_specified':
        return 'Not specified';
    default:
      return 'Select a rationale';
  }
}