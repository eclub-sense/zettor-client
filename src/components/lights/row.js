var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    } = React;

var Icon = require('react-native-vector-icons/Ionicons');
var s = require('../styles/style');

var Info = React.createClass({
    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    },
    render: function () {
        return <View style={styles.row} ref={component => this._root = component} {...this.props}>
            <Text style={[styles.rowTitle, s.cDarkGrey]}>{this.props.title}</Text>
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

var styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        padding: 10,
    },
    rowTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

module.exports = Info;
