import fetch from 'node-fetch'
import {PORTCHAIN_VESSEL_SCHEDULES_API_URL} from '../conf'
import { Vessel, PortCall } from '../models'
import { Moment } from 'moment'
import moment = require('moment')

const EXPECTED_CURSOR_FORMAT_IN_API = 'YYYY-MM-DD'

interface VesselFromAPI {
  imo:number;
  name: string;
}

interface PortCallFromAPI {
  arrival: Moment;
  departure: Moment;
  port: {
    id: string;
    name: string;
  };
}

export const fetchAvailableVessels = async ():Promise<Vessel[]> => {
  try {
    const response:any = await fetch(PORTCHAIN_VESSEL_SCHEDULES_API_URL + '/vessels', {
        method: 'get',
        headers: { 'Accept': 'application/json' }
    })
    let vessels:VesselFromAPI[] = await response.json()
    return vessels.map(v => {
      return new Vessel(v)
    })
  } catch(e) {
    if(e.responseBody) {
      console.error((await e.responseBody).toString())
    }
    throw e
  }
}

const fetchVesselScheduleSnapshot = async (vessel:Vessel, cursor:Moment):Promise<any[]> => {
  try {
    const response:any = await fetch(`${PORTCHAIN_VESSEL_SCHEDULES_API_URL}/vessel-schedules/${vessel.imo}?cursor=${cursor.format(EXPECTED_CURSOR_FORMAT_IN_API)}`, {
      method: 'get',
      headers: { 'Accept': 'application/json' }
    })
    let portCallsFromAPI:any[] = await response.json()
    return portCallsFromAPI.map(portCallFromAPI => {
      return {
        arrival: moment(portCallFromAPI.arrival),
        departure: moment(portCallFromAPI.departure),
        portId: portCallFromAPI.port.id,
        portName: portCallFromAPI.port.name,
        vessel
      }
    })
  } catch(e) {
    if(e.responseBody) {
      console.error((await e.responseBody).toString())
    }
    throw e
  }
}

const executeForAllPossibleCursorValues = async(exec:(cursor:Moment) => Promise<void>) => {
  const cursorLowerBound = moment('2019-01-01').startOf('day')
  const cursorUpperBound = moment('2019-05-31').startOf('day')
  let cursor = moment(cursorLowerBound)
  while (cursor.isSameOrBefore(cursorUpperBound)) {
    await exec(cursor)
    cursor = moment(cursor).add(1, 'day')
  }
}

/**
 * Calls the import API for each possible cursor value and sequentially pass each result to the `execFuncOnNewSchedule` argument
 */
export const fetchFullVesselSchedule = async (vessel:Vessel, execFuncOnNewSchedule:(cursor:Moment, vesselSchedule:PortCall[]) => Promise<void>) => {
  console.info(`Fetching all historical schedules for vessel ${vessel.name} (${vessel.imo})`)
  await executeForAllPossibleCursorValues(async (cursor:Moment) => {
    const vesselSchedule = await fetchVesselScheduleSnapshot(vessel, cursor)
    await execFuncOnNewSchedule(moment(cursor), vesselSchedule)
  })
}