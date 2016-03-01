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
        return <View style={s.row} ref={component => this._root = component} {...this.props}>
            <Text style={[s.rowTitle, s.cDarkGrey]}>{this.props.title}</Text>
        </View>
    },
});
