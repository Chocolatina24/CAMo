import $ from 'jquery';

//Global flag for warning visibility, by default warnings are visible
export let showWarnings = true;

export function setupShowWarningsButton(applyWarningHighlight, showWarningText) {
    const showWarningsButton = $('#js-warning-button');
    // Initialize button text
    showWarningsButton.text('Hide Warnings');
    const warningText = $('#js-warning-text');
    warningText.hide();

    showWarningsButton.click(function(e) {
        e.preventDefault();
        // Toggle the flag and the text depending on if the warnings are visible or not
        showWarnings = !showWarnings;
        showWarningsButton.text(showWarnings ? 'Hide Warnings' : 'Show Warnings');
        applyWarningHighlight();
        showWarningText();

    });
}

export function applyWarningHighlight(bpmnModeler){

    const elementRegistry = bpmnModeler.get('elementRegistry');
    const eventBus = bpmnModeler.get('eventBus');
    const arrows = [];
    elementRegistry.forEach(function(element){
        if(element.type === 'bpmn:SequenceFlow'){
            arrows.push(element);
        }
    });
    // Notify that elements have changed so the warning highlight can be applied or removed
    eventBus.fire('elements.changed', { elements: arrows });
}

export function showWarningText(bpmnModeler) {
    const warningText = $('#js-warning-text');
    const elementRegistry = bpmnModeler.get('elementRegistry');
    const hasUnassignedRationale = elementRegistry.filter(function(element){
        return element.type === 'bpmn:SequenceFlow' &&
         (element.businessObject?.rationale === 'not_specified'|| element.businessObject?.rationale === undefined) &&
         element.source && element.source.businessObject && typeIsActivity(element.source.businessObject.$type) &&
         element.target && element.target.businessObject && typeIsActivity(element.target.businessObject.$type);
    }).length > 0;

    if(showWarnings && hasUnassignedRationale) {
        warningText.show();
    } else {
        warningText.hide();
    }
}

function typeIsActivity(type){
      const activityTypes = [
        'bpmn:Task',
        'bpmn:SubProcess',
        'bpmn:CallActivity',
        'bpmn:ManualTask',
        'bpmn:UserTask',
        'bpmn:ServiceTask',
        'bpmn:ScriptTask',
        'bpmn:BusinessRuleTask',
        'bpmn:SendTask',
        'bpmn:ReceiveTask'
    ];
    return activityTypes.includes(type);
}