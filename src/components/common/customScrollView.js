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
            items: this.getItems(),
        };
    }

    componentWillMount() {
        var items = this.state.items;
        if (items.length > 1) {

            var oldLastItem = items[items.length - 1];
            var newFirstItem = {
                id: 'F' + oldLastItem.id,
                title: oldLastItem.title,
            };
            items.unshift(newFirstItem);

            var oldFirstItem = items[1];
            var newLastItem = {
                id: 'L' + oldFirstItem.id,
                title: oldFirstItem.title,
            };
            items.push(newLastItem);

            this.setState({
                items: items,
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
        const items = this.makeItems(
            [
                styles.itemWrapper,
                s.bcDarkGrey,
                {height: this.state.height - 2 * MARGIN}
            ]
        );
        return (
            <ScrollView
                style={styles.listView}
                pagingEnabled={true}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={50}
                onMomentumScrollEnd={this.shiftItems.bind(this)}
                contentOffset={{x:0, y:this.state.contentOffset}}
            >
                {items}
            </ScrollView>
        );
    }

    getItems() {
        return [
            {
                title: 'First',
                id: 1,
            },
            {
                title: 'Second',
                id: 2,
            },
            {
                title: 'Third',
                id: 3,
            },
            {
                title: 'Fourth',
                id: 4,
            },
        ]
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
                <TouchableOpacity key={item.id} style={styles}>
                    <Text>{item.title}</Text>
                </TouchableOpacity>
            );
        });

        return items;
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
