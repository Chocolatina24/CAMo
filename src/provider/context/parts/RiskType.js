import { DropdownButton } from '../../../components/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../components/Dropdown.css';


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
  const currentRiskType = element.businessObject?.risk || "Select a risk type";
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
      entry: "Organizational risk",
      action: () => modeling.updateProperties(element,
     {
      risk: "Organizational risk"
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
    selectedValue=${currentRiskType}
    menuItems=${menuItems}
    className=${"my-custom-dropdown"}
  />`;
}