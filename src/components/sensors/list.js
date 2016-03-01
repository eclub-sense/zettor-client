'use strict';

var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    } = React;

var s = require('../../styles/style');

module.exports = React.createClass({
    render: function () {
        return (
            <View style={[styles.container, s.bgLightGrey]}>
                <Text>{"Sensors list"}</Text>
            </View>
        );
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
});
