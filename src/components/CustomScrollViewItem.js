'use strict';

import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

var {menuItems} = require('../env');

class CustomScrollViewItem extends React.Component {
    render() {
        var item = this.props.item;
        var title = <Text style={styles.itemTitle}>{item.title}</Text>;

        if (item.type === 'info') {
            return (
                <View style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{title}</Text>
                </View>
            );
        }

        if (item.type === 'sensor' || item.type === 'hub') {
            return (
                <View style={styles.itemContainer}>
                    {title}
                    <Text style={styles.itemValue}>{item.value}</Text>
                </View>
            );
        }

        if (item.type === 'actuator' || menuItems.indexOf(item.type) !== -1) {
            return (
                <View style={styles.itemContainer}>
                    {title}
                    <Icon name={this.getIconName(item)} size={150} color="#2980B9"/>
                </View>
            );
        }

        console.warn(`Unknown item type ${item.type}`);
    }

    getIconName(item) {
        if (item.type === 'actuator') {
            return item.state ? item.iconOn : item.iconOff;
        } else {
            return item.icon;
        }
    }
}

var styles = StyleSheet.create({
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
    },
    itemTitle: {
        fontSize: 50,
        color: '#2980B9',
        textAlign: 'center',
    },
    itemValue: {
        fontSize: 50,
        color: '#2980B9',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

module.exports = CustomScrollViewItem;
