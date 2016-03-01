var React = require('react-native');
var {
    Text,
    View,
    } = React;

var Icon = require('react-native-vector-icons/Ionicons');
var s = require('../../styles/style');

module.exports = React.createClass({
    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    },
    render: function () {
        return <View style={s.row} ref={component => this._root = component} {...this.props}>
            <Text style={[s.rowTitle, s.cDarkGrey]}>{this.props.title}</Text>
            {this.getIcon(this.props.state)}
        </View>
    },
    getIcon: function (state) {
        if (state) {
            return (<Icon name="ios-lightbulb" size={30} color={s.cDarkGrey.color}/>);
        }
        return (<Icon name="ios-lightbulb-outline" size={30} color={s.cDarkGrey.color}/>);
    },
});
