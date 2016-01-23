/*
 *     (C) Copyright 2012-2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the technician-service widget.
 *
 *     technician-service is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     technician-service is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with technician-service. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

var technicians = {};
var vans = {};
var technician_by_van = {};

// TODO: settings / platform context
var ngsi_server = 'http://130.206.82.140:1026/';
var ngsi_proxy = 'http://wirecloud-demo.lab.fi-ware.eu:3000/';
var connection = new NGSI.Connection(ngsi_server, {
    ngsi_proxy_url: ngsi_proxy,
    requestFunction: MashupPlatform.http.makeRequest
});


var process_entities = function process_entities(entities) {
    var entity;

    for (var key in entities) {
        entity = entities[key];

        switch (entity.type) {
            case 'Van':
                vans[entity.id] = entity.current_position;
                if (entity.id in technician_by_van) {
                    sendVcard(technician_by_van[entity.id].id, entity.id);
                }
                break;
            case 'Technician':
                technicians[entity.id] = entity;
                technician_by_van[entity.van] = entity;
                if (entity.van in vans) {
                    sendVcard(entity.id, entity.van);
                }
                break;
        }
    }
};

var sendVcard = function sendVcard (techId, vanId) {
    var endLine = "\r\n";
    var tech = technicians[techId];
    var van = vans[vanId];
    if (tech && van) {
        var technician = "BEGIN:VCARD" + endLine +
            "VERSION:3.0" + endLine +
            "FN:" + tech.name + endLine +
            "GEO;TYPE=work:geo:" + vans[tech.van] + endLine +
            "TITLE:" + tech.func + endLine +
            "TEL;TYPE=WORK,VOICE:" + tech.mobile_phone + endLine +
            "ADR;TYPE=WORK:" + tech.working_area + endLine +
            "EMAIL;TYPE=PREF,INTERNET:" + tech.email + endLine +
            "IMPP:twitter:" + tech.twitter + endLine +
            "X-NGSI-ID:" + techId + endLine +
            "END:VCARD";
        MashupPlatform.wiring.pushEvent('outputTechnician', technician);
    }
};

connection.createSubscription([
        {type: 'Van', id: '.*', isPattern: true},
        {type: 'Technician', id: '.*', isPattern: true}
    ],
    null,
    'PT24H',
    null,
    [{type:'ONCHANGE'}],
    {
        flat: true,
        onNotify: process_entities
    }
);
