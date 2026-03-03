// Import your custom property entries.
import rationaleProp from './parts/Rationale';
import { ListGroup } from '@bpmn-io/properties-panel';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import riskProp from "./parts/RiskType";
const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function ContextPropertiesProvider(propertiesPanel, translate) {

  // API ////////

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function(groups) {

      // Add the "magic" group
      if (is(element, 'bpmn:SequenceFlow')) {
        groups.push(createRationaleGroup(element, translate));
        groups.push(createRiskGroup(element, injector, translate));
      }

      return groups;
    };
  };


  // registration ////////

  // Register our custom properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

ContextPropertiesProvider.$inject = [ 'propertiesPanel', 'injector', 'translate' ];

// Create the custom group
function createRationaleGroup(element, translate) {

  // create a group
  const rationaleGroup = {
    id: 'context',
    label: translate('Contextual information'),
    entries: rationaleProp (element),
    tooltip: translate('Make sure you know what you are doing!')
  };

  return rationaleGroup;
}

function createRiskGroup(element, injector, translate) {

  // create a group
  const riskGroup = {
    id: 'risks',
    label: translate('Risk and likelihood'),
    component: ListGroup,
    ...riskProp({element, injector})
  };

  return riskGroup;
}
