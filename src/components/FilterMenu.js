import $ from 'jquery';

// Setup filter UI and event listeners
export function setupFilterMenu(applyFilters) {
  const filterToggle = $('#js-filter-toggle');
  const filterContent = $('#js-filter-content');
  const filterCheckboxes = $('.filter-checkbox');

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
  const allFilters = ['Best practice', 'Business rule', 'Law or norm', 'Law of nature', 'Implicit'];

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

    const isImplicit = element.businessObject?.implicit === true;
    const rationale = element.businessObject?.rationale;
    
    // Determine if THIS element should be shown (reset for each element)
    let shouldShow = false;

    // Special handling for implicit elements
    if (isImplicit) {
      // Implicit elements REQUIRE the Implicit filter to be checked
      if (!checkedFilters.includes('Implicit')) {
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
        shouldShow = false; // No filters checked
      } else if (rationale && checkedFilters.includes(rationale)) {
        shouldShow = true; // Rationale matches a checked filter
      } else if (!rationale) {
        shouldShow = false; // Explicit elements without rationale are hidden if not all filters checked
      }
    }

    // Apply the appropriate marker based on element type
    if (isImplicit) {
      // Handle implicit elements
      if (shouldShow) {
        canvas.removeMarker(element, 'filtered-hidden-implicit');
        canvas.addMarker(element, 'highlight-implicit');
      } else {
        canvas.addMarker(element, 'filtered-hidden-implicit');
        canvas.removeMarker(element, 'highlight-implicit');

      }
    } else {
      // Handle explicit elements
      if (shouldShow) {
        canvas.removeMarker(element, 'filtered-hidden-explicit');
      } else {
        canvas.addMarker(element, 'filtered-hidden-explicit');
      }
    }
  });
}
