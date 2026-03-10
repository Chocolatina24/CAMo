import { is } from 'bpmn-js/lib/util/ModelUtil';

export default class CustomContextPadProvider {
  constructor(contextPad, modeling, translate, contextPadProvider) {
    this.modeling = modeling;
    this.translate = translate;
    this.defaultContextPad = contextPadProvider;
    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const { modeling, translate, defaultContextPad } = this;

    // Get default entries
    let entries = {};

    // Only add an entry for SequenceFlow toggle
    if (is(element, 'bpmn:SequenceFlow')) {
      entries['toggle-implicit'] = {
        group: 'edit',
        className: 'implicit-arrow-icon', // Custom dashed arrow icon
        title: element.businessObject.implicit ? translate('Unset Implicit Flow') : translate('Set Implicit Flow'),
        action: {
          click: function() {
            modeling.updateProperties(element, {
              //Toggle implicit property
              implicit: !element.businessObject.implicit,
              conditionExpression: undefined,
              isDefault: false
            });
          }
        }
      };
    }

    return entries;
  }
}

CustomContextPadProvider.$inject = [
  'contextPad',
  'modeling',
  'translate',
  'contextPadProvider'
];
