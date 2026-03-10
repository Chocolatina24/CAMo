import $ from 'jquery';

//Global flag for warning visibility, by default warnings are visible
export let showWarnings = true;

export function setupShowWarningsButton(applyWarningHighlight) {
    const showWarningsButton = $('#js-warning-button');
    const warningText = $('#js-warning-text');
    // Initialize button text
    showWarningsButton.text('Hide Warnings');
    warningText.show();

    showWarningsButton.click(function(e) {
        e.preventDefault();
        // Toggle the flag and the text depending on if the warnings are visible or not
        showWarnings = !showWarnings;
        showWarningsButton.text(showWarnings ? 'Hide Warnings' : 'Show Warnings');
        warningText.toggle(showWarnings);
        applyWarningHighlight();

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