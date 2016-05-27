'use strict';

import React from 'react';
import {View, Text} from 'react-native';

import Button from './Button';
import itemStyle from '../itemStyle.js';
import styles from '../styles.js';

export default class HubDetectedItem extends React.Component {
    propTypes:{
        item: React.PropTypes.object.isRequired,
        subtitles: React.PropTypes.array,
        onConnectToHubButtonPress: React.PropTypes.func.isRequired,
        onStayConnectedButtonPress: React.PropTypes.func.isRequired,
        onConnectToOtherHubButtonPress: React.PropTypes.func.isRequired
        };

    render() {
        return (
            <View style={itemStyle}>
                <Text style={styles.title}>{this.props.item.title}</Text>
                {this.props.subtitles}
                <View style={styles.buttonContainer}>
                    <Button
                        text={'Connect to this HUB'}
                        onPress={() => {
                                //noinspection JSUnresolvedFunction
                                this.props.onConnectToHubButtonPress(this.props.item.data.detectedHub);
                                }
                            }
                    />
                    <Button
                        text={`Stay connected to ${this.props.item.data.connectedHub.title}`}
                        onPress={() => {
                                    //noinspection JSUnresolvedFunction
                                    this.props.onStayConnectedButtonPress(this.props.item.data.detectedHub);
                                }
                            }
                    />
                    <Button
                        text={'Connect to other HUB'}
                        onPress={() => {
                                    //noinspection JSUnresolvedFunction
                                    this.props.onConnectToOtherHubButtonPress();
                                }
                            }
                    />
                </View>
            </View>
        );
    }
}
