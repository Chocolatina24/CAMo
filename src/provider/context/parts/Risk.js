import { DropdownButton } from '@bpmn-io/properties-panel';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import './Dropdown.css'


export default function(element) {

  return [
    {
      id: 'risk_of_change',
      element,
      component: Risk,
    }
  ];
}

function Risk(props){

  const { element} = props;
  const modeling = useService('modeling');
  const menuItems = [
    {
      entry: "Data risk",
      action: () => modeling.updateProperties(element,
     {
      risk: "Data risk"
    })
    },
    {
      entry: "Goal risk",
      action: () => modeling.updateProperties(element,
     {
      risk: "Goal risk"
    })
    },
    {
      entry: "Organizaitonal risk",
      action: () => modeling.updateProperties(element,
     {
      risk: "Organizaitonal risk"
    })
    },
    {
      entry: "Structural risk",
      action: () => modeling.updateProperties(element,
     {
      risk: "Structural risk"
    })
    },
    {
      entry: "Technology risk",
      action: () => modeling.updateProperties(element,
     {
      risk: "Technology risk"
    })
    }
  ]


   return html`<${DropdownButton}
    children=${"Risk of change"}
    menuItems=${menuItems}
    className=${"my-custom-dropdown"}
  />`;
}