'use strict';

module.exports = function (connectedHubUrl) {
    return fetch(connectedHubUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var entities = json.entities;
            var selfLinks = getEntitiesSelfLinks(entities);

            return new Promise(function (resolve, reject) {
                fetchEntities(selfLinks)
                    .then(function (data) {
                        resolve(data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        })
        .catch(() => {
            return null;
        });

    function fetchEntities(selfLinks) {
        var allEntities = selfLinks.map(fetchEntity);

        return Promise.all(allEntities).then(function (entities) {
            var result = {actuators: [], sensors: []};

            entities.forEach(function (value) {
                if (
                    value.actions !== null &&
                    value.actions.some(action => (action.name === 'turn-on' || action.name === 'turn-off'))
                ) {
                    result.actuators.push(value);
                } else {
                    result.sensors.push(value);
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
                console.warn('fetchEntity', error);
            });
    }
};
