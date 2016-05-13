package com.zettor;

import android.content.Intent;
import android.content.res.Configuration;
import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import co.apptailor.googlesignin.RNGoogleSigninModule;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.devstepbcn.wifi.AndroidWifiPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.ocetnik.timer.BackgroundTimerPackage;

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {

    private ReactNativePushNotificationPackage mReactNativePushNotificationPackage;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Zettor";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        mReactNativePushNotificationPackage = new ReactNativePushNotificationPackage(this);
        return Arrays.<ReactPackage>asList(
            new AndroidWifiPackage(),
            new BackgroundTimerPackage(),
            new ExtraDimensionsPackage(this),
            new MainReactPackage(),
            new OrientationPackage(this),
            new RNGoogleSigninPackage(this),
            new VectorIconsPackage(),
            mReactNativePushNotificationPackage
        );
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
         if (requestCode == RNGoogleSigninModule.RC_SIGN_IN) {
            RNGoogleSigninModule.onActivityResult(data);
         }
         super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
         super.onConfigurationChanged(newConfig);
         Intent intent = new Intent("onConfigurationChanged");
         intent.putExtra("newConfig", newConfig);
         this.sendBroadcast(intent);
    }

    @Override
    protected void onNewIntent (Intent intent) {
        super.onNewIntent(intent);

        mReactNativePushNotificationPackage.newIntent(intent);
    }
}
