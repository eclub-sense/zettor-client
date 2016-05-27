'use strict';

import {Platform} from 'react-native';
import styles from './styles.js';

const {itemMargin} = require('./env');

if (Platform.OS === 'android') {
    var ExtraDimensions = require('react-native-extra-dimensions-android');
}

const getItemStyle = function () {
    let style = [styles.itemBase];
    if (Platform.OS === 'android') {
        const itemSize = ExtraDimensions.get('REAL_WINDOW_HEIGHT')
            - ExtraDimensions.get('STATUS_BAR_HEIGHT')
            - 2 * itemMargin;
        style.push({
            backgroundColor: '#ECF0F1',
            justifyContent: 'space-around',
            height: itemSize,
            width: itemSize,
            borderRadius: 5,
        });
    }

    return style;
};

export default getItemStyle();
