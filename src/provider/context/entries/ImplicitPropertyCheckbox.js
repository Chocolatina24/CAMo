import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import {CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel';

export default function(element) {

  return [
    {
      id: 'implicit_property',
      element,
      component: ImplicitProperty,
      isEdited: isCheckboxEntryEdited
    }
  ];
}

function ImplicitProperty(props){

  const { element, id} = props;
  const modeling = useService('modeling');
  const translate = useService('translate');

  const getValue = () => {
    // Return the boolean value, default to false if not set
    return element.businessObject?.implicit === true;
  };

  const setValue = (value) => {
    return modeling.updateProperties(element, {
        implicit: value
        });
    };

  //Return a checkbox entry, template reused from properties panel default entries
  return html`<${CheckboxEntry}
    element=${element}
    id=${id} 
    label=${translate('Implicit relationship')} 
    description=${translate('If checked, this activity relationship is implicit, otherwise explicit.')}
    getValue=${ getValue }
    setValue=${ setValue } 
  />`;

}