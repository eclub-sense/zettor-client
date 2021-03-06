'use strict';

const config = require('../../config.json');
const iosClientId = config.iosClientId;
const webClientId = config.webClientId;

const React = require('react-native');
const {
    BackAndroid,
    Component,
    DeviceEventEmitter,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    ToastAndroid,
    TouchableOpacity,
    View,
    ViewPagerAndroid,
    } = React;

import {GoogleSignin} from 'react-native-google-signin';
import Toast from 'react-native-root-toast';

const BackgroundTimer = require('react-native-background-timer');
const CustomScrollViewItem = require('./CustomScrollViewItem');
const {itemMargin, mainItems, networksCheckDelay} = require('../env');
const GetEntities = require('../api/getEntities');
const PushNotification = require('react-native-push-notification');
const reactMixin = require('react-mixin');
const TimerMixin = require('react-timer-mixin');
const wifi = require('react-native-android-wifi');

if (Platform.OS === 'android') {
    var ExtraDimensions = require('react-native-extra-dimensions-android');
}

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
            contentOffset: 0,
            user: null,
            connectedHub: this.props.connectedHub,
            ignoredHub: this.props.ignoredHub,
            listeningForBackgroundTimer: this.props.listeningForBackgroundTimer,
            page: 1,
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
        if (Platform.OS === 'android') {
            if (!this.state.listeningForBackgroundTimer) {
                BackgroundTimer.start(networksCheckDelay);
                this.setState({listeningForBackgroundTimer: true});
                DeviceEventEmitter.addListener('backgroundTimer', () => {
                    this.checkHubs();
                });
            }
        }

        this.setState({
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
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
                                if (Platform.OS === 'android') {
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
        const data = {
            connectedHub: this.state.connectedHub,
            detectedHub: notification.data,
        };
        this.pushToNavigator('hubDetected', data);
    }

    getInitialContentOffset() {
        const itemSize = this.state.width - itemMargin;

        return 2 * itemSize - ((this.state.height - itemSize) / 2);
    }

    render() {
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
        const position = event.nativeEvent.position;
        this.setState({page: position});
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

    fetchItems() {
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

            if (this.props.type === 'hubDetected') {
                resolve([{
                    id: 'hubDetected',
                    type: 'hubDetected',
                    title: 'HUB Detected',
                    subtitles: [this.props.data.detectedHub.title],
                    data: this.props.data,
                    isAlone: true,
                }]);
            }

            if (this.props.type === 'actuators' || this.props.type === 'sensors') {
                const hubUrl = Platform.OS === 'android' ? this.state.connectedHub.url : config.serverUrl;
                GetEntities(hubUrl)
                    .then(function (entities) {
                        if (entities === null) {
                            resolve([]);
                        }
                        let data = [];
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
            const data = this.getMenuItemsArray();
            resolve(data);
        }.bind(this));
    }

    getMenuItemsArray() {
        let menuItemsArray = [
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
                        let data = [];
                        const wifiArray = JSON.parse(wifiStringList);
                        wifiArray.sort(function (a, b) {
                            const aLevel = a.level;
                            const bLevel = b.level;
                            return aLevel < bLevel ? 1 : aLevel > bLevel ? -1 : 0;
                        });
                        let id = 0;
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
        let oldFirstItem;
        let oldLastItem;
        let newFirstItem;
        let newLastItem;
        let items = data.slice();

        if (items.length === 1) {
            items[0].isAlone = true;
        }

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
        const width = this.state.width;
        const itemSize = width - itemMargin;
        const startPosition = itemSize - ((this.state.height - itemSize) / 2);
        const contentOffsetY = event.nativeEvent.contentOffset.y;
        const numOfItems = this.state.items.length;
        const isLast = (contentOffsetY - startPosition) / (width - itemMargin) === numOfItems - 4;

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
        const numOfItems = this.state.items.length;
        if (position === 0) {
            this.setTimeout(() => {
                const page = numOfItems - 2;
                this.viewPager.setPageWithoutAnimation(page);
                this.setState({page: page});
            }, 300);
        }
        if (position === numOfItems - 1) {
            this.setTimeout(() => {
                const page = 1;
                this.viewPager.setPageWithoutAnimation(page);
                this.setState({page: page});
            }, 300);
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
            let items = [];
            this.state.items.forEach(function (item) {
                const disabled = item.type === 'sensor' || item.type === 'hubDetected';
                items.push(
                    <View key={item.id}>
                        <TouchableOpacity
                            key={item.id}
                            style={this.getTouchableOpacityStyle()}
                            activeOpacity={!disabled ? ACTIVE_OPACITY : 1}
                            onPress={!disabled ? this.handleOnPress.bind(this, item) : null}
                        >
                            <CustomScrollViewItem
                                item={item}
                                onConnectToHubButtonPress={this.connectToHub.bind(this)}
                                onStayConnectedButtonPress={this.ignoreHub.bind(this)}
                                onConnectToOtherHubButtonPress={this.pushHubsToNavigator.bind(this)}
                                onPrevItemPress={
                                    () => {
                                        this.setState({page: --this.state.page});
                                        this.viewPager.setPage(this.state.page);
                                        this.shiftItemsAndroid(this.state.page);
                                    }
                                }
                                onNextItemPress={
                                    () => {
                                        this.setState({page: ++this.state.page});
                                        this.viewPager.setPage(this.state.page);
                                        this.shiftItemsAndroid(this.state.page);
                                    }
                                }
                            />
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
        const item = {type: 'info', title: title, isAlone: true};

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
            const newHubData = {
                title: item.title,
                url: this.getHubUrl(item.bssid),
                bssid: item.bssid,
            };
            this.connectToHub(newHubData);
        } else {
            console.warn(`Unknown item type ${item.type}`);
        }
    }

    showMenu(navigator) {
        navigator.immediatelyResetRouteStack([{
            name: 'customScrollView',
            passProps: {
                type: 'menu',
                connectedHub: this.state.connectedHub,
                ignoredHub: this.state.ignoredHub,
                listeningForBackgroundTimer: this.state.listeningForBackgroundTimer,
            }
        }]);
    }

    connectToHub(hubData) {
        this.setState({connectedHub: hubData});
        this.showMenu(this.props.navigator);
        if (Platform.OS === 'android') {
            ToastAndroid.show(`Connected to ${hubData.title}`, ToastAndroid.LONG);
        }
    }

    ignoreHub(hubData) {
        this.setState({ignoredHub: hubData});
        this.showMenu(this.props.navigator);
    }

    pushHubsToNavigator() {
        this.pushToNavigator('hubs');
    }

    pushToNavigator(type, data) {
        this.props.navigator.push(
            {
                name: 'customScrollView',
                passProps: {
                    type: type,
                    data: data,
                    connectedHub: this.state.connectedHub,
                    ignoredHub: this.state.ignoredHub,
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
        const encodedKey = encodeURIComponent('action');
        const encodedValue = encodeURIComponent(item.state ? TURN_OFF : TURN_ON);
        const formBody = encodedKey + '=' + encodedValue;

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
        let result = [];
        for (let i = 0, l = actuators.length; i < l; i++) {
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
        let result = [];

        const sensorProperties = sensor.properties;
        const propertiesKeys = Object.keys(sensorProperties);

        for (let i = 0, spl = propertiesKeys.length; i < spl; i++) {
            const key = propertiesKeys[i];
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
        const actions = actuator.actions;
        for (let i = 0, l = actions.length; i < l; i++) {
            if (actions[i].name === TURN_ON || actions[i].name === TURN_OFF) {
                return actions[i].href;
            }
        }
    }

    getTouchableOpacityStyle() {
        let style = [styles.itemWrapper];

        let height;
        if (Platform.OS === 'ios') {
            style.push({
                marginTop: itemMargin / 2,
                marginBottom: itemMargin / 2,
            });
            height = this.state.width - 2 * itemMargin;
            if (this.state.items.length < 2) {
                style.push({marginTop: itemMargin + (this.state.height - this.state.width) / 2});
            }
        }
        if (Platform.OS === 'android') {
            style.push({
                marginTop: itemMargin,
                marginBottom: itemMargin,
            });
            height = ExtraDimensions.get('REAL_WINDOW_HEIGHT')
                - ExtraDimensions.get('STATUS_BAR_HEIGHT')
                - 2 * itemMargin;
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
            .then(() => {
                this.showMenu(this.props.navigator);
                const toastMessage = `You are logged in as ${this.state.user.name}`;
                if (Platform.OS === 'android') {
                    ToastAndroid.show(toastMessage, ToastAndroid.LONG);
                } else {
                    this.showToast(toastMessage);
                }
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
            .then(() => {
                this.showMenu(this.props.navigator);
                const toastMessage = 'You have been successfully logged out';
                if (Platform.OS === 'android') {
                    ToastAndroid.show(toastMessage, ToastAndroid.LONG);
                } else {
                    this.showToast(toastMessage);
                }
            })
            .done();
    }

    showToast(message) {
        Toast.show(message, {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
        });
    }

    checkHubs() {
        if (this.state.connectedHub != null) {
            this.getHubsData()
                .then(function (data) {
                    if (data.length > 0) {
                        const hubWithTheBestSignal = data[0];
                        const notificationData = {
                            title: hubWithTheBestSignal.title,
                            url: this.getHubUrl(hubWithTheBestSignal.bssid),
                            bssid: hubWithTheBestSignal.bssid,
                        };
                        const hubWithTheBestSignalBssid = hubWithTheBestSignal.bssid;
                        if (this.notificationNeeded(hubWithTheBestSignalBssid)) {
                            PushNotification.localNotification({
                                title: 'Zettor HUB Detected',
                                message: hubWithTheBestSignal.title,
                                data: JSON.stringify(notificationData),
                            });
                        }
                    }
                }.bind(this))
                .catch((error) => {
                    console.warn(error);
                });
        }
    }

    notificationNeeded(hubWithTheBestSignalBssid) {
        return hubWithTheBestSignalBssid !== this.state.connectedHub.bssid &&
            (
                this.state.ignoredHub == null ||
                (
                    this.state.ignoredHub != null &&
                    hubWithTheBestSignalBssid !== this.state.ignoredHub.bssid
                )
            );
    }
}

const styles = StyleSheet.create({
    itemWrapper: {
        marginLeft: itemMargin,
        marginRight: itemMargin,
    },
    viewPager: {
        flex: 1,
    },
});

reactMixin(CustomScrollView.prototype, TimerMixin);

module.exports = CustomScrollView;
