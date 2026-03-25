import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { showWarnings } from '../../../components/ShowWarningsButton';
import { assign } from 'min-dash';

// Custom renderer extension to differentiate arrows based on their rationale and implicit/explicit status
// Note that the styling made by the custom renderer is persisted when the diagram is exported as svg
// Code modified from https://github.com/bpmn-io/bpmn-js-task-priorities/blob/main/lib/priorities/ColorRenderer.js

// Priority is higher than the default BPMN renderer to ensure our styles are applied
const HIGH_PRIORITY = 1500;

export default class ImplicitArrowRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.bpmnRenderer = bpmnRenderer;
    }

    canRender(element) {
        // Only render sequence flows differently, other elements are rendered by the default BPMN renderer
        return element.type === 'bpmn:SequenceFlow';
    }

    drawConnection(visuals, connection) {
        //Get rationale and implicit properties of the connection to determine styling
        const rationale = connection.businessObject?.rationale || 'not_specified';
        const isImplicit = connection.businessObject?.implicit || false;

        let color;
        switch (rationale) {
            // Color palette from https://davidmathlogic.com/colorblind
            case 'best_practice':
                color = '#44AA99';
                break;
            case 'business_rule':
                color = '#88CCEE'; 
                break;
            case 'norm_or_law':
                color = '#AA4499';
                break;
            case 'law_of_nature':
                color = '#EFD036';
                break;
            case 'not_specified':
                color = 'black';
                break;
            default: color = 'black';
        }
        // Highlight only if both source and target are activity elements
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
        const isSourceActivity = connection.source && connection.source.businessObject && activityTypes.includes(connection.source.businessObject.$type);
        const isTargetActivity = connection.target && connection.target.businessObject && activityTypes.includes(connection.target.businessObject.$type);
        const isRationaleNotAssigned = rationale === 'not_specified' || !rationale;
        const connectsActivities = isSourceActivity && isTargetActivity;
        // Arrows should be highlighted if rationale is not assigned, warnings are enabled, and the arrow connects two activities
        const shouldHighlight = showWarnings && isRationaleNotAssigned && connectsActivities;

        // If rationale is not assigned and warnings are enabled, use red color and thicker stroke to highlight
        const attrs = assign({
            stroke: shouldHighlight ? 'red' : color,
            strokeWidth: shouldHighlight ? 3 : 2,
        });

        const path = this.bpmnRenderer.drawConnection(visuals, connection, attrs);

        if(path && path.setAttribute) {
            // If arrow is implicit make it dashed
            path.setAttribute('stroke-dasharray', isImplicit ? '10,4,2,4' : '');
            // If rationale is not assigned and warnings are enabled, add a warning highlight animation
            if(shouldHighlight) {
                path.classList.add('warning-highlight');
            } else {
                path.classList.remove('warning-highlight');
            }
        }
        return path;
    }
}

ImplicitArrowRenderer.$inject = [ 'eventBus', 'bpmnRenderer' ];
