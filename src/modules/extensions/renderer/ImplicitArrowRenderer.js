import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { showWarnings } from '../../../components/ShowWarningsButton';
import { assign } from 'min-dash';
import { useService } from 'bpmn-js-properties-panel';


const HIGH_PRIORITY = 1500;

export default class ImplicitArrowRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.bpmnRenderer = bpmnRenderer;
    }

    canRender(element) {
        // Only render sequence flows
        return element.type === 'bpmn:SequenceFlow';
    }

    drawConnection(visuals, connection) {
        //Handle unassigned values
        const rationale = connection.businessObject?.rationale || 'not_specified';
        const isImplicit = connection.businessObject?.implicit || false;

        let color;
        switch (rationale) {
            case 'best_practice':
                color = '#13DCA7';
                break;
            case 'business_rule':
                color = '#8081EF'; 
                break;
            case 'norm_or_law':
                color = '#FF81F1';
                break;
            case 'law_of_nature':
                color = '#F5CD68';
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
        const isRationaleNotAssigned = showWarnings && rationale === 'not_specified' && isSourceActivity && isTargetActivity;

        const attrs = assign({
            stroke: isRationaleNotAssigned ? 'red' : color,
            strokeWidth: isRationaleNotAssigned ? 3 : 2,
        });

        const path = this.bpmnRenderer.drawConnection(visuals, connection, attrs);
        if(path && path.setAttribute) {
            // If arrow is implicit make it dashed
            path.setAttribute('stroke-dasharray', isImplicit ? '10,4,2,4' : '');
            // If rationale is not assigned and warnings are enabled, add a warning highlight
            if(isRationaleNotAssigned) {
                path.classList.add('warning-highlight');
            } else {
                path.classList.remove('warning-highlight');
            }
        }
        return path;
    }
}

