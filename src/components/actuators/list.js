'use strict';

var config = require('../../../config.json');

var React = require('react-native');
var {
    ListView,
    TouchableHighlight,
    View,
    } = React;

var GetEntities = require('../api/getEntities');
var Info = require('../common/info');
var Row = require('./row');
var s = require('../../styles/style');

const STATE_ON = 'ON';
const STATE_OFF = 'OFF';
const TURN_ON = 'turn-on';
const TURN_OFF = 'turn-off';

module.exports = React.createClass({
    getInitialState: function () {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            actuators: [],
            actuatorsDs: ds.cloneWithRows([]),
        };
    },
    componentWillMount: function () {
        GetEntities()
            .then((entities) => {
                var actuators = this.getSensorsWithNeededProperties(entities.actuators);
                this.updateActuatorsStates(actuators);
            });
    },
    render: function () {
        return (
            <View style={[s.rowsContainer, s.bgLightGrey]}>
                {this.actuators()}
            </View>
        );
    },
    getSensorsWithNeededProperties: function (actuators) {
        var result = [];

        for (var i = 0, l = actuators.length; i < l; i++) {
            result.push({
                name: actuators[i].properties.name,
                state: actuators[i].properties.state,
                turnOnOffActionUrl: this.getTurnOnOffActionUrl(actuators[i]),
            });
        }

        return result;
    },
    updateActuatorsStates: function (data) {
        this.setState({actuators: data});
        this.setState({actuatorsDs: this.state.actuatorsDs.cloneWithRows(this.state.actuators)});
    },
    actuators: function () {
        if (this.state.actuators.length === 0) {
            return <Info text={'No actuators found'}/>
        }

        return <ListView
            dataSource={this.state.actuatorsDs}
            renderRow={this.renderRow}
            renderSeparator={
                (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={[s.rowsSeparator, s.bgGrey]} />
            }
        />
    },
    renderRow: function (rowData, sectionID:number, rowID:number) {
        return (
            <TouchableHighlight onPress={() => this.pressRow(rowID)} underlayColor={'#8D99AE'}>
                <Row title={rowData.name} state={rowData.state === STATE_ON}/>
            </TouchableHighlight>
        );
    },
    pressRow: function (rowID:number) {
        var actuator = this.state.actuators[rowID];
        var encodedKey = encodeURIComponent("action");
        var encodedValue = encodeURIComponent((actuator.state === STATE_ON) ? TURN_OFF : TURN_ON); // TODO get from actions
        var formBody = encodedKey + "=" + encodedValue;
        var postUrl = actuator.turnOnOffActionUrl;

        fetch(postUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formBody
            }
        )
            .then(function () {
                let newActuatorsStates = this.state.actuators.slice();
                newActuatorsStates[rowID] = {
                    ...this.state.actuators[rowID],
                    state: this.state.actuators[rowID].state === STATE_ON ? STATE_OFF : STATE_ON,
                };
                this.updateActuatorsStates(newActuatorsStates);
            }.bind(this))
            .catch((error) => {
                console.warn(error); // TODO show error
            })
            .done();
    },
    getTurnOnOffActionUrl: function (actuator) {
        var actions = actuator.actions;
        for (var i = 0, l = actions.length; i < l; i++) {
            if (actions[i].name === TURN_ON || actions[i].name === TURN_OFF) {
                return actions[i].href;
            }
        }
        // TODO error if on/off action or url not found
    },
});
