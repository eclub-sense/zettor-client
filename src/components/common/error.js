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
            <View style={[s.notification, s.bgRed]}>
                <Text style={[s.notificationText, s.cLightGrey]}>
                    {this.props.text}
                </Text>
            </View>
        );
    },
});
