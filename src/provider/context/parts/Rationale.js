import { DropdownButton } from '@bpmn-io/properties-panel';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import './Dropdown.css';
export default function(element) {

  return [
    {
      id: 'explanatory_rationale',
      element,
      component: Rationale,
    }
  ];
}

function Rationale(props){

  const { element} = props;
  const modeling = useService('modeling');
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
    children=${"Explanatory Rationale"}
    menuItems=${menuItems}
    className=${"my-custom-dropdown"}
  />`;
}