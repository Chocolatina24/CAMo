import $ from 'jquery';

// Filter menu component that allows to show/hide BPMN sequence flows 
// based on their rationale and their implicit/explicit status

// Setup filter UI and event listeners
export function setupFilterMenu(applyFilters) {
  const filterToggle = $('#js-filter-toggle');
  const filterContent = $('#js-filter-content');
  const filterCheckboxes = $('.filter-checkbox');
  const showAllToggle = $('#js-toggle-show-all');
  const hideAllToggle = $('#js-toggle-hide-all');


  // Toggle all checkboxes when "Show All" button is clicked
  showAllToggle.click(function() {
    filterCheckboxes.prop('checked', true);
    applyFilters();
  });

  // Toggle all checkboxes when "Hide All" button is clicked
  hideAllToggle.click(function() {
    filterCheckboxes.prop('checked', false);
    applyFilters();
  });

  // Toggle menu visibility when filter toggle is clicked
  filterToggle.click(function(e){
    e.preventDefault();
    e.stopPropagation();
    filterContent.toggleClass('open');
  });

  // Apply filters whenever a checkbox is checked or unchecked
  filterCheckboxes.change(function() {
    applyFilters();
  });
}

// Filter logic: show/hide BPMN sequence flows based on the rationale property
export function applyFilters(bpmnModeler) {
  // Get checked filter values
  const checkedFilters = $('.filter-checkbox:checked').map(function() {
    return $(this).val();
  }).get();

  // Get BPMN.js services
  const elementRegistry = bpmnModeler.get('elementRegistry');
  const canvas = bpmnModeler.get('canvas');

  // Get all possible filter values for easier checks
  const allFilters = ['Best practice', 'Business rule', 'Law or norm', 'Law of nature', 'Implicit', 'All'];
  // Get activity types for explicit arrow handling (only focus on arrows connecting activities)
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

  // Filter sequence flows based on their rationale 
  elementRegistry.forEach(function(element) {
    // Skip root element 
    if (!element.parent) {
      return;
    }

    // Only filter sequence flows (connections) since that's where rationale is set
    if (element.type !== 'bpmn:SequenceFlow') {
      return;
    }

    // Determine the rationale and implicit properties of the element
    const isImplicit = element.businessObject?.implicit === undefined ? false : element.businessObject.implicit;
    const rationale = mapRationaleToFilter(element.businessObject?.rationale);
    const connectsActivities = activityTypes.includes(element.source?.businessObject?.$type) && activityTypes.includes(element.target?.businessObject?.$type);

    // Find the label element for this arrow (to apply the same hide/show marker as the arrow)
    const labelElement = elementRegistry.get(element.label && element.label.id);

    // Determine if THIS element should be shown (reset for each element)
    let shouldShow = false;

    // Handling for implicit elements
    if (isImplicit) {
      // Implicit elements REQUIRE the Implicit filter to be checked, otherwise they are hidden regardless of rationale
      if (!checkedFilters.includes('Implicit')) {
        shouldShow = false; 
      } else {
          // Implicit filter is checked, now check other conditions
          if (checkedFilters.length === allFilters.length) {
            shouldShow = true; // All filters checked, show everything
          } else if (rationale && checkedFilters.includes(rationale)) {
            shouldShow = true; // Rationale matches a checked filter (including not assigned if rationale is not set)
          }
        }
    } 
    // Handling for explicit elements
    else {
      if (connectsActivities) { //Focus only on arrows connecting activities
        if (checkedFilters.length === allFilters.length) {
          shouldShow = true; // All filters checked, show everything
        } else if (checkedFilters.length === 0) {
          shouldShow = false; // No filters checked, hide arrows connecting activities
        } else if (rationale && checkedFilters.includes(rationale)) {
        shouldShow = true; // Rationale matches a checked filter, including not assigned if rationale is not set
        }
      } else {
        shouldShow = true; //Always show arrows that are not connecting activities
      }
    }

    // Apply the appropriate marker based on element type, showing/hiding both the arrows and their labels
    if (isImplicit) {
      // Handle implicit elements
      if (shouldShow) {
        canvas.removeMarker(element, 'filtered-hidden-implicit');
        if (labelElement) canvas.removeMarker(labelElement, 'filtered-hidden-implicit');
      } else {
        canvas.addMarker(element, 'filtered-hidden-implicit');
        if (labelElement) canvas.addMarker(labelElement, 'filtered-hidden-implicit');
      }
    } else {
      // Handle explicit elements
      if (shouldShow) {
        canvas.removeMarker(element, 'filtered-hidden-explicit');
        if (labelElement) canvas.removeMarker(labelElement, 'filtered-hidden-explicit');
      } else {
        canvas.addMarker(element, 'filtered-hidden-explicit');
        if (labelElement) canvas.addMarker(labelElement, 'filtered-hidden-explicit');
      }
    }
  });
}

//Helper function to map the filter value to the rationale
function mapRationaleToFilter(rationale) {
  switch (rationale) {
    case 'best_practice':
      return 'Best practice';
    case 'business_rule':
      return 'Business rule';
    case 'norm_or_law':
      return 'Norm or law';
    case 'law_of_nature':
      return 'Law of nature';
    case 'not_specified':
      return 'Not assigned';
    default:
      return 'Not assigned';
  }
}