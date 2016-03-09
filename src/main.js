'use strict';

var React = require('react-native');
var {
    Navigator,
    StyleSheet,
    } = React;

var Actuators = require('./components/actuators/list');
var Menu = require('./components/menu/list');
var Sensors = require('./components/sensors/list');
var SensorData = require('./components/sensors/sensorData');
var SignIn = require('./components/authentication/signIn');
var SignUp = require('./components/authentication/signUp');

var s = require('./styles/style');

var ROUTES = {
    actuators: Actuators,
    menu: Menu,
    sensors: Sensors,
    sensorData: SensorData,
    signIn: SignIn,
    signUp: SignUp,
};

module.exports = React.createClass({
    render: function () {
        return <Navigator
            style={[styles.container, s.bgLightGrey]}
            initialRoute={{name: 'signIn'}}
            renderScene={this.renderScene}
            configureScene={() => {return Navigator.SceneConfigs.FloatFromRight;}}
        />
    },
    renderScene: function (route, navigator) {
        var Component = ROUTES[route.name];
        return <Component route={route} navigator={navigator} {...route.passProps}/>;
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
