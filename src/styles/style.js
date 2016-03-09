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
    cRed: {
        color: '#D90429',
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
    bgRed: {
        backgroundColor: '#D90429',
    },

    bcDarkGrey: {
        borderColor: '#2B2D42',
    },
    bcGrey: {
        borderColor: '#8D99AE',
    },
    bcLightGrey: {
        borderColor: '#EDF2F4',
    },
    bcRed: {
        borderColor: '#D90429',
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
    rowData: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        padding: 10,
    },
    rowTitle: {
        flex: 1,
        fontSize: 30,
    },

    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        padding: 5,
        marginTop: 10
    },
    buttonText: {
        flex: 1,
        alignSelf: 'center',
        fontSize: 20
    },

    authenticationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    authenticationInput: {
        padding: 4,
        height: 40,
        borderWidth: 1,
        margin: 5,
        width: 200,
        alignSelf: 'center'
    },
    authenticationLabel: {
        fontSize: 18
    },

    notification: {
        alignItems: 'center',
        padding: 5,
    },
    notificationText: {
        fontSize: 15,
    }
});
