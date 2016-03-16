'use strict';

var config = require('../../../config.json');
var iosClientId = config.iosClientId;

var React = require('react-native');

var {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    } = React;

import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

class RNGoogleSiginExample extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
        GoogleSignin.configure({
            iosClientId: iosClientId,
            offlineAccess: false
        });

        GoogleSignin.currentUserAsync().then((user) => {
            console.log('USER', user);
            this.setState({user: user});
        }).done();
    }

    render() {

        if (!this.state.user) {
            return (
                <View style={styles.container}>
                    <GoogleSigninButton style={{width: 212, height: 48}} size={GoogleSigninButton.Size.Standard}
                                        color={GoogleSigninButton.Color.Light} onPress={this._signIn.bind(this)}/>
                </View>
            );
        }

        if (this.state.user) {
            return (
                <View style={styles.container}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Welcome {this.state.user.name}
                    </Text>
                    <Text>Your email is: {this.state.user.email}</Text>
                    <Text>Your token expires in: {this.state.user.accessTokenExpirationDate.toFixed()}s</Text>

                    <TouchableOpacity onPress={() => {this._signOut(); }}>
                        <View style={{marginTop: 50}}>
                            <Text>Log out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    _signIn() {
        GoogleSignin.signIn()
            .then((user) => {
                console.log(user);
                this.setState({user: user});
            })
            .catch((err) => {
                console.log('WRONG SIGNIN', err);
            })
            .done();
    }

    _signOut() {
        GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
                this.setState({user: null});
            })
            .done();
    }
}
;

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    }
});

module.exports = RNGoogleSiginExample;