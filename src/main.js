'use strict';

var React = require('react-native');
var {
    Navigator,
    StyleSheet,
    } = React;

var Lights = require('./components/lights/lights');
var Menu = require('./components/menu/list');
var Sensors = require('./components/sensors/list');

var s = require('./styles/style');

var ROUTES = {
    lights: Lights,
    menu: Menu,
    sensors: Sensors,
};

module.exports = React.createClass({
    render: function () {
        return <Navigator
            style={[styles.container, s.bgLightGrey]}
            initialRoute={{name: 'menu'}}
            renderScene={this.renderScene}
            configureScene={() => {return Navigator.SceneConfigs.FloatFromRight;}}
        />
    },
    renderScene: function (route, navigator) {
        var Component = ROUTES[route.name];
        return <Component route={route} navigator={navigator}/>;
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
