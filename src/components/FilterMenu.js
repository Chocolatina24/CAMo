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

// Example filter logic: show/hide BPMN elements based on checked filters
export function applyFilters(bpmnModeler) {
  // Get checked filter values
  const checkedFilters = $('.filter-checkbox:checked').map(function() {
    return inputMap($(this).val());
  }).get();


  // Example: hide all elements not matching checked filters
  const elementRegistry = bpmnModeler.get('elementRegistry');
  elementRegistry.forEach(function(element) {
    // Replace with your filter logic, e.g. by type or custom property
    const shouldShow = checkedFilters.length === 0 || checkedFilters.includes(element.businessObject?.rationale) || checkedFilters.includes(element.businessObject?.implicit);
    $(element.graphics).css('display', shouldShow ? '' : 'none');
  });
}

function inputMap(input){
    const map = {
        "Show Implicit" : "implicit",
        "Show Best Practice": "Best Practice",
        "Show Business Rule": "Business Rule",
        "Show Law or Norm": "Law or Norm",
        "Show Law of Nature": "Law of Nature",
    };
    var defaultValue = "could not find filter";
    return map[input] || defaultValue;
}