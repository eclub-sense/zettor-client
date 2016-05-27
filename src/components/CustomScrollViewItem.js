'use strict';

import React from 'react';
import {View, Text, Platform} from 'react-native';

import ActuatorMenuItem from './ActuatorMenuItem';
import Arrow from './Arrow';
import HubDetectedItem from './HubDetectedItem';
import InfoItem from './InfoItem';
import SensorHubItem from './SensorHubItem';
import styles from '../styles.js';

const {mainItems} = require('../env');

class CustomScrollViewItem extends React.Component {
    render() {
        let leftArrow = null;
        let rightArrow = null;
        if (this.hasArrows()) {
            leftArrow = (
                <Arrow type="left" onArrowPress={this.props.onPrevItemPress}/>
            );
            rightArrow = (
                <Arrow type="right" onArrowPress={this.props.onNextItemPress}/>
            );
        }

        return (
            <View style={this.getContainerStyle()}>
                {leftArrow}
                {this.getItem()}
                {rightArrow}
            </View>
        );
    }

    getItem() {
        const item = this.props.item;

        if (item.type === 'info') {
            return (
                <InfoItem item={item}/>
            );
        }

        if (item.type === 'sensor' || item.type === 'hub') {
            return (
                <SensorHubItem item={item}/>
            );
        }

        if (item.type === 'hubDetected') {
            return (
                <HubDetectedItem
                    item={item}
                    subtitles={this.getSubtitles()}
                    onConnectToHubButtonPress={()=>{this.props.onConnectToHubButtonPress(item.data.detectedHub);}}
                    onStayConnectedButtonPress={()=>{this.props.onStayConnectedButtonPress(item.data.detectedHub);}}
                    onConnectToOtherHubButtonPress={()=>{this.props.onConnectToOtherHubButtonPress();}}
                />
            );
        }

        if (item.type === 'actuator' || mainItems.indexOf(item.type) !== -1) {
            return (
                <ActuatorMenuItem item={item} iconName={this.getIconName(item)} subtitles={this.getSubtitles()}/>
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

    getSubtitles() {
        if (this.props.item.subtitles === undefined) {
            return null;
        }

        return this.props.item.subtitles.map(function (subtitle) {
            return (
                <Text key={subtitle} style={styles.subtitle}>{subtitle}</Text>
            );
        });
    }

    hasArrows() {
        const isAndroid = Platform.OS === 'android';
        const isNotAlone = !this.props.item.isAlone;

        return (isAndroid && isNotAlone);
    }

    getContainerStyle() {
        let style = [styles.containerBase];
        if (Platform.OS === 'ios') {
            style.push({
                backgroundColor: '#ECF0F1',
                padding: 10,
                borderRadius: 5,
            });
        } else {
            style.push({
                flexDirection: 'row',
            });
        }

        return style;
    }

}

module.exports = CustomScrollViewItem;
