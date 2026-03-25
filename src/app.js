import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
} from 'bpmn-js-properties-panel';

import {
  debounce
} from 'min-dash';

// Import default diagram
import diagramXML from '../resources/newDiagram.bpmn';

// Import custom styles
import './style/style.less';
import './style/filterMenuStyle.less';
import './style/descriptionEntryStyle.less';
import './style/warningsButtonStyle.less';
import './style/newDiagramButtonStyle.less';
import './style/propertiesPanelStyle.less';

// Import custom modules
import contextPropertiesProviderModule from './provider/context';
import contextModdleDescriptor from './descriptors/moddle/context';
import customArrowRenderer from './modules/extensions/renderer';
import customContextPadProvider from './modules/extensions/contextpad';

// Import custom components
import { setupFilterMenu, applyFilters } from './components/FilterMenu';
import { applyWarningHighlight, setupShowWarningsButton, showWarningText } from './components/ShowWarningsButton';



var container = $('#js-drop-zone');
var canvas = $('#js-canvas');

// Initialize the BPMN modeler with the custom modules and properties panel
var bpmnModeler = new BpmnModeler({
  container: canvas,
  propertiesPanel: {
    parent: '#js-properties-panel',
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    contextPropertiesProviderModule,
    customArrowRenderer,
    customContextPadProvider
  ],
  moddleExtensions: {
    context: contextModdleDescriptor
  }
});

container.removeClass('with-diagram');

// Function to create a new diagram by loading the default xml
function createNewDiagram() {
  openDiagram(diagramXML);
}

async function openDiagram(xml) {

  try {

    await bpmnModeler.importXML(xml);

    container
      .removeClass('with-error')
      .addClass('with-diagram');
    
  } catch (err) {

    container
      .removeClass('with-diagram')
      .addClass('with-error');

    container.find('.error pre').text(err.message);

    console.error(err);
  }
}

// Function to register file drag and drop on the container element
function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


// Check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// Bootstrap diagram functions

$(function() {

  // Create new diagram by pressing the button on the start screen
  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  // Import diagram by pressing the button on the start screen and selecting a file
  $('.js-import-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('.js-file-input').trigger('click');
    $('.js-file-input').val(''); // Reset so same file can be selected again
  });

  // Handle file selection for importing a diagram from the file system
  $('.js-file-input').change(function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      var xml = evt.target.result;
      openDiagram(xml);
    };
    reader.readAsText(file);
    $(this).val(''); // Reset so same file can be selected again
  });

  // Create new diagram by pressing the corresponding button when the canvas and diagram are visible
  // Show confirmation window when pressing the "Create New Diagram" button to prevent accidental loss of work
  $('#js-create-new-diagram-button').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#confirm-window').show();
  });

  // Handle confirmation window buttons
  $('#confirm-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    createNewDiagram();
    $('#confirm-window').hide();
  });

  $('#cancel-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#confirm-window').hide();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  // Helper function to set the href and download attributes of the export links with the encoded data,
  // and to toggle the active class based on whether data is available
  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  // Function to export the current diagram as bpmn xml or svg, and set the export links accordingly
  var exportArtifacts = debounce(async function() {

    try {

      const { svg } = await bpmnModeler.saveSVG();

      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {

      console.error('Error happened saving SVG: ', err);

      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {

      const { xml } = await bpmnModeler.saveXML({ format: true });

      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {

      console.error('Error happened saving diagram: ', err);

      setEncoded(downloadLink, 'diagram.bpmn', null);
    }
  }, 500);

 // Initial setup of filter menu and warnings button
  setupFilterMenu(() => applyFilters(bpmnModeler));
  setupShowWarningsButton(() => applyWarningHighlight(bpmnModeler), () => showWarningText(bpmnModeler));
  
  // Re-apply warning highlights and update warning text after each command to ensure they stay up to date
  bpmnModeler.on('commandStack.changed', function() {
    exportArtifacts();
    applyWarningHighlight(bpmnModeler);
    showWarningText(bpmnModeler);
  });

  // Helper to determine if an element is an activity (we only want to focus on arrows that connect activities)
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

  // Hide properties panel unless a sequence flow that connects two activities is selected
  bpmnModeler.on('selection.changed', function(e) {
    const selected = e.newSelection && e.newSelection[0];
    const panel = $('#js-properties-panel');
    const container = $('#js-drop-zone');
    const isSourceActivity = selected && selected.source && selected.source.businessObject && activityTypes.includes(selected.source.businessObject.$type);
    const isTargetActivity = selected && selected.target && selected.target.businessObject && activityTypes.includes(selected.target.businessObject.$type);
    if (selected && selected.type === 'bpmn:SequenceFlow' && isSourceActivity && isTargetActivity) {
      panel.css('visibility', 'visible');
      container.removeClass('without-properties-panel');
    } else {
      panel.css('visibility', 'hidden');
      container.addClass('without-properties-panel');
    }
  });
});
