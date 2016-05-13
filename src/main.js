'use strict';

var React = require('react-native');
var {
    Navigator,
    StyleSheet,
    } = React;

var CustomScrollView = require('./components/CustomScrollView');

var ROUTES = {
    customScrollView: CustomScrollView,
};

module.exports = React.createClass({
    render: function () {
        return (
            <Navigator
                style={styles.container}
                initialRoute={
                    {
                        name: 'customScrollView',
                        passProps: {
                            type: 'menu',
                            isLoading: false,
                        }
                    }
                }
                renderScene={this.renderScene}
                configureScene={() => {return Navigator.SceneConfigs.FloatFromRight;}}
            />
        );
    },
    renderScene: function (route, navigator) {
        var Component = ROUTES[route.name];
        return <Component route={route} navigator={navigator} {...route.passProps}/>;
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C3E50',
    }
});
