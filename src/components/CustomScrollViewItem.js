'use strict';

import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

var Button = require('./Button');
var {mainItems} = require('../env');

class CustomScrollViewItem extends React.Component {
    render() {
        var item = this.props.item;
        var title = <Text style={styles.title}>{item.title}</Text>;

        if (item.type === 'info') {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>
                </View>
            );
        }

        if (item.type === 'sensor' || item.type === 'hub') {
            return (
                <View style={styles.container}>
                    {title}
                    <Text style={styles.value}>{item.value}</Text>
                </View>
            );
        }

        if (item.type === 'hubDetected') {
            return (
                <View style={styles.container}>
                    {title}
                    {this.getSubtitles(item)}
                    <Button
                        text={'Connect to this HUB'}
                        onPress={() => {
                            //noinspection JSUnresolvedFunction
                            this.props.onConnectToHubButtonPress(item.data.detectedHub);}
                        }
                    />
                    <Button
                        text={`Stay connected to ${item.data.connectedHub.title}`}
                        onPress={() => {
                            //noinspection JSUnresolvedFunction
                            this.props.onStayConnectedButtonPress(item.data.detectedHub);}
                        }
                    />
                    <Button
                        text={'Connect to other HUB'}
                        onPress={() => {
                            //noinspection JSUnresolvedFunction
                            this.props.onConnectToOtherHubButtonPress();}
                        }
                    />
                </View>
            );
        }

        if (item.type === 'actuator' || mainItems.indexOf(item.type) !== -1) {
            return (
                <View style={styles.container}>
                    <View>
                        {title}
                        {this.getSubtitles(item)}
                    </View>
                    <View>
                        <Icon name={this.getIconName(item)} size={120} color="#2980B9"/>
                    </View>
                </View>
            );
        }

        console.warn(`Unknown item type ${item.type}`);
    }

    getSubtitles(item) {
        var subtitles = [];
        if (item.subtitles !== undefined) {
            for (var i = 0; i < item.subtitles.length; i++) {
                subtitles.push(<Text key={i} style={styles.subtitle}>{item.subtitles[i]}</Text>);
            }
        }

        return subtitles;
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
    container: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
        borderRadius: 5,
        backgroundColor: '#ECF0F1',
    },
    subtitle: {
        fontSize: 15,
        color: '#2980B9',
        textAlign: 'center',
    },
    title: {
        fontSize: 50,
        color: '#2980B9',
        textAlign: 'center',
    },
    value: {
        fontSize: 50,
        color: '#2980B9',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

module.exports = CustomScrollViewItem;
