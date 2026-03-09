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
  const currentRiskType = element.businessObject?.risk_type || "Select a risk type";
  const menuItems = [
    {
      entry: "Data risk",
      action: () => modeling.updateProperties(element,
     {
      risk_type: "Data risk"
    })
    },
    {
      entry: "Goal risk",
      action: () => modeling.updateProperties(element,
     {
      risk_type: "Goal risk"
    })
    },
    {
      entry: "Organizational risk",
      action: () => modeling.updateProperties(element,
     {
      risk_type: "Organizational risk"
    })
    },
    {
      entry: "Structural risk",
      action: () => modeling.updateProperties(element,
     {
      risk_type: "Structural risk"
    })
    },
    {
      entry: "Technology risk",
      action: () => modeling.updateProperties(element,
     {
      risk_type: "Technology risk"
    })
    }
  ]


   return html`<${DropdownButton}
    selectedValue=${currentRiskType}
    menuItems=${menuItems}
    className=${"my-custom-dropdown"}
  />`;
}