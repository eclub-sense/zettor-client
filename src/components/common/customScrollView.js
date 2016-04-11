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

var s = require('../../styles/style');

var MARGIN = 40;

class CustomScrollView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: -1,
            height: -1,
            contentOffset: 0,
            orientation: '',
            items: [],
        };
    }

    componentWillMount() {
        this.setState({items: this.getItems()});

        if (this.props.data.length > 1) {
            this.setState({
                contentOffset: Dimensions.get('window').height,
            });
        }

        this.setState({
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            orientation: Orientation.getInitialOrientation(),
        });
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
            if (level == 0) {
                this.setState({contentOffset: this.state.height * (this.state.items.length - 2)})
            } else if (level == this.state.items.length - 1) {
                this.setState({contentOffset: this.state.height});
            } else {
                this.setState({contentOffset: event.nativeEvent.contentOffset.y});
            }
        }
    }

    orientationDidChange(orientation:String) {
        if (this.state.orientation != orientation) {
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
            items.push(
                <TouchableOpacity key={item.id} style={styles}
                                  onPress={this.handleOnPress.bind(this, item.componentName)}>
                    <Text style={[s.itemTitle, s.cDarkGrey]}>{item.title}</Text>
                    <Icon name={item.icon} size={200} color={s.cDarkGrey.color}/>
                </TouchableOpacity>
            );
        }.bind(this));

        return items;
    }

    handleOnPress(componentName) {
        this.props.navigator.push({name: componentName});
    }
}

var styles = StyleSheet.create({
    listView: {},
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
