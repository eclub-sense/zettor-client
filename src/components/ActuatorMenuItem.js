'use strict';

import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {View, Text} from 'react-native';

import itemStyle from '../itemStyle.js';
import styles from '../styles.js';

export default class ActuatorMenuItem extends React.Component {
    propTypes:{
        item: React.PropTypes.object.isRequired,
        iconName: React.PropTypes.string.isRequired,
        subtitles: React.PropTypes.array
        };


    render() {
        return (
            <View style={itemStyle}>
                <View>
                    <Text style={styles.title}>{this.props.item.title}</Text>
                    {this.props.subtitles}
                </View>
                <View>
                    <Icon name={this.props.iconName} size={120} color="#2980B9"/>
                </View>
            </View>
        );
    }
}
