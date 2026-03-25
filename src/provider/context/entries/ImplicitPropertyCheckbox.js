import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import {CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel';

// Properties panel entry to toggle the 'implicit' property of an activity relationship
// See also the CustomContextPadProvider for another way to toggle the property directly from the context pad

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

  //Return a checkbox entry, template used from properties panel default entries
  return html`<${CheckboxEntry}
    element=${element}
    id=${id} 
    label=${translate('Implicit relationship')} 
    description=${translate('If checked, this activity relationship is implicit (activities not connected in the control flow), otherwise explicit.')}
    getValue=${ getValue }
    setValue=${ setValue } 
  />`;

}