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
            passwordConfirmation: '',
            errorMessage: ''
        };
    },
    render: function () {
        return (
            <View style={[s.authenticationContainer, s.bgLightGrey]}>
                {this.errorMessage()}
                <Text style={s.authenticationLabel}>Email:</Text>
                <TextInput
                    value={this.state.email}
                    onChangeText={(text) => this.setState({email: text})}
                    style={s.authenticationInput}/>

                <Text style={s.authenticationLabel}>Password:</Text>
                <TextInput
                    secureTextEntry={true}
                    value={this.state.password}
                    onChangeText={(text) => this.setState({password: text})}
                    style={s.authenticationInput}/>

                <Text style={s.authenticationLabel}>Confirm Password:</Text>
                <TextInput
                    secureTextEntry={true}
                    value={this.state.passwordConfirmation}
                    onChangeText={(text) => this.setState({passwordConfirmation: text})}
                    style={s.authenticationInput}/>

                <Button text={'Sign Up'} onPress={this.onSignUpPress}/>
                <Button text={'I have an account'} onPress={this.onSignInPress}/>
            </View>
        );
    },
    onSignUpPress: function () {
        if (this.state.password !== this.state.passwordConfirmation) {
            return this.setState({errorMessage: 'Your passwords do not match'});
        }
        //var firebase = new Firebase("https://zettor.firebaseio.com");
        //firebase.createUser({
        //    email: this.state.email,
        //    password: this.state.password
        //}, function (error, userData) {
        //    if (error) {
        //        this.setState({errorMessage: 'Error creating user: ' + error});
        //    } else {
        //        this.props.navigator.immediatelyResetRouteStack([{name: 'menu'}]);
        //        // console.log("Successfully created user account with uid:", userData.uid);
        //        // TODO store token
        //    }
        //}.bind(this));
    },
    onSignInPress: function () {
        this.props.navigator.pop();
    },
    errorMessage: function () {
        if (this.state.errorMessage) {
            return (
                <Text>{this.state.errorMessage}</Text>
            );
        }
    },
});
