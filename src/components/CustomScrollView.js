'use strict';

var config = require('../../config.json');
var iosClientId = config.iosClientId;
var webClientId = config.webClientId;

var React = require('react-native');
var {
    BackAndroid,
    Component,
    DeviceEventEmitter,
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

var BackgroundTimer = require('react-native-background-timer');
var CustomScrollViewItem = require('./CustomScrollViewItem');
var {itemMargin, mainItems, networksCheckDelay} = require('../env');
var GetEntities = require('../api/getEntities');
var PushNotification = require('react-native-push-notification');
var reactMixin = require('react-mixin');
var TimerMixin = require('react-timer-mixin');
var wifi = require('react-native-android-wifi');

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
            connectedHub: this.props.connectedHub,
            listeningForBackgroundTimer: this.props.listeningForBackgroundTimer,
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
        if (!this.state.listeningForBackgroundTimer && Platform.OS === 'android') {
            BackgroundTimer.start(networksCheckDelay);
            this.setState({listeningForBackgroundTimer: true});
            DeviceEventEmitter.addListener('backgroundTimer', () => {
                this.checkHubs();
            });
        }

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

        if (Platform.OS === 'android') {
            PushNotification.configure({
                onNotification: function (notification) {
                    this.onNotificationPress(notification);
                }.bind(this),
            });
        }

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
                            if (items.length > 1) {
                                if (Platform.OS === 'ios') {
                                    this.setState({
                                        contentOffset: this.getInitialContentOffset(),
                                    });
                                }
                                if (Platform.OS === 'android' && this.state.orientation === 'LANDSCAPE') {
                                    this.viewPager.setPage(1);
                                }
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

    onNotificationPress(notification) {
        var data = {
            connectedHub: this.state.connectedHub,
            detectedHub: notification.data,
        };
        this.pushToNavigator('hubDetected', data);
    }

    getInitialContentOffset() {
        var itemSize = this.state.width - itemMargin;

        return 2 * itemSize - ((this.state.height - itemSize) / 2);
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this.orientationDidChange);
    }

    render() {
        //if (Platform.OS === 'android' && this.state.orientation === 'PORTRAIT') {
        //    return this.infoItem('Rotate your device into landscape');
        //}
        //if (Platform.OS === 'ios' && this.state.orientation === 'LANDSCAPE') {
        //    return this.infoItem('Rotate your device into portrait');
        //}
        if (this.state.isLoading) {
            return this.infoItem('Loading...');
        }
        if (Platform.OS === 'ios') {
            return this.iosScrollView();
        }
        if (Platform.OS === 'android') {
            return this.androidScrollView();
        }
    }

    androidScrollView() {
        return (
            <ViewPagerAndroid
                onPageSelected={this.onPageSelected.bind(this)}
                ref={viewPager => { this.viewPager = viewPager; }}
                style={styles.viewPager}>
                {this.makeItems()}
            </ViewPagerAndroid>
        );
    }

    onPageSelected(event:Object) {
        var position = event.nativeEvent.position;
        this.shiftItemsAndroid(position);
    }

    iosScrollView() {
        return (
            <ScrollView
                snapToInterval={this.state.width - itemMargin}
                decelerationRate={0}
                snapToAlignment="center"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={50}
                onMomentumScrollEnd={this.shiftItemsIOS.bind(this)}
                contentOffset={{x:0, y:this.state.contentOffset}}
            >
                {this.makeItems()}
            </ScrollView>
        );
    }

    fetchItems():Array<any> {
        return new Promise(function (resolve, reject) {

            if (this.props.type === 'menu' &&
                (
                    Platform.OS === 'ios' ||
                    (Platform.OS === 'android' && this.state.connectedHub != null)
                )
            ) {
                this.getMenuData()
                    .then(function (data) {
                        resolve(this.getItemsArray(data));
                    }.bind(this))
                    .catch(function (error) {
                        reject(error);
                    });
            }

            if (this.props.type === 'hubs' && Platform.OS === 'ios' ||
                (Platform.OS === 'android' && this.state.connectedHub == null)
            ) {
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

            if (this.props.type === 'hubDetected') {
                resolve([{
                    id: 'hubDetected',
                    type: 'hubDetected',
                    title: 'HUB Detected',
                    subtitles: [this.props.data.detectedHub.title],
                    data: this.props.data,
                }]);
            }

            if (this.props.type === 'actuators' || this.props.type === 'sensors') {
                GetEntities(this.state.connectedHub.url)
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
        var oldFirstItem;
        var oldLastItem;
        var newFirstItem;
        var newLastItem;
        var items = data.slice();

        if (items.length > 1) {
            if (Platform.OS === 'android') {
                oldLastItem = items[items.length - 1];
                newFirstItem = Object.assign({}, oldLastItem);
                newFirstItem.id = 'F' + oldLastItem.id;
                items.unshift(newFirstItem);

                oldFirstItem = items[1];
                newLastItem = Object.assign({}, oldFirstItem);
                newLastItem.id = 'L' + oldFirstItem.id;
                items.push(newLastItem);
            }

            if (Platform.OS === 'ios') {
                oldLastItem = items[items.length - 1];
                newFirstItem = Object.assign({}, oldLastItem);
                newFirstItem.id = 'F2' + oldLastItem.id;
                items.unshift(newFirstItem);

                oldLastItem = items[items.length - 2];
                newFirstItem = Object.assign({}, oldLastItem);
                newFirstItem.id = 'F1' + oldLastItem.id;
                items.unshift(newFirstItem);

                oldFirstItem = items[2];
                newLastItem = Object.assign({}, oldFirstItem);
                newLastItem.id = 'L1' + oldFirstItem.id;
                items.push(newLastItem);

                oldFirstItem = items[3];
                newLastItem = Object.assign({}, oldFirstItem);
                newLastItem.id = 'L2' + oldFirstItem.id;
                items.push(newLastItem);
            }
        }

        return items;
    }

    shiftItemsIOS(event:Object) {
        var width = this.state.width;
        var itemSize = width - itemMargin;
        var startPosition = itemSize - ((this.state.height - itemSize) / 2);
        var contentOffsetY = event.nativeEvent.contentOffset.y;
        var numOfItems = this.state.items.length;
        var isLast = (contentOffsetY - startPosition) / (width - itemMargin) === numOfItems - 4;

        if (numOfItems > 1) {
            if (contentOffsetY === startPosition) {
                this.setState({contentOffset: (width - itemMargin) * (numOfItems - 4) + startPosition});
            } else if (isLast) {
                this.setState({contentOffset: startPosition});
            } else {
                this.setState({contentOffset: contentOffsetY});
            }
        }
    }

    shiftItemsAndroid(position) {
        var numOfItems = this.state.items.length;
        if (position === 0) {
            this.setTimeout(() => {
                this.viewPager.setPageWithoutAnimation(numOfItems - 2);
            }, 300);
        }
        if (position === numOfItems - 1) {
            this.setTimeout(() => {
                this.viewPager.setPageWithoutAnimation(1);
            }, 300);
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

    infoItem(text) {
        return (
            <View key={'info'}>
                <TouchableOpacity
                    key={'info'}
                    style={this.getTouchableOpacityStyle()}
                    activeOpacity={1}
                    onPress={null}
                >
                    {this.makeInfoItem(text)}
                </TouchableOpacity>
            </View>
        );
    }

    makeItems() {
        if (this.state.items.length > 0) {
            var items = [];
            this.state.items.forEach(function (item) {
                var disabled = item.type === 'sensor' || item.type === 'hubDetected';
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
        if (mainItems.indexOf(item.type) !== -1) {
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
            this.setState({
                connectedHub: {
                    title: item.title,
                    url: this.getHubUrl(item.bssid),
                    bssid: item.bssid,
                }
            });
            this.props.navigator.immediatelyResetRouteStack([{
                name: 'customScrollView',
                passProps: {
                    type: 'menu',
                    connectedHub: this.state.connectedHub,
                    listeningForBackgroundTimer: this.state.listeningForBackgroundTimer,
                }
            }]);
        } else {
            console.warn(`Unknown item type ${item.type}`);
        }
    }

    pushToNavigator(type, data) {
        this.props.navigator.push(
            {
                name: 'customScrollView',
                passProps: {
                    type: type,
                    data: data,
                    connectedHub: this.state.connectedHub,
                    listeningForBackgroundTimer: this.state.listeningForBackgroundTimer,
                },
            }
        );
    }

    //noinspection JSUnusedLocalSymbols
    getHubUrl(bssid) {
        // TODO get HUB url by BSSID (API needed)
        return config.serverUrl;
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
        var style = [styles.itemWrapper];

        var height;
        if (Platform.OS === 'ios') {
            height = this.state.width - 2 * itemMargin;
            if (this.state.items.length < 2) {
                style.push({marginTop: itemMargin + (this.state.height - this.state.width) / 2});
            }
        }
        if (Platform.OS === 'android') {
            height = this.state.height - 2 * itemMargin;
        }
        style.push({height: height});

        return style;
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

    checkHubs() {
        if (this.state.connectedHub != null) {
            this.getHubsData()
                .then(function (data) {
                    if (data.length > 0) {
                        var hubWithTheBestSignal = data[0];
                        var notificationData = {
                            title: hubWithTheBestSignal.title,
                            url: this.getHubUrl(hubWithTheBestSignal.bssid),
                            bssid: hubWithTheBestSignal.bssid,
                        };
                        var hubWithTheBestSignalBssid = hubWithTheBestSignal.bssid;
                        if (hubWithTheBestSignalBssid !== this.state.connectedHub.bssid) {
                            // TODO and hubWithTheBestSignalBssid !== ignoredHubBssid
                            PushNotification.localNotification({
                                title: 'Zettor HUB Detected',
                                message: hubWithTheBestSignal.title,
                                data: JSON.stringify(notificationData),
                            });
                        }
                    }
                }.bind(this))
                .catch((error) => {
                    console.log(error);
                });
        }
    }
}

var styles = StyleSheet.create({
    itemWrapper: {
        borderRadius: 5,
        padding: 10,
        marginTop: itemMargin / 2,
        marginBottom: itemMargin / 2,
        marginLeft: itemMargin,
        marginRight: itemMargin,
        backgroundColor: '#ECF0F1',
    },
    viewPager: {
        flex: 1,
    },
});

reactMixin(CustomScrollView.prototype, TimerMixin);

module.exports = CustomScrollView;
