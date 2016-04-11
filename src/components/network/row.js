'use strict';

var React = require('react-native');
var {
    Text,
    View,
    } = React;

var s = require('../../styles/style');

module.exports = React.createClass({
    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    },
    render: function () {
        return (
            <View style={s.networkRow} ref={component => (this._root = component)} {...this.props}>
                <Text style={[s.networkRowText, s.cDarkGrey]}>{this.props.ssid}</Text>
                <Text style={[s.networkRowText, s.cDarkGrey]}>{this.props.bssid}</Text>
                <Text style={[s.networkRowText, s.cDarkGrey]}>{this.props.level}</Text>
                <Text style={[s.networkRowText, s.cDarkGrey]}>{this.props.capabilities}</Text>
            </View>
        );
    }
});
