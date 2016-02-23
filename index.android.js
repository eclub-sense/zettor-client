'use strict';

var React = require('react-native');

var {
    AppRegistry,
    } = React;

var Main = require('./src/main.js');

AppRegistry.registerComponent('Zettor', () => Main);
