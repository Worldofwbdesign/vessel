import {
  ImportedVesselSchedule, StoredVesselSchedule, MergeAction, MergeActionType, StoredPortCall, ImportedPortCall,
} from './data-types';
// import fs from 'fs'
// const PATH = process.cwd() + '/tmp'

import { loadAllFixtures } from './_tests_/fixtures';
import * as referenceImplementation from './reference-implementation'

const compareCalls = (importedCall: any, storedCall: any): Boolean => {
  const fieldsToCompare = ['portId', 'portName', 'arrival', 'departure']

  return fieldsToCompare.every(f => JSON.stringify(importedCall[f]) === JSON.stringify(storedCall[f]))
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

    if (!storedPortCalls.length && importedPortCalls.length) {
      return importedVesselSchedule.portCalls.map(importedPortCall => ({
        action: MergeActionType.INSERT,
        importedPortCall,
        storedPortCall: null
      }))
    }

    if (storedPortCalls.length === 1 && importedPortCalls.length === 1) {
      return [{
        action: MergeActionType.UPDATE,
        importedPortCall: importedPortCalls[0],
        storedPortCall: storedPortCalls[0],
      }]
    }

    if (storedPortCalls.length === importedPortCalls.length) {
      const matches: Boolean[] = []

      importedPortCalls.forEach((importedPortCall, index) => {
        const match = compareCalls(importedPortCall, storedPortCalls[index])
        matches[index] = match

        if (match && !matches[index - 1] && matches[index - 2]) {
          mergeActions.push({
            action: MergeActionType.UPDATE,
            importedPortCall: importedPortCalls[index - 1],
            storedPortCall: storedPortCalls[index - 1],
          })
        }
      })

      return mergeActions
    }

    return mergeActions
  }
};
