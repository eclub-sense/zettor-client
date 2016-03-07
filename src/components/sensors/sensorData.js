var React = require('react-native');
var {
    ListView,
    View,
    } = React;

var DataRow = require('./dataRow');
var s = require('../../styles/style');

module.exports = React.createClass({
    getInitialState: function () {
        var propsData = this.props.data;
        var allData = [];
        for (var key in propsData) {
            if (propsData.hasOwnProperty(key)) {
                var data = {};
                data['label'] = key;
                data['value'] = propsData[key];
            }
            allData.push(data)
        }
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            data: ds.cloneWithRows(allData),
        };
    },
    render: function () {
        return <View style={[s.rowsContainer, s.bgLightGrey]}>
            <ListView
                dataSource={this.state.data}
                renderRow={this.renderRow}
                renderSeparator={
                    (sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={[s.rowsSeparator, s.bgGrey]} />
                }
            />
        </View>
    },
    renderRow: function (data, sectionID:number, rowID:number) {
        console.log(data);
        return (
            <DataRow label={data.label} value={data.value}/>
        );
    },
});
