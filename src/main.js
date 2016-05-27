'use strict';

const React = require('react-native');
const {
    Navigator,
    Platform,
    StyleSheet,
    } = React;

const CustomScrollView = require('./components/CustomScrollView');

const ROUTES = {
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
                            type: Platform.OS === 'android' ? 'hubs' : 'menu',
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
        const Component = ROUTES[route.name];
        return <Component route={route} navigator={navigator} {...route.passProps}/>;
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C3E50',
    }
});
