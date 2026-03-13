import $ from 'jquery';

// Setup filter UI and event listeners
export function setupFilterMenu(applyFilters) {
  const filterToggle = $('#js-filter-toggle');
  const filterContent = $('#js-filter-content');
  const filterCheckboxes = $('.filter-checkbox');
  const toggleAllCheckboxesButton = $('#js-toggle-checkboxes');
  toggleAllCheckboxesButton.text('Hide All');


  // Toggle all checkboxes when "Show All" button is clicked
  toggleAllCheckboxesButton.click(function() {
    const allChecked = filterCheckboxes.length === filterCheckboxes.filter(':checked').length;
    filterCheckboxes.prop('checked', !allChecked);
    toggleAllCheckboxesButton.text(allChecked ? 'Show All' : 'Hide All');
    applyFilters();
  });

  filterToggle.click(function(e){
    e.preventDefault();
    e.stopPropagation();
    filterContent.toggleClass('open');
  });

  filterCheckboxes.change(function() {
    applyFilters();
  });
}

// Filter logic: show/hide BPMN sequence flows based on rationale property
export function applyFilters(bpmnModeler) {
  // Get checked filter values
  const checkedFilters = $('.filter-checkbox:checked').map(function() {
    return $(this).val();
  }).get();

  // Get BPMN.js services
  const elementRegistry = bpmnModeler.get('elementRegistry');
  const canvas = bpmnModeler.get('canvas');
  const allFilters = ['Best practice', 'Business rule', 'Law or norm', 'Law of nature', 'Implicit', 'All'];
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

    const isImplicit = element.businessObject?.implicit === undefined ? false : element.businessObject.implicit;
    const rationale = mapRationaleToFilter(element.businessObject?.rationale);

    // Find the label element for this arrow
    const labelElement = elementRegistry.get(element.label && element.label.id);

    // Determine if THIS element should be shown (reset for each element)
    let shouldShow = false;

    // Special handling for implicit elements
    if (isImplicit) {
      // Implicit elements REQUIRE the Implicit filter to be checked
      if (!checkedFilters.includes('Implicit') && isImplicit) {
        shouldShow = false; // Always hide implicit elements if Implicit filter is unchecked
      } else {
        // Implicit filter is checked, now check other conditions
        if (checkedFilters.length === allFilters.length) {
          shouldShow = true; // All filters checked
        } else if (rationale && checkedFilters.includes(rationale)) {
          shouldShow = true; // Rationale matches a checked filter
        } else if (checkedFilters.includes('Implicit') && !rationale) {
          shouldShow = true; // Show implicit elements without rationale if Implicit is checked
        }
      }
    } 
    // Explicit elements
    else {
      if (checkedFilters.length === allFilters.length) {
        shouldShow = true; // All filters checked
      } else if (checkedFilters.length === 0) {
        if (activityTypes.includes(element.source?.businessObject?.$type) &&
            activityTypes.includes(element.target?.businessObject?.$type)) {
            shouldShow = false; // Hide only if both are activities and no rationale
          } else {
            shouldShow = true; // Show otherwise
  }      } else if (rationale && checkedFilters.includes(rationale)) {
        shouldShow = true; // Rationale matches a checked filter
      } else if (!rationale || rationale === 'Not assigned') {
        if(activityTypes.includes(element.source?.businessObject?.$type) &&
         activityTypes.includes(element.target?.businessObject?.$type) &&
         !checkedFilters.includes('Not assigned')) {
        shouldShow = false; // Explicit elements without rationale are hidden if not all filters checked
        } else {
          shouldShow = true; // Show explicit elements without rationale if they are not connecting two activities
        }
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