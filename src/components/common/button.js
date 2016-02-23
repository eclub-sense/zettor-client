var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    } = React;

var Button = React.createClass({
    render: function () {
        return (
            <View style={styles.button}>
                <Text style={styles.buttonTitle}>{this.props.title}</Text>
                <Text style={styles.buttonState}>{this.props.state ? 'OFF' : 'ON'}</Text>
            </View>
        );
    },
});

var styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        margin: 10,
        borderWidth: 2,
        borderRadius: 5,
        borderColor: 'black',
    },
    buttonTitle: {
        flex: 4,
        fontSize: 20,
    },
    buttonState: {
        flex: 1,
        fontSize: 20,
    },
});

module.exports = Button;
