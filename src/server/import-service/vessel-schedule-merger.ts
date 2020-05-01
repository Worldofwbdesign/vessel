import {
  ImportedVesselSchedule, StoredVesselSchedule, MergeAction, MergeActionType, StoredPortCall, ImportedPortCall,
} from './data-types';
import moment = require('moment');

import { loadAllFixtures } from './_tests_/fixtures';
import * as referenceImplementation from './reference-implementation'

const MAX_DELAY_HOURS = 24 * 3

const compareCalls = (importedCall: any, storedCall: any): Boolean => {
  const fieldsToCompare = ['portId', 'portName', 'arrival', 'departure']

  return fieldsToCompare.every(f => JSON.stringify(importedCall[f]) === JSON.stringify(storedCall[f]))
}

const softCompareCalls = (importedCall: any, storedCall: any): Boolean => {
  if (importedCall.portId !== storedCall.portId) return false

  const arrivalDiff = storedCall.arrival.diff(importedCall.departure)
  const arrivalDiffHours = moment.duration(arrivalDiff).hours()
  return Math.abs(arrivalDiffHours) < MAX_DELAY_HOURS
  // return fieldsToCompare.every(f => JSON.stringify(importedCall[f]) === JSON.stringify(storedCall[f]))
}

const fixtures = loadAllFixtures()
/**
 * Outputs a list of actions based on 2 inputs: (1) a new vessel schedule and (2) an existing vessel schedule.
 * The possible actions are described in the enum 'MergeActionType'. These are:
 *   - INSERT: inserts a new port call in the database
 *   - UPDATE: updates an existing port call in the database
 *   - DELETE: removes a port call from the database
 */
export const mergeVesselSchedules = async (importedVesselSchedule: ImportedVesselSchedule, storedVesselSchedule: StoredVesselSchedule): Promise<MergeAction[]> => {
  // TODO: reimplement this function to merge vessel schedules
  if(referenceImplementation.isConfigured) {
    // This is calling Portchain's reference implementation of the merging algorithm.
    // It is only for Portchain's internal use and not available to candidates.
    return await referenceImplementation.mergeVesselSchedules(importedVesselSchedule, storedVesselSchedule)
  } else {
    // console.info('importedVesselSchedule', importedVesselSchedule)
    // console.info('storedVesselSchedule', storedVesselSchedule)
    // *********************************************************************** //
    //                                                                         //
    // This is a DUMMY implementation that returns results from the test       //
    // fixtures.                                                               //
    //                                                                         //
    // The final implementation must absolutely not use the fixture data but   //
    // still pass the tests and be able to work with the import API.           //
    //                                                                         //
    // *********************************************************************** //
    if (importedVesselSchedule.vessel.imo !== storedVesselSchedule.vessel.imo) return []

    const mergeActions: MergeAction[] = []
    const storedPortCalls: StoredPortCall[] = storedVesselSchedule.portCalls
    const importedPortCalls: ImportedPortCall[] = importedVesselSchedule.portCalls

    // Insert all importedPortCalls if storedPortCalls are empty
    if (!storedPortCalls.length && importedPortCalls.length) {
      return importedVesselSchedule.portCalls.map(importedPortCall => ({
        action: MergeActionType.INSERT,
        importedPortCall,
        storedPortCall: null
      }))
    }

    // find first match index in stored calls
    let storedIndex: number = storedPortCalls.findIndex(pCall => {
      return softCompareCalls(importedPortCalls[0], pCall)
    })
      
      // delete all stored call indexes less then first match index
    for (let index = 1; index < storedIndex; index++) {
      mergeActions.push({
          action: MergeActionType.DELETE,
        importedPortCall: null,
        storedPortCall: storedPortCalls[index],
      })
    }

    // Update first matched call if it doesn't fully match
    if (!compareCalls(importedPortCalls[0], storedPortCalls[storedIndex])) {
      mergeActions.push({
        action: MergeActionType.UPDATE,
        importedPortCall: importedPortCalls[0],
        storedPortCall: storedPortCalls[storedIndex],
      })
    }
    storedIndex++

    let importedIndex: number = 1
    while (importedIndex < importedPortCalls.length) {
      // check full and soft matching
      let match = compareCalls(importedPortCalls[importedIndex], storedPortCalls[storedIndex])
      if (!match) {
        match = softCompareCalls(importedPortCalls[importedIndex], storedPortCalls[storedIndex])
        if (match) {
          mergeActions.push({
            action: MergeActionType.UPDATE,
            importedPortCall: importedPortCalls[importedIndex],
            storedPortCall: storedPortCalls[storedIndex],
          })
        }
      }

      if (match) {
        importedIndex++
        storedIndex++
      } else {
        mergeActions.push({
          action: MergeActionType.DELETE,
          importedPortCall: null,
          storedPortCall: storedPortCalls[storedIndex],
        })
        storedIndex++
      }
    }

    // Delete all portCalls left in storedPortCalls
    while (storedIndex < storedPortCalls.length) {
      mergeActions.push({
        action: MergeActionType.DELETE,
        importedPortCall: null,
        storedPortCall: storedPortCalls[storedIndex],
      })
      storedIndex++
    }

    // Insert all portCalls left in importedPortCalls
    while (importedIndex < importedPortCalls.length) {
      mergeActions.push({
        action: MergeActionType.INSERT,
        importedPortCall: importedPortCalls[importedIndex],
        storedPortCall: null,
      })
      importedIndex++
    }

    return mergeActions
  }
};
