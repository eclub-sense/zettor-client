'use strict';

var React = require('react-native');
var {
    Navigator,
    StyleSheet,
    } = React;

var Lights = require('./components/lights/lights');

var ROUTES = {
    lights: Lights,
};

module.exports = React.createClass({
    render: function () {
        return <Navigator
            style={styles.container}
            initialRoute={{name: 'lights'}}
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
