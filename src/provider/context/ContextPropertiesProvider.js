// Import your custom property entries.
import { ListGroup } from '@bpmn-io/properties-panel';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import relationshipContextGroup from './parts/RelationshipContextGroup';
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
        groups.push(createRelationshipContextGroup(element, translate));
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

ContextPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];

// Create the custom group

function createRelationshipContextGroup(element, translate) {

  const riskGroup = {
    id: 'relationship_context_group',
    label: translate('Relationship context'),
    tooltip: translate('Provide additional context for activity relationships'),
    component: ListGroup,
    ...relationshipContextGroup({element}, translate)
  };

  return riskGroup;
}
