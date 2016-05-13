'use strict';

import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {View, Text, Platform, StyleSheet} from 'react-native';

if (Platform.OS === 'android') {
    var ExtraDimensions = require('react-native-extra-dimensions-android');
}

var Button = require('./Button');
var {itemMargin, mainItems} = require('../env');

const BORDER_RADIUS = 5;

class CustomScrollViewItem extends React.Component {
    render() {
        return (
            <View style={this.getContainerStyle()}>
                {this.getArrowLeft()}
                {this.getItem()}
                {this.getArrowRight()}
            </View>
        );
    }

    getItem() {
        var item = this.props.item;
        var title = <Text style={styles.title}>{item.title}</Text>;

        if (item.type === 'info') {
            return (
                <View style={this.getItemStyle()}>
                    <Text style={styles.title}>{title}</Text>
                </View>
            );
        }

        if (item.type === 'sensor' || item.type === 'hub') {
            return (
                <View style={this.getItemStyle()}>
                    {title}
                    <Text style={styles.value}>{item.value}</Text>
                </View>
            );
        }

        if (item.type === 'hubDetected') {
            return (
                <View style={this.getItemStyle()}>
                    {title}
                    {this.getSubtitles(item)}
                    <View style={styles.buttonContainer}>
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
                </View>
            );
        }

        if (item.type === 'actuator' || mainItems.indexOf(item.type) !== -1) {
            return (
                <View style={this.getItemStyle()}>
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

    getArrowLeft() {
        if (Platform.OS === 'android' && !this.props.item.isAlone) {
            return (
                <View style={styles.arrow}>
                    <Icon name="chevron-left" size={100} color="#ECF0F1"/>
                </View>
            );
        }
    }

    getArrowRight() {
        if (Platform.OS === 'android' && !this.props.item.isAlone) {
            return (
                <View style={styles.arrow}>
                    <Icon name="chevron-right" size={100} color="#ECF0F1"/>
                </View>
            );
        }
    }

    getContainerStyle() {
        var style = [styles.containerBase];
        if (Platform.OS === 'ios') {
            style.push({
                backgroundColor: '#ECF0F1',
                padding: 10,
                borderRadius: BORDER_RADIUS,
            });
        } else {
            style.push({
                flexDirection: 'row',
            })
        }

        return style;
    }

    getItemStyle() {
        var style = [styles.itemBase];
        if (Platform.OS === 'android') {
            var itemSize = ExtraDimensions.get('REAL_WINDOW_HEIGHT')
                - ExtraDimensions.get('STATUS_BAR_HEIGHT')
                - 2 * itemMargin;
            style.push({
                backgroundColor: '#ECF0F1',
                justifyContent: 'space-around',
                height: itemSize,
                width: itemSize,
                borderRadius: BORDER_RADIUS,
            })
        }

        return style;
    }
}

var styles = StyleSheet.create({
    arrow: {
        flex: 1,
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 1,
        alignSelf: 'stretch',
    },
    containerBase: {
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
    },
    itemBase: {
        alignItems: 'center',
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
