'use strict';

var React = require('react-native');
var {
    Component,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewPagerAndroid,
    } = React;

import Icon from 'react-native-vector-icons/Ionicons';
import Orientation from 'react-native-orientation';

var GetEntities = require('../api/getEntities');
var wifi = require('react-native-android-wifi');

var MARGIN = 40;
const MENU_ITEMS = ['actuators', 'sensors', 'hubs'];
const STATE_ON = 'ON';
//const STATE_OFF = 'OFF';
const TURN_ON = 'turn-on';
const TURN_OFF = 'turn-off';

class CustomScrollView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            items: [],
            width: -1,
            height: -1,
            orientation: '',
            contentOffset: 0,
        };
    }

    componentWillMount() {
        this.setState({
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            orientation: Orientation.getInitialOrientation(),
        });
    }

    componentDidMount() {
        Orientation.addOrientationListener(this.orientationDidChange.bind(this));
        this.fetchItems()
            .then(
                function (items) {
                    this.setState({items: items, isLoading: false});
                    if (Platform.OS === 'ios' && items.length > 1) {
                        this.setState({
                            contentOffset: Dimensions.get('window').height,
                        });
                    }
                }.bind(this),
                function (error) {
                    console.warn(error);
                }
            )
            .catch((error) => {
                console.warn(error);
            });
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this.orientationDidChange);
    }

    render() {
        if (Platform.OS === 'ios') {
            return this.iosScrollView();
        } else if (Platform.OS === 'android') {
            return this.androidScrollView();
        } else {
            console.warn(`Unknown platform ${Platform.OS}`);
        }
    }

    androidScrollView() {
        return (
            <ViewPagerAndroid
                style={styles.viewPager}
                initialPage={0}>
                {this.makeItems([styles.itemWrapper, {height: this.state.height - 2 * MARGIN}])}
            </ViewPagerAndroid>
        );
    }

    iosScrollView() {
        return (
            <ScrollView
                pagingEnabled={true}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={50}
                onMomentumScrollEnd={this.shiftItems.bind(this)}
                contentOffset={{x:0, y:this.state.contentOffset}}
            >
                {this.makeItems([styles.itemWrapper, {height: this.state.height - 2 * MARGIN}])}
            </ScrollView>
        );
    }

    fetchItems():Array<any> {

        if (this.props.type === 'menu') {
            return new Promise(function (resolve, reject) {
                this.getMenuData()
                    .then(function (data) {
                        resolve(this.getItemsArray(data));
                    }.bind(this))
                    .catch(function (error) {
                        reject(error);
                    });
            }.bind(this));
        }

        if (this.props.type === 'hubs') {
            return new Promise(function (resolve, reject) {
                if (Platform.OS !== 'android') {
                    reject('Detecting HUBs is available only on Android platform');
                }
                this.getHubsData()
                    .then(function (data) {
                        resolve(this.getItemsArray(data));
                    }.bind(this))
                    .catch(function (error) {
                        reject(error);
                    });
            }.bind(this));
        }

        // TODO return new Promise
        GetEntities()
            .then((entities) => {
                if (entities === null) {
                    this.setState({isLoading: false});
                }
                var data = [];
                if (this.props.type === 'actuators') {
                    data = this.getActuatorsWithNeededProperties(entities.actuators);
                    return this.getItemsArray(data);
                } else if (this.props.type === 'sensors') {
                    data = this.getSensorProperties(entities.actuators[0]);
                    return this.getItemsArray(data);
                }
            })
            .catch((error) => {
                // TODO
                this.setState({isLoading: false});
            })
            .done();
    }

    getMenuData() {
        return new Promise(function (resolve, reject) {
            // TODO remove timeout
            setTimeout(() => {
                var data = [
                    {
                        id: 0,
                        title: 'Actuators',
                        type: 'actuators',
                        icon: 'power',
                    },
                    {
                        id: 1,
                        title: 'Sensors',
                        type: 'sensors',
                        icon: 'arrow-graph-up-right',
                    },
                ];
                if (Platform.OS === 'android') {
                    data.push({
                        id: 2,
                        title: 'HUBs',
                        type: 'hubs',
                        icon: 'android-cloud',
                    });
                }
                resolve(data);
            }, 1500);
        });
    }

    getHubsData() {
        return new Promise(
            function (resolve, reject) {
                wifi.loadWifiList((wifiStringList) => {
                        var data = [];
                        var wifiArray = JSON.parse(wifiStringList);
                        wifiArray.sort(function (a, b) {
                            var aLevel = a.level;
                            var bLevel = b.level;
                            return aLevel < bLevel ? 1 : aLevel > bLevel ? -1 : 0;
                        });
                        var id = 0;
                        wifiArray.forEach(function (network) {
                            data.push({
                                id: id,
                                title: network.SSID,
                                type: 'hub',
                                value: network.level + 100 + ' %',
                                bssid: network.BSSID,
                            });
                            id++;
                        });
                        resolve(data);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            }
        );
    }

    getItemsArray(data) {
        var items = data.slice();
        if (Platform.OS === 'ios' && items.length > 1) {
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
            //noinspection JSSuspiciousNameCombination
            this.setState({
                width: this.state.height,
                height: this.state.width,
                orientation: orientation
            });
        }
    }

    makeItems(styles:Array):Array<any> {
        var items = [];
        if (!this.state.isLoading) {
            if (this.state.items.length > 0) {
                this.state.items.forEach(function (item) {
                    var disabled = item.type === 'sensor';
                    items.push(
                        <View key={item.id}>
                            <TouchableOpacity
                                key={item.id}
                                style={styles}
                                activeOpacity={!disabled ? 0.5 : 1}
                                onPress={!disabled ? this.handleOnPress.bind(this, item) : null}
                            >
                                {this.makeItem(item)}
                            </TouchableOpacity>
                        </View>
                    );
                }.bind(this));
            } else {
                items.push(
                    <View key={'noData'}>
                        <TouchableOpacity
                            key={'noData'}
                            style={styles}
                            activeOpacity={1}
                            onPress={null}
                        >
                            {this.makeInfoItem('No data')}
                        </TouchableOpacity>
                    </View>
                );
            }
        } else {
            // TODO style
            items.push(
                <View key={'loading'}>
                    <TouchableOpacity
                        key={'loading'}
                        style={styles}
                        activeOpacity={1}
                        onPress={null}
                    >
                        {this.makeInfoItem('Loading...')}
                    </TouchableOpacity>
                </View>
            );
        }

        return items;
    }

    makeItem(item) {
        var title = <Text style={styles.itemTitle}>{item.title}</Text>;
        if (item.type === 'sensor' || item.type === 'hub') {
            return (
                <View style={styles.itemContainer}>
                    {title}
                    <Text style={styles.itemValue}>{item.value}</Text>
                </View>
            );
        } else if (item.type === 'actuator' || MENU_ITEMS.indexOf(item.type) !== -1) {
            var icon;
            if (item.type === 'actuator') {
                icon = item.state ? item.iconOn : item.iconOff;
            } else {
                icon = item.icon;
            }
            return (
                <View style={styles.itemContainer}>
                    {title}
                    <Icon name={icon} size={150} color="#2980B9"/>
                </View>
            );
        } else {
            console.warn(`Unknown item type ${item.type}`);
        }
    }

    makeInfoItem(title) {
        // TODO style
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{title}</Text>
            </View>
        );
    }

    handleOnPress(item) {
        if (MENU_ITEMS.indexOf(item.type) !== -1) {
            this.pushToNavigator(item.type);
        } else if (item.type === 'actuator') {
            this.handleActuatorPress(item);
        } else if (item.type === 'hub') {
            this.pushToNavigator('menu');
        } else {
            console.warn(`Unknown item type ${item.type}`);
        }
    }

    pushToNavigator(type) {
        this.props.navigator.push(
            {
                name: 'customScrollView',
                passProps: {type: type}
            }
        );
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
                console.warn('handleActuatorPress', error);
            })
            .done();
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
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
    },
    itemTitle: {
        fontSize: 50,
        color: '#2980B9',
        textAlign: 'center',
    },
    itemValue: {
        fontSize: 50,
        color: '#2980B9',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    itemWrapper: {
        borderRadius: 5,
        padding: 10,
        margin: MARGIN,
        backgroundColor: '#ECF0F1',
    },
    viewPager: {
        flex: 1,
    },
});

module.exports = CustomScrollView;
