'use strict';

import React from 'react';
import {View, Text} from 'react-native';

import itemStyle from '../itemStyle.js';
import styles from '../styles.js';

export default class SensorHubItem extends React.Component {
    propTypes:{
        item: React.PropTypes.object.isRequired
        };

    render() {
        return (
            <View style={itemStyle}>
                <Text style={styles.title}>{this.props.item.title}</Text>
                <Text style={styles.value}>{this.props.item.value}</Text>
            </View>
        );
    }
}
