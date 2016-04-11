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
            <View style={s.rowData}>
                <Text style={[s.rowDataLabel, s.cDarkGrey]}>{this.props.label}</Text>
                <Text style={[s.rowDataValue, s.cDarkGrey]}>{this.props.value}</Text>
            </View>
        );
    },
});
