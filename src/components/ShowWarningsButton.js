import $ from 'jquery';

// Warning button components that allows to show/hide warnings for 
// sequence flows without a rationale, or an unspecified rationale

//Global flag for warning visibility, by default warnings are visible
export let showWarnings = true;

export function setupShowWarningsButton(applyWarningHighlight, showWarningText) {
    const showWarningsButton = $('#js-warning-button');
    // Initialize button text and warning text next to it
    showWarningsButton.text('Hide warnings');
    const warningText = $('#js-warning-text');
    warningText.show();

    // Toggle warning visibility and update button text on click
    showWarningsButton.click(function(e) {
        e.preventDefault();
        showWarnings = !showWarnings;
        showWarningsButton.text(showWarnings ? 'Hide warnings' : 'Show warnings');
        applyWarningHighlight();
        showWarningText();

    });
}

export function applyWarningHighlight(bpmnModeler){

    const elementRegistry = bpmnModeler.get('elementRegistry');
    const eventBus = bpmnModeler.get('eventBus');
    const arrows = [];
    // Get all the arrows in the model
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
    // Check if there are any arrows (sequence flows) connecting activities that do not have a rationale assigned
    const hasUnassignedRationale = elementRegistry.filter(function(element){
        const rationale = element.businessObject?.rationale || 'not_specified';
        const connectsActivities = activityTypes.includes(element.source?.businessObject?.$type) && activityTypes.includes(element.target?.businessObject?.$type);

        return element.type === 'bpmn:SequenceFlow' && rationale === 'not_specified' && connectsActivities;
    }).length > 0;    

    // Show or hide warning text based on global flag and wether a rationale is assigned or not
    if(showWarnings && hasUnassignedRationale) {
        warningText.show();
    } else {
        warningText.hide();
    }
}
