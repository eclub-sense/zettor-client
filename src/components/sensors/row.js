'use strict';

var React = require('react-native');
var {
    Text,
    TouchableHighlight,
    View,
    } = React;

var s = require('../../styles/style');

module.exports = React.createClass({
    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    },
    render: function () {
        var data = this.props.data;
        return (
            <View style={s.row} ref={component => (this._root = component)} {...this.props}>
                <TouchableHighlight onPress={() => this.pressRow(data)} underlayColor={'#8D99AE'}>
                    <Text style={[s.rowTitle, s.cDarkGrey]}>{data.name}</Text>
                </TouchableHighlight>
            </View>
        );
    },
    pressRow: function (data) {
        this.props.navigator.push({name: 'sensorData', passProps: {data: data}});
    },
});
