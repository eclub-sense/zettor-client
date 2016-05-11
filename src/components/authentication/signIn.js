'use strict';

var React = require('react-native');
var {
    Text,
    TextInput,
    View,
    } = React;

var Button = require('../button');
//var Firebase = require('firebase');
var s = require('../../styles/style');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            email: '',
            password: '',
            errorMessage: ''
        };
    },
    render: function () {
        return (
            <View style={[s.authenticationContainer, s.bgLightGrey]}>
                {this.errorMessage()}
                <Text style={s.authenticationLabel}>Email:</Text>
                <TextInput
                    style={[s.authenticationInput, s.bcGrey]}
                    value={this.state.email}
                    onChangeText={(text) => this.setState({email: text})}
                />

                <Text style={s.authenticationLabel}>Password:</Text>
                <TextInput
                    secureTextEntry={true}
                    style={[s.authenticationInput, s.bcGrey]}
                    value={this.state.password}
                    onChangeText={(text) => this.setState({password: text})}
                />

                <Button text={'Sign In'} onPress={this.onSignInPress}/>
                <Button text={'I need an account'} onPress={this.onSignUpPress}/>
            </View>
        );
    },
    onSignInPress: function () {
        //var firebase = new Firebase("https://zettor.firebaseio.com/");
        //firebase.authWithPassword({
        //    "email": this.state.email,
        //    "password": this.state.password
        //}, function (error, authData) {
        //    if (error) {
        //        this.setState({errorMessage: 'Login Failed! ' + error});
        //    } else {
        //        this.props.navigator.immediatelyResetRouteStack([{name: 'menu'}]);
        //        //console.log("Authenticated successfully with payload:", authData);
        //        // TODO store token
        //    }
        //}.bind(this));
    },
    onSignUpPress: function () {
        this.props.navigator.push({name: 'signUp'});
    },
    errorMessage: function () {
        if (this.state.errorMessage) {
            return (
                <Text>{this.state.errorMessage}</Text>
            );
        }
    },
});
