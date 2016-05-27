'use strict';

import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import styles from '../styles.js';

export default class Arrow extends React.Component {
    propTypes:{
        onArrowPress: React.PropTypes.func.isRequired,
        type: React.PropTypes.string.isRequired
        };

    render() {
        return (
            <TouchableOpacity
                style={styles.touchableOpacity}
                onPress={() => {
                      //noinspection JSUnresolvedFunction
                      this.props.onArrowPress();
                    }
                }
            >
                <Icon name={`chevron-${this.props.type}`} size={100} color="#ECF0F1"/>
            </TouchableOpacity>
        );
    }
}
