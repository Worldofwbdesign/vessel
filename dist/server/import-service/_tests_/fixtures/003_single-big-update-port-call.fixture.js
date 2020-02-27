"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Test scenario
 * Update a single port call surrounded by 2 matching port calls.
 * The update make the updated overlaps with its stored version
 */
const data_types_1 = require("../../data-types");
const moment = require("moment");
const storedVesselSchedule = {
    vessel: {
        imo: 1,
        name: 'Dummy vessel'
    },
    portCalls: [{
            id: '1',
            departure: moment('2019-03-01T01:00:00Z'),
            arrival: moment('2019-03-02T02:00:00Z'),
            port: {
                unLocode: 'FAKE1',
                name: 'Fake port 1',
            },
            isDeleted: false
        }, {
            id: '2',
            departure: moment('2019-03-03T01:00:00Z'),
            arrival: moment('2019-03-03T20:00:00Z'),
            port: {
                unLocode: 'FAKE2',
                name: 'Fake port 2',
            },
            isDeleted: false
        }, {
            id: '3',
            departure: moment('2019-03-17T01:00:00Z'),
            arrival: moment('2019-03-18T02:00:00Z'),
            port: {
                unLocode: 'FAKE3',
                name: 'Fake port 3',
            },
            isDeleted: false
        }]
};
exports.storedVesselSchedule = storedVesselSchedule;
const importedVesselSchedule = {
    cursorValueAtFetchTime: moment('2019-03-01'),
    vessel: storedVesselSchedule.vessel,
    portCalls: [{
            departure: moment('2019-03-01T01:00:00Z'),
            arrival: moment('2019-03-02T02:00:00Z'),
            port: {
                unLocode: 'FAKE1',
                name: 'Fake port 1',
            },
        }, {
            departure: moment('2019-03-07T01:00:00Z'),
            arrival: moment('2019-03-08T02:00:00Z'),
            port: {
                unLocode: 'FAKE2',
                name: 'Fake port 2',
            },
        }, {
            departure: moment('2019-03-17T01:00:00Z'),
            arrival: moment('2019-03-18T02:00:00Z'),
            port: {
                unLocode: 'FAKE3',
                name: 'Fake port 3',
            },
        }],
};
exports.importedVesselSchedule = importedVesselSchedule;
const expectedMergeActions = [{
        action: data_types_1.MergeActionType.UPDATE,
        importedPortCall: importedVesselSchedule.portCalls[1],
        storedPortCall: storedVesselSchedule.portCalls[1]
    }];
exports.expectedMergeActions = expectedMergeActions;
