'use strict';

var config = require('../../../config.json');
var iosClientId = config.iosClientId;
var webClientId = config.webClientId;

var React = require('react-native');
var {
    BackAndroid,
    Component,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewPagerAndroid,
    } = React;

import {GoogleSignin} from 'react-native-google-signin';
import Orientation from 'react-native-orientation';

var CustomScrollViewItem = require('../CustomScrollViewItem');
var GetEntities = require('../api/getEntities');
var {menuItems} = require('../../env');
var wifi = require('react-native-android-wifi');

var MARGIN = 40;
const STATE_ON = 'ON';
const TURN_ON = 'turn-on';
const TURN_OFF = 'turn-off';
const ACTIVE_OPACITY = 0.5;

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
            user: null,
        };
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    componentWillMount() {
        this.setState({
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            orientation: Orientation.getInitialOrientation(),
        });
    }

    componentDidMount() {
        GoogleSignin.configure({
            iosClientId: iosClientId,
            webClientId: webClientId,
            offlineAccess: true,
        });

        GoogleSignin.currentUserAsync()
            .then((user) => {
                this.setState({user: user});
            })
            .then(()=> {
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
            })
            .done();
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this.orientationDidChange);
    }

    render() {
        if (this.state.isLoading) {
            return this.loadingItem();
        } else if (Platform.OS === 'ios') {
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
                {this.makeItems()}
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
                {this.makeItems()}
            </ScrollView>
        );
    }

    fetchItems():Array<any> {
        return new Promise(function (resolve, reject) {

            if (this.props.type === 'menu') {
                this.getMenuData()
                    .then(function (data) {
                        resolve(this.getItemsArray(data));
                    }.bind(this))
                    .catch(function (error) {
                        reject(error);
                    });
            }

            if (this.props.type === 'actuators' || this.props.type === 'sensors') {
                GetEntities()
                    .then(function (entities) {
                        if (entities === null) {
                            resolve([]);
                        }
                        var data = [];
                        if (this.props.type === 'actuators') {
                            data = this.getActuatorsWithNeededProperties(entities.actuators);
                            resolve(this.getItemsArray(data));
                        } else if (this.props.type === 'sensors') {
                            data = this.getSensorProperties(entities.actuators[0]);
                            resolve(this.getItemsArray(data));
                        }
                    }.bind(this))
                    .catch(function (error) {
                        reject(error);
                    });
            }

            if (this.props.type === 'hubs') {
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
            }

            if (this.props.type === 'login' || this.props.type === 'logout') {
                resolve([]);
            }

        }.bind(this));
    }

    getMenuData() {
        return new Promise(function (resolve, reject) {
            var data = this.getMenuItemsArray();
            resolve(data);
        }.bind(this));
    }

    getMenuItemsArray() {
        var menuItemsArray = [
            {
                id: 'actuators',
                type: 'actuators',
                title: 'Actuators',
                icon: 'power',
            },
            {
                id: 'sensors',
                type: 'sensors',
                title: 'Sensors',
                icon: 'arrow-graph-up-right',
            },
        ];
        if (Platform.OS === 'android') {
            menuItemsArray.push({
                id: 'hubs',
                type: 'hubs',
                title: 'HUBs',
                icon: 'android-cloud',
            });
        }
        if (!this.state.user) {
            menuItemsArray.push({
                id: 'login',
                type: 'login',
                title: 'Login',
                subtitles: ['via Google'],
                icon: 'log-in',
            });
        } else {
            menuItemsArray.push({
                id: 'logout',
                type: 'logout',
                title: 'Logout',
                subtitles: [this.state.user.name, this.state.user.email],
                icon: 'log-out',
            });
        }

        return menuItemsArray;
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

    loadingItem() {
        return (
            <View key={'loading'}>
                <TouchableOpacity
                    key={'loading'}
                    style={this.getTouchableOpacityStyle()}
                    activeOpacity={1}
                    onPress={null}
                >
                    {this.makeInfoItem('Loading...')}
                </TouchableOpacity>
            </View>
        );
    }

    makeItems() {
        if (this.state.items.length > 0) {
            var items = [];
            this.state.items.forEach(function (item) {
                var disabled = item.type === 'sensor';
                items.push(
                    <View key={item.id}>
                        <TouchableOpacity
                            key={item.id}
                            style={this.getTouchableOpacityStyle()}
                            activeOpacity={!disabled ? ACTIVE_OPACITY : 1}
                            onPress={!disabled ? this.handleOnPress.bind(this, item) : null}
                        >
                            <CustomScrollViewItem item={item}/>
                        </TouchableOpacity>
                    </View>
                );
            }.bind(this));
            return items;
        } else {
            return (
                <View key={'noData'}>
                    <TouchableOpacity
                        key={'noData'}
                        style={this.getTouchableOpacityStyle()}
                        activeOpacity={1}
                        onPress={null}
                    >
                        {this.makeInfoItem(`No ${this.props.type} found`)}
                    </TouchableOpacity>
                </View>
            );
        }
    }

    makeInfoItem(title) {
        var item = {type: 'info', title: title};

        return (
            <CustomScrollViewItem item={item}/>
        );
    }

    handleOnPress(item) {
        if (menuItems.indexOf(item.type) !== -1) {
            if (item.type === 'login') {
                this.logIn();
            } else if (item.type === 'logout') {
                this.logOut();
            } else {
                this.pushToNavigator(item.type);
            }
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

    getTouchableOpacityStyle() {
        return [styles.itemWrapper, {height: this.state.height - 2 * MARGIN}];
    }

    logIn() {
        GoogleSignin.signIn()
            .then((user) => {
                this.setState({user: user});
            })
            .then(()=> {
                this.setState({items: this.getItemsArray(this.getMenuItemsArray())});
            })
            .catch((error) => {
                if (error.code !== -5) { // user doesn't cancel signin process
                    console.warn('WRONG SIGNIN', error);
                }
            })
            .done();
    }

    logOut() {
        GoogleSignin.revokeAccess()
            .then(() => {
                GoogleSignin.signOut();
            })
            .then(() => {
                this.setState({user: null});
            })
            .then(()=> {
                this.setState({items: this.getItemsArray(this.getMenuItemsArray())});
            })
            .done();
    }
}

var styles = StyleSheet.create({
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
