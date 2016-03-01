var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    } = React;

var s = require('../../styles/style');

var Info = React.createClass({
    render: function () {
        return <View style={[styles.info, s.bgDarkGrey]}>
            <Text style={[styles.text, s.cLightGrey]}>
                {this.props.text}
            </Text>
        </View>
    },
});

var styles = StyleSheet.create({
    info: {
        alignItems: 'center',
        padding: 5,
    },
    text: {
        fontSize: 15,
    }
});

module.exports = Info;
