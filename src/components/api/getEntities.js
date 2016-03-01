"use strict";

var config = require('../../../config.json');
var serverUrl = config.serverUrl;

module.exports = function () {
    return fetch(serverUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var entities = json.entities;
            var selfLinks = getEntitiesSelfLinks(entities);

            return fetchEntities(selfLinks);
        })
        .catch((error) => {
            console.warn(error); // TODO show error
        });

    function fetchEntities(selfLinks) {
        var allEntities = selfLinks.map(fetchEntity);

        return Promise.all(allEntities).then(function (entities) {
            var result = {actuators: [], sensors: []};

            entities.forEach(function (value) {
                if (value.actions === null) {
                    result.sensors.push(value);
                } else {
                    result.actuators.push(value);
                }
            });

            return result;
        });
    }

    function getEntitiesSelfLinks(entities) {
        var entitiesSelfLinks = [];
        for (var i = 0, l = entities.length; i < l; i++) {
            entitiesSelfLinks.push(getEntitySelfLink(entities[i]));
        }

        return entitiesSelfLinks;
    }

    function getEntitySelfLink(entity) {
        var links = entity.links;
        for (var i = 0, l = links.length; i < l; i++) {
            if (links[i].rel.indexOf('self') > -1) {
                return links[i].href;
            }
        }

        return null;
    }

    function fetchEntity(selfLink) {
        return fetch(selfLink)
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                return json;
            })
            .catch((error) => {
                console.warn(error); // TODO show error
            });
    }
};
