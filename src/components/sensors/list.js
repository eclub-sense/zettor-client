'use strict';

var React = require('react-native');
var {
    ListView,
    View,
    } = React;

var GetEntities = require('../api/getEntities');
var Info = require('../common/info');
var Row = require('./row');
var s = require('../../styles/style');

module.exports = React.createClass({
    getInitialState: function () {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            sensors: [],
            sensorsDs: ds.cloneWithRows([]),
        };
    },
    componentWillMount: function () {
        GetEntities()
            .then((entities) => {
                var sensors = this.getSensorsWithNeededProperties(entities.sensors);
                this.updateSensorsStates(sensors);
            });
    },
    render: function () {
        return (
            <View style={[s.rowsContainer, s.bgLightGrey]}>
                {this.sensors()}
            </View>
        );
    },
    getSensorsWithNeededProperties: function (sensors) {
        var result = [];

        for (var i = 0, l = sensors.length; i < l; i++) {
            var sensorProperties = sensors[i].properties;
            var propertiesKeys = Object.keys(sensorProperties);
            var newObj = {
                name: sensorProperties.name,
            };
            for (var j = 0, spl = propertiesKeys.length; j < spl; j++) {
                var key = propertiesKeys[j];
                if (key === 'id' || key === 'increment' || key === 'type') {
                    continue;
                }
                newObj[key] = sensorProperties[key];
            }
            result.push(newObj);
        }

        return result;
    },
    updateSensorsStates: function (data) {
        this.setState({sensors: data});
        this.setState({sensorsDs: this.state.sensorsDs.cloneWithRows(this.state.sensors)});
    },
    sensors: function () {
        if (this.state.sensors.length === 0) {
            return (
                <Info text={'No sensors found'}/>
            );
        }

        return (
            <ListView
                dataSource={this.state.sensorsDs}
                renderRow={this.renderRow}
                renderSeparator={
                    (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={[s.rowsSeparator, s.bgGrey]} />
                }
            />
        );
    },
    renderRow: function (rowData, sectionID:number, rowID:number) {
        return (
            <Row data={rowData} navigator={this.props.navigator}/>
        );
    },
});
