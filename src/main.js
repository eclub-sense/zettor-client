'use strict';

var React = require('react-native');
var {
    Navigator,
    StyleSheet,
    } = React;

var CustomScrollView = require('./components/common/customScrollView');
var Network = require('./components/network/list');
var SignIn = require('./components/authentication/signIn');
var SignUp = require('./components/authentication/signUp');
var googleSignInExample = require('./components/authentication/googleSignInExample');

var s = require('./styles/style');

var ROUTES = {
    customScrollView: CustomScrollView,
    network: Network,
    signIn: SignIn,
    signUp: SignUp,
    googleSignInExample: googleSignInExample,
};

module.exports = React.createClass({
    render: function () {
        return (
            <Navigator
                style={[styles.container, s.bgLightGrey]}
                initialRoute={
                {
                    name: 'customScrollView',
                    passProps: {
                        data: [
                            {
                                id: 0,
                                title: 'Actuators',
                                type: 'actuators',
                                icon: 'power',
                            },
                            {
                                id: 1,
                                title: 'Sensors',
                                type: 'sensors',
                                icon: 'arrow-graph-up-right',
                            }
                        ]
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
    }
});
