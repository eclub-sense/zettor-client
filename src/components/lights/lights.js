'use strict';

var config = require('../../../config.json');
var serverUrl = config.serverUrl;

var React = require('react-native');
var {
    ListView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    } = React;

var GetLights = require('../api/getLights');
var Icon = require('react-native-vector-icons/Ionicons');

var colorDarkGrey = '#2B2D42';
var colorGrey = '#8D99AE';
var colorLightGrey = '#EDF2F4';

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
            <View style={styles.container}>
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
            return <Text>No lights connected</Text>
        }

        return <ListView
            dataSource={this.state.lightsDs}
            renderRow={this.renderRow}
            renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
        />
    },
    renderRow: function (rowData:string, sectionID:number, rowID:number) {
        return (
            <TouchableHighlight
                onPress={() => this.pressRow(rowID)}
                underlayColor={colorGrey}
            >
                <View style={styles.row}>
                    <Text style={styles.rowTitle}>{rowData.title}</Text>
                    {this.getIcon(rowData.state)}
                </View>
            </TouchableHighlight>
        );
    },
    getIcon: function (state) {
        if (state) {
            return (<Icon name="ios-lightbulb" size={30} color={colorDarkGrey}/>);
        }

        return (<Icon name="ios-lightbulb-outline" size={30} color={colorDarkGrey}/>);
    },
    pressRow: function (rowID:number) {
        let newLightsStates = this.state.lights.slice();
        newLightsStates[rowID] = {
            ...this.state.lights[rowID],
            state: !this.state.lights[rowID].state,
        };
        this.updateLightsStates(newLightsStates);

        // TODO move post request to function
        var values = ['turn-off', 'turn-on'];

        var value = values[0]; // TODO get from actions
        if (this.state.lights[rowID].state) {
            value = values[1];
        }

        var properties = {
            "action": value,
        };

        var formBody = [];
        for (var property in properties) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(properties[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

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
        justifyContent: 'center',
        alignItems: 'stretch',
        paddingTop: 20,
        backgroundColor: colorLightGrey,
    },
    separator: {
        height: 1,
        backgroundColor: colorGrey,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        padding: 10,
    },
    rowTitle: {
        flex: 1,
        fontSize: 20,
        color: colorDarkGrey,
        fontWeight: 'bold',
    },
    rowState: {
        fontSize: 20,
        color: colorDarkGrey,
        fontWeight: 'bold',
    }
});
