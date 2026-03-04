import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import './style.less';
import './components/FilterMenu.less';
import './components/DescriptionEntry.less';


import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
} from 'bpmn-js-properties-panel';
import ContextPropertiesProviderModule from './provider/context';
import contextModdleDescriptor from './descriptors/context';

import {
  debounce
} from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';
import { setupFilterMenu, applyFilters } from './components/FilterMenu';

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
  ],
  moddleExtensions: {
    context: contextModdleDescriptor
  }
});

container.removeClass('with-diagram');

function createNewDiagram() {
  openDiagram(diagramXML);
}

// Function to style implicit elements
function styleImplicitElements() {
  const elementRegistry = bpmnModeler.get('elementRegistry');
  const canvas = bpmnModeler.get('canvas');

  elementRegistry.forEach(function(element) {
    // Only process sequence flows
    if (element.type === 'bpmn:SequenceFlow') {
      const isImplicit = element.businessObject?.implicit === true;
      
      if (isImplicit) {
        canvas.addMarker(element, 'highlight-implicit');
      } else {
        canvas.removeMarker(element, 'highlight-implicit');
      }
    }
  });
}

async function openDiagram(xml) {

  try {

    await bpmnModeler.importXML(xml);

    container
      .removeClass('with-error')
      .addClass('with-diagram');
    
    // Apply implicit styling to elements on load
    styleImplicitElements();
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

  bpmnModeler.on('commandStack.changed', exportArtifacts);

  // Apply implicit styling whenever elements change
  bpmnModeler.on('commandStack.changed', styleImplicitElements);

  setupFilterMenu(() => applyFilters(bpmnModeler));

});
