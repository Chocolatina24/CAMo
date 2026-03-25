import { is } from 'bpmn-js/lib/util/ModelUtil';
import explanatoryRationale from './entries/ExplanatoryRationaleDropdown';
import relationshipType from './entries/ImplicitPropertyCheckbox'
import riskType from './entries/RiskTypeDropdown';
import riskLikelihood from './entries/RiskLikelihoodDropdown';
import descriptionExplanatoryRationale from './entries/ExplanatoryRationaleDescription';
import descriptionRiskType from './entries/RiskTypeDescription';

// Custom properties provider for activity relationships
// Custom property groups and their respective entries are defined and added to the properties panel
// The panel is only visible when an arrow (sequence flow) connecting two activities is selected
// The code for the properties panel and custom properties was adapted from the Camunda BPMN properties panel example:
// https://github.com/bpmn-io/bpmn-js-examples/tree/main/properties-panel-extension and 
// https://github.com/bpmn-io/bpmn-js-examples/tree/main/properties-panel-list-extension

// The custom properties are persisted in the bpmn xml file, which allows to import and export custom diagrams

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
      
      // Add the custom groups to the properties provider
      // The properties only apply to sequence flows that connect activities because
      // they represent the activity relationships visually
      if (is(element, 'bpmn:SequenceFlow')) {
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
        const isSourceActivity = element.source && element.source.businessObject && activityTypes.includes(element.source.businessObject.$type);
        const isTargetActivity = element.target && element.target.businessObject && activityTypes.includes(element.target.businessObject.$type);
        const isActivityRelationship = isSourceActivity && isTargetActivity;
        if(isActivityRelationship) {
          groups.push(explanatoryRationaleGroup(element, translate));
          groups.push(createRiskAndLikelihoodGroup(element, translate));
          groups.push(createRelationshipTypeGroup(element, translate));
        }
      }

      return groups;
    };
  };

  // Register our custom properties provider.
  // Use a lower priority to ensure it is loaded after the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

ContextPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];

// Create the custom groups with the appropriate entries

function explanatoryRationaleGroup(element, translate) {

  const rationaleGroup = {
    id: 'explanatory_rationale_group',
    label: translate('Explanatory Rationale'),
    shouldOpen: true,
    tooltip: translate('Provide additional context for activity relationships. Select a rationale to view its description.'),
    entries: [
      ...explanatoryRationale(element),
      ...descriptionExplanatoryRationale(element)
    ]
     
  };

  return rationaleGroup;
}

function createRiskAndLikelihoodGroup(element, translate) {

  const riskAndLikelihoodGroup = {
    id: 'risk_and_likelihood_group',
    label: translate('Risk Type & Likelihood'),
    tooltip: translate('Select a risk type and its likelihood to assess the potential impact of a change operation to the relationship.'),
    shouldOpen: true,
    entries: [
      ...riskType(element),
      ...riskLikelihood(element),
      ...descriptionRiskType(element)
    ]
  };

  return riskAndLikelihoodGroup;
}

function createRelationshipTypeGroup(element, translate) {

  const relationshipTypeGroup = {
    id: 'relationship_type_group',
    label: translate('Relationship Type'),
    tooltip: translate('Specify if the relationship between activities is implicit or explicit.'),
    shouldOpen: true,
    entries: [
      ...relationshipType(element)
    ]
  };

  return relationshipTypeGroup;
}

