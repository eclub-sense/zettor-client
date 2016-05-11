'use strict';

import React from 'react';
import {StyleSheet, Text, TouchableHighlight} from 'react-native';

class Button extends React.Component {
    render() {
        return (
            <TouchableHighlight
                style={styles.button}
                underlayColor={'#8D99AE'}
                onPress={this.props.onPress}
            >
                <Text style={styles.buttonText}>{this.props.text}</Text>
            </TouchableHighlight>
        );
    }
}

var styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        padding: 5,
        marginTop: 10,
    },
    buttonText: {
        flex: 1,
        alignSelf: 'center',
        fontSize: 10,
    },
});

module.exports = Button;
