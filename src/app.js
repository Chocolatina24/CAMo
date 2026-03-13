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
import './style/FilterMenu.less';
import './style/DescriptionEntry.less';
import './style/ShowWarningsButton.less';
import './style/CreateNewDiagramConfirm.less';

// Import custom modules
import ContextPropertiesProviderModule from './provider/context';
import contextModdleDescriptor from './descriptors/moddle/context';
import implicitArrowRenderer from './modules/extensions/renderer/ImplicitArrowRenderer';
import customContextPadProvider from './modules/extensions/contextpad/CustomContextPadProvider';

// Import custom components
import { setupFilterMenu, applyFilters } from './components/FilterMenu';
import { applyWarningHighlight, setupShowWarningsButton, showWarningText } from './components/ShowWarningsButton';



var container = $('#js-drop-zone');
var canvas = $('#js-canvas');


var bpmnModeler = new BpmnModeler({
  container: canvas,
  propertiesPanel: {
    parent: '#js-properties-panel',
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    ContextPropertiesProviderModule,
    {
      __init__: ['implicitArrowRenderer', 'customContextPadProvider'],
      implicitArrowRenderer: ['type', implicitArrowRenderer],
      customContextPadProvider: ['type', customContextPadProvider],
   }
  ],
  moddleExtensions: {
    context: contextModdleDescriptor
  }
});

container.removeClass('with-diagram');

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


// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  $('#js-create-new-diagram-button').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#confirm-window').show();
  });

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

  // Re-apply warning highlights and update warning text after each command to ensure they stay up to date
  bpmnModeler.on('commandStack.changed', function() {
    exportArtifacts();
    applyWarningHighlight(bpmnModeler);
    showWarningText(bpmnModeler);
  });

 //Initial setup of filter menu and warning button
  setupFilterMenu(() => applyFilters(bpmnModeler));
  setupShowWarningsButton(() => applyWarningHighlight(bpmnModeler), () => showWarningText(bpmnModeler));

//Helper to determine if an element is an activity (we only want to focus on arrows that connect activities)
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
