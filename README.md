Repo for thesis

Use sources:
https://github.com/bpmn-io/bpmn-js-examples/tree/main/custom-elements

https://github.com/bpmn-io/bpmn-js-examples/tree/main/bundling

https://bpmn.io/toolkit/bpmn-js/walkthrough/




# bpmn-js Modeler Example

This example uses [bpmn-js](https://github.com/bpmn-io/bpmn-js) to implement a modeler for BPMN 2.0 process diagrams. It serves as the basis of the bpmn-js demo application available at [demo.bpmn.io](http://demo.bpmn.io).

## About

This example is a node-style web application that builds a user interface around the bpmn-js BPMN 2.0 modeler.

![demo application screenshot](https://raw.githubusercontent.com/bpmn-io/bpmn-js-examples/main/modeler/docs/screenshot.png "Screenshot of the example application")


## Building

You need a [NodeJS](http://nodejs.org) development stack with [npm](https://npmjs.org) installed to build the project.

Make sure to install webpack-cli 

```
npm install -g webpack webpack-cli
```

Add the properties panel together with @bpmn-io/properties-panel:

```
npm install --save bpmn-js-properties-panel @bpmn-io/properties-panel
```

Source properties panel: https://github.com/bpmn-io/bpmn-js-examples/tree/main/properties-panel

Install "append anything" extension to create BPMN elements from the palette

```
npm install bpmn-js-create-append-anything
```

Install less and less-loader:

```
npm install less less-loader --save-dev
```

To install all project dependencies execute

```
npm install
```

Build the application (including [bpmn-js](https://github.com/bpmn-io/bpmn-js)) via

```
npm run all
```

Spin up a single local modeler instance

```
npm start
```

You may also spawn a development setup by executing

```
npm run dev
```

Both tasks generate the distribution ready client-side modeler application into the `public` folder.

Serve the application locally or via a web server (nginx, apache, embedded).