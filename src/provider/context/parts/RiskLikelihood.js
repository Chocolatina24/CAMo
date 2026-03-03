import { DropdownButton } from '../../../components/DropdownButton';
import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import '../../../components/Dropdown.less';


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
  const currentRiskLikelihood = element.businessObject?.risk_likelihood || "Select risk likelihood";
  const menuItems = [
     {
      entry: "Very high risk",
      action: () => modeling.updateProperties(element,
     {
      risk_likelihood: "Very high risk"
    })
    },
    {
      entry: "High risk",
      action: () => modeling.updateProperties(element,
     {
      risk_likelihood: "High risk"
    })
    },
    {
      entry: "Moderate risk",
      action: () => modeling.updateProperties(element,
     {
      risk_likelihood: "Moderate risk"
    })
    },
    {
      entry: "Low risk",
      action: () => modeling.updateProperties(element,
     {
      risk_likelihood: "Low risk"
    })
    }
  ]


   return html`<${DropdownButton}
    selectedValue=${currentRiskLikelihood}
    menuItems=${menuItems}
    className=${"my-custom-dropdown"}
  />`;
}