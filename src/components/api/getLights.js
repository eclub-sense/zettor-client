"use strict";

var config = require('../../../config.json');
var serverUrl = config.serverUrl;

module.exports = function () {
    return fetch(serverUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var lights = [];
            var entities = json.entities;
            for (var i = 0, l = entities.length; i < l; i++) {
                var entity = entities[i];
                var name = entity.properties.name;
                if (name.startsWith('ESP') && !name.endsWith('helper')) { // TODO change
                    lights[entity.properties.id] = entity.properties.state !== 'OFF';
                }
            }

            return lights;
        })
        .catch((error) => {
            console.warn(error); // TODO show error
        });
};
