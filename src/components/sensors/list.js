'use strict';

var React = require('react-native');
var {
    Text,
    View,
    } = React;

var s = require('../../styles/style');

module.exports = React.createClass({
    render: function () {
        return (
            <View>
                <Text>{"Sensors list"}</Text>
            </View>
        );
    },
});
