'use strict';

var config = require('../../../config.json');
var serverUrl = config.serverUrl;

var React = require('react-native');
var {
    ListView,
    StyleSheet,
    TouchableHighlight,
    View,
    } = React;

var GetLights = require('../api/getLights');
var Info = require('../common/info');
var Row = require('./row');
var s = require('../../styles/style');

const TURN_ON = 'turn-on';
const TURN_OFF = 'turn-off';

module.exports = React.createClass({
    getInitialState: function () {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            lights: [],
            lightsDs: ds.cloneWithRows([]),
        };
    },
    componentWillMount: function () {
        GetLights()
            .then((data) => {
                this.updateLightsStates(data);
            });
    },
    render: function () {
        return (
            <View style={[styles.container, s.bgLightGrey]}>
                {this.lights()}
            </View>
        );
    },
    updateLightsStates: function (data) {
        this.setState({lights: data});
        this.setState({lightsDs: this.state.lightsDs.cloneWithRows(this.state.lights)});
    },
    lights: function () {
        if (this.state.lights.length === 0) {
            return <Info text={'No lights connected'}/>
        }

        return <ListView
            dataSource={this.state.lightsDs}
            renderRow={this.renderRow}
            renderSeparator={
                (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={[styles.separator, s.bgGrey]} />
            }
        />
    },
    renderRow: function (rowData:string, sectionID:number, rowID:number) {
        return (
            <TouchableHighlight onPress={() => this.pressRow(rowID)} underlayColor={'#8D99AE'}>
                <Row title={rowData.title} state={rowData.state}/>
            </TouchableHighlight>
        );
    },
    pressRow: function (rowID:number) {
        let newLightsStates = this.state.lights.slice();
        newLightsStates[rowID] = {
            ...this.state.lights[rowID],
            state: !this.state.lights[rowID].state,
        };
        this.updateLightsStates(newLightsStates);

        var encodedKey = encodeURIComponent("action");
        var encodedValue = encodeURIComponent(this.state.lights[rowID].state ? TURN_ON : TURN_OFF); // TODO get from actions
        var formBody = encodedKey + "=" + encodedValue;

        var postUrl = serverUrl + '/devices/' + this.state.lights[rowID].title; // TODO fetch device url from server

        fetch(postUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formBody
            }
        )
        //.then((response) => response)
        //.then((responseData) => {
        //    console.log(responseData.text());
        //})
            .done();
        // TODO catch error
    },
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingTop: 20,
    },
    separator: {
        height: 1,
    },
});
