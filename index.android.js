'use strict';

var React = require('react-native');
import Swiper from 'react-native-page-swiper'

var {
    AppRegistry,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    } = React;

var data = require('./data.json');

var Zettor = React.createClass({
    getInitialState() {
        return {switch: true}
    },

    _onPressSlide: function () {
        var values = ['10', '11'];

        var value = values[0];
        if (this.state.switch) {
            value = values[1];
        }

        var cardDetails = {
            "action": "GPIO",
            "value": value
        };

        var formBody = [];
        for (var property in cardDetails) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(cardDetails[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch(data.deviceUri, {
            method: "POST",
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formBody
        })
            .then((response) => response)
            .then((responseData) => {
                this.setState({switch: !this.state.switch})
            })
            .done();
    },

    render: function () {

        return (
            <Swiper activeDotColor={'#1695A3'}>
                <TouchableHighlight onPress={this._onPressSlide}>
                    <View style={styles.slide}>
                        <Text style={styles.text}>First Light</Text>
                    </View>
                </TouchableHighlight>
                <View style={styles.slide}>
                    <Text style={styles.text}>Second Light</Text>
                </View>
                <View style={styles.slide}>
                    <Text style={styles.text}>Third Light</Text>
                </View>
                <View style={styles.slide}>
                    <Text style={styles.text}>Fourth Light</Text>
                </View>
            </Swiper>
        );
    }
});

var styles = StyleSheet.create({
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#225378',
    },
    text: {
        color: '#1695A3',
        fontSize: 30,
    },
});


AppRegistry.registerComponent('Zettor', () => Zettor);
