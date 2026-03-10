import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';


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

        const rationale = connection.businessObject?.rationale;

        let color = 'black'; //default
        switch (rationale) {
            case 'best_practice':
                color = 'green';
                break;
            case 'business_rule':
                color = 'blue'; 
                break;
            case 'norm_or_law':
                color = 'orange';
                break;
            case 'law_of_nature':
                color = 'red';
                break;
            case 'not_assigned':
                color = 'black';
                break;
            default: color = 'red';
        }

        //TODO: assign the colors to the arrows

        const path = this.bpmnRenderer.drawConnection(visuals, connection);
        if(path && path.setAttribute) {
            path.setAttribute('stroke-dasharray', connection.businessObject.implicit ? '10,4,2,4' : '');
        }
        return path;
    }
}

