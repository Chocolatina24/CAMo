// Import your custom property entries.
import { is } from 'bpmn-js/lib/util/ModelUtil';
import explanatoryRationale from './entries/ExplanatoryRationaleDropdown';
import relationshipType from './entries/ImplicitPropertyCheckbox'
import riskType from './entries/RiskTypeDropdown';
import riskLikelihood from './entries/RiskLikelihoodDropdown';
import descriptionRationale from './entries/ExplanatoryRationaleDescription';
import descriptionRisk from './entries/RiskTypeDescription';
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
        groups.push(explanatoryRationaleGroup(element, translate));
        groups.push(createRiskGroup(element, translate));
        groups.push(createRelationshipTypeGroup(element, translate));
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

// Create the custom groups

function explanatoryRationaleGroup(element, translate) {

  const rationaleGroup = {
    id: 'explanatory_rationale_group',
    label: translate('Explanatory Rationale'),
    shouldOpen: true,
    tooltip: translate('Provide additional context for activity relationships'),
    entries: [
      ...explanatoryRationale(element),
      ...descriptionRationale(element)
    ]
     
  };

  return rationaleGroup;
}

function createRiskGroup(element, translate) {

  const riskTypeGroup = {
    id: 'risk_type_group',
    label: translate('Risk Type & Likelihood'),
    tooltip: translate(''),
    shouldOpen: true,
    entries: [
  ...riskType(element),
  ...riskLikelihood(element),
  ...descriptionRisk(element)
]
  };

  return riskTypeGroup;
}

function createRelationshipTypeGroup(element, translate) {

  const relationshipTypeGroup = {
    id: 'relationship_type_group',
    label: translate('Relationship Type'),
    tooltip: translate(''),
    shouldOpen: true,
    entries: [
  ...relationshipType(element)
]
  };

  return relationshipTypeGroup;
}

