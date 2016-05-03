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
