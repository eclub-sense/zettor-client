'use strict';

var React = require('react-native');
var {
    Text,
    TouchableHighlight,
    } = React;

var s = require('../../styles/style');

module.exports = React.createClass({
    render: function () {
        return (
            <TouchableHighlight
                style={[s.button, s.bcDarkGrey]}
                underlayColor={'#8D99AE'}
                onPress={this.props.onPress}
            >
                <Text style={s.buttonText}>{this.props.text}</Text>
            </TouchableHighlight>
        );
    }
});
