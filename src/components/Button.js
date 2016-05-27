'use strict';

import React from 'react';
import {StyleSheet, Text, TouchableHighlight} from 'react-native';

export default class Button extends React.Component {
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

const styles = StyleSheet.create({
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2980B9',
        padding: 5,
        margin: 5,
    },
    buttonText: {
        flex: 1,
        color: '#2980B9',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 15,
    },
});
