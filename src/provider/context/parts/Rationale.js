import { DropdownButton } from '../../../components/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../components/Dropdown.css';
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
  const currentExplanatoryRationale = element.businessObject?.rationale || "Select a rationale";
  const menuItems = [
    {
      entry: "Best practice",
      action: () => modeling.updateProperties(element,
     {
      rationale: "Best practice"
    })
    },
    {
      entry: "Business rule",
      action: () => modeling.updateProperties(element,
     {
      rationale: "Business rule"
    })
    },
    {
      entry: "Norm or Law",
      action: () => modeling.updateProperties(element,
     {
      rationale: "Norm or Law"
    })
    },
    {
      entry: "Law of Nature",
      action: () => modeling.updateProperties(element,
     {
      rationale: "Law of Nature"
    })
    }
  ]


   return html`<${DropdownButton}
    selectedValue=${currentExplanatoryRationale}
    menuItems=${menuItems}
    className=${"my-custom-dropdown"}
  />`;
}