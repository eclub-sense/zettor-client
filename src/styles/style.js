'use strict';

var React = require('react-native');
var StyleSheet = React.StyleSheet;

module.exports = StyleSheet.create({

    cDarkGrey: {
        color: '#2B2D42',
    },
    cGrey: {
        color: '#8D99AE',
    },
    cLightGrey: {
        color: '#EDF2F4',
    },

    bgDarkGrey: {
        backgroundColor: '#2B2D42',
    },
    bgGrey: {
        backgroundColor: '#8D99AE',
    },
    bgLightGrey: {
        backgroundColor: '#EDF2F4',
    },

    rowsContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingTop: 20,
    },
    rowsSeparator: {
        height: 1,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        padding: 10,
    },
    rowTitle: {
        flex: 1,
        fontSize: 30,
    },

});
