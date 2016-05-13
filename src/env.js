'use strict';

import {Platform} from 'react-native';

module.exports = {
    itemMargin: Platform.OS === 'android' ? 20 : 50,
    mainItems: ['actuators', 'sensors', 'hubs', 'hubDetected', 'login', 'logout'],
    networksCheckDelay: 5000,
};
