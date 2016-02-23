'use strict';

var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    } = React;

var Button = require('../common/button');
var GetLights = require('../api/getLights');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            lights: [],
        }
    },
    componentWillMount: function () {
        GetLights()
            .then((data) => {
                this.setState({lights: data});
            });
    },
    render: function () {
        return (
            <View style={styles.container}>
                <Text>Lights</Text>
                {this.lights()}
            </View>
        );
    },
    lights: function () {
        var lightsItems = [];
        // TODO if this.state.lights.length === 0, return "No lights connected"
        for (var title in this.state.lights) {
            // TODO https://facebook.github.io/react/tips/props-in-getInitialState-as-anti-pattern.html
            lightsItems.push(
                <Button key={title} title={title} state={this.state.lights[title]}/>
            );
        }

        return lightsItems;
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
});
