'use strict';

var React = require('react-native');
var {
    Component,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    } = React;

import Icon from 'react-native-vector-icons/Ionicons';
import Orientation from 'react-native-orientation';

var GetEntities = require('../api/getEntities');
var s = require('../../styles/style');

var MARGIN = 40;
const STATE_ON = 'ON';
const STATE_OFF = 'OFF';
const TURN_ON = 'turn-on';
const TURN_OFF = 'turn-off';

class CustomScrollView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            width: -1,
            height: -1,
            orientation: '',
            contentOffset: 0,
        };
    }

    componentWillMount() {
        this.setState({
            items: this.getItems(),
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            orientation: Orientation.getInitialOrientation(),
        });

        if (this.props.data.length > 1) {
            this.setState({
                contentOffset: Dimensions.get('window').height,
            });
        }
    }

    componentDidMount() {
        Orientation.addOrientationListener(this.orientationDidChange.bind(this));
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this.orientationDidChange);
    }

    render() {
        return (
            <ScrollView
                style={styles.listView}
                pagingEnabled={true}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={50}
                onMomentumScrollEnd={this.shiftItems.bind(this)}
                contentOffset={{x:0, y:this.state.contentOffset}}
            >
                {this.makeItems([styles.itemWrapper, s.bcDarkGrey, {height: this.state.height - 2 * MARGIN}])}
            </ScrollView>
        );
    }

    getItems():Array<any> {
        var items = this.props.data.slice();
        if (items.length > 1) {
            var oldLastItem = items[items.length - 1];
            var newFirstItem = Object.assign({}, oldLastItem);
            newFirstItem.id = 'F' + oldLastItem.id;
            items.unshift(newFirstItem);

            var oldFirstItem = items[1];
            var newLastItem = Object.assign({}, oldFirstItem);
            newLastItem.id = 'L' + oldFirstItem.id;
            items.push(newLastItem);
        }

        return items;
    }

    shiftItems(event:Object) {
        var level = event.nativeEvent.contentOffset.y / this.state.height;
        if (this.state.items.length > 1) {
            if (level === 0) {
                this.setState({contentOffset: this.state.height * (this.state.items.length - 2)});
            } else if (level === this.state.items.length - 1) {
                this.setState({contentOffset: this.state.height});
            } else {
                this.setState({contentOffset: event.nativeEvent.contentOffset.y});
            }
        }
    }

    orientationDidChange(orientation:String) {
        if (this.state.orientation !== orientation) {
            this.setState({
                width: this.state.height,
                height: this.state.width,
                orientation: orientation
            });
        }
    }

    makeItems(styles:Array):Array<any> {
        var items = [];
        this.state.items.forEach(function (item) {
            var itemValue = this.getItemValue(item);
            var disabled = item.type === 'sensor';

            items.push(
                <TouchableOpacity
                    key={item.id}
                    style={styles}
                    activeOpacity={!disabled ? 0.1 : 1}
                    onPress={!disabled ? this.handleOnPress.bind(this, item) : null}
                >
                    <Text style={[s.itemTitle, s.cDarkGrey]}>{item.title}</Text>
                    {itemValue}
                </TouchableOpacity>
            );
        }.bind(this));

        return items;
    }

    getItemValue(item) {
        if (item.type !== 'sensor') {
            var icon;
            if (item.type === 'actuator') {
                icon = item.state ? item.iconOn : item.iconOff;
            } else {
                icon = item.icon;
            }
            return (
                <Icon name={icon} size={150} color={s.cDarkGrey.color}/>
            );
        } else {
            return (
                <Text style={s.itemValue}>{item.value}</Text>
            );
        }
    }

    handleOnPress(item) {
        if (item.type === 'actuators' || item.type === 'sensors') {
            GetEntities()
                .then((entities) => {
                    var data = [];
                    if (item.type === 'actuators') {
                        data = this.getActuatorsWithNeededProperties(entities.actuators);
                    } else if (item.type === 'sensors') {
                        data = this.getSensorProperties(entities.actuators[0]);
                    }
                    this.pushToNavigator(data);
                });
        } else if (item.type === 'actuator') {
            this.handleActuatorPress(item);
        }
    }

    handleActuatorPress(item) {
        var encodedKey = encodeURIComponent('action');
        var encodedValue = encodeURIComponent(item.state ? TURN_OFF : TURN_ON);
        var formBody = encodedKey + '=' + encodedValue;

        fetch(item.actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formBody
            }
        )
            .then(function () {
                let items = this.state.items.slice();
                items.forEach(function (currentItem, i) {
                    if (currentItem.deviceId === item.deviceId) {
                        items[i].state = !currentItem.state;
                    }
                });
                this.setState({items: items});
            }.bind(this))
            .catch((error) => {
                console.warn(error); // TODO show error
            })
            .done();
    }

    pushToNavigator(data) {
        this.props.navigator.push(
            {
                name: 'customScrollView',
                passProps: {data}
            }
        );
    }

    getActuatorsWithNeededProperties(actuators) {
        var result = [];
        for (var i = 0, l = actuators.length; i < l; i++) {
            result.push({
                id: i,
                deviceId: actuators[i].properties.id,
                title: actuators[i].properties.name,
                type: 'actuator',
                state: actuators[i].properties.state === STATE_ON,
                iconOn: 'ios-lightbulb', // TODO get from API
                iconOff: 'ios-lightbulb-outline', // TODO get from API
                actionUrl: this.getActuatorActionUrl(actuators[i]),
            });
        }

        return result;
    }

    getSensorProperties(sensor) {
        var result = [];

        var sensorProperties = sensor.properties;
        var propertiesKeys = Object.keys(sensorProperties);

        for (var i = 0, spl = propertiesKeys.length; i < spl; i++) {
            var key = propertiesKeys[i];
            if (
                key === 'id' ||
                key === 'illumThreshold' ||
                key === 'increment' ||
                key === 'type' ||
                key === 'name' ||
                key === 'state'
            ) {
                continue;
            }

            result.push({
                id: i,
                title: key.charAt(0).toUpperCase() + key.slice(1),
                type: 'sensor',
                value: sensorProperties[key],
            });
        }

        return result;
    }

    getActuatorActionUrl(actuator) {
        var actions = actuator.actions;
        for (var i = 0, l = actions.length; i < l; i++) {
            if (actions[i].name === TURN_ON || actions[i].name === TURN_OFF) {
                return actions[i].href;
            }
        }
    }
}

var styles = StyleSheet.create({
    itemWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1,
        padding: 30,
        margin: MARGIN,
    },
});

module.exports = CustomScrollView;
