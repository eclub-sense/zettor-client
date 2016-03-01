'use strict';

var React = require('react-native');
var {
    ListView,
    TouchableHighlight,
    View,
    } = React;

var Row = require('./row');
var s = require('../../styles/style');

module.exports = React.createClass({
    getInitialState: function () {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: ds.cloneWithRows([
                {
                    title: 'Sensors',
                    componentName: 'sensors',
                },
                {
                    title: 'Lights',
                    componentName: 'lights',
                },
            ]),
        };
    },
    render: function () {
        return (
            <View style={[s.rowsContainer, s.bgLightGrey]}>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    renderSeparator={
                (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={[s.rowsSeparator, s.bgGrey]} />
            }
                />
            </View>
        );
    },
    renderRow: function (rowData:string, sectionID:number, rowID:number) {
        return (
            <TouchableHighlight onPress={() => this.pressRow(rowData)} underlayColor={'#8D99AE'}>
                <Row title={rowData.title}/>
            </TouchableHighlight>
        );
    },
    pressRow: function (rowData:string) {
        this.props.navigator.push({name: rowData.componentName});
    },
});
