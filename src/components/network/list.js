'use strict';

var React = require('react-native');
var {
    ListView,
    View,
    } = React;

var Row = require('./row');
var s = require('../../styles/style');

//import Bssid from 'react-native-bssid';

module.exports = React.createClass({
    getInitialState: function () {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            networks: [],
            networksDs: ds.cloneWithRows([]),
        };
    },
    componentWillMount: function () {
        getAllBssids()
            .then((data) => {
                this.updateNetworksStates(data);
            })
            .done();
    },
    render: function () {
        return (
            <View style={[s.rowsContainer, s.bgLightGrey]}>
                {this.networks()}
            </View>
        );
    },
    updateNetworksStates: function (data) {
        this.setState({networks: data});
        this.setState({networksDs: this.state.networksDs.cloneWithRows(this.state.networks)});
    },
    networks: function () {
        return (
            <ListView
                dataSource={this.state.networksDs}
                renderRow={this.renderRow}
                renderSeparator={
                (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={[s.rowsSeparator, s.bgGrey]} />
            }
            />
        );
    },
    renderRow: function (rowData) {
        return (
            <Row ssid={rowData.ssid}
                 bssid={rowData.bssid}
                 level={rowData.level}
                 capabilities={rowData.capabilities}
            />
        );
    }
});

async function getAllBssids() {
    try {
        return await Bssid.getAll();
    } catch (e) {
        console.error(e);
    }
}
