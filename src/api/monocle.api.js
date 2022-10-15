// Monocle API Service


import call from './api'

// List APIs
export const getSummitList = (summit, startDate, callback) => {
    return call('parts', `?summit=${summit}&timestamp=${startDate}&flag=list-sum`, callback)
}
export const getMachineRunList = (machine, startDate, callback) => {
    return call('parts', `?machine=${machine}&timestamp=${startDate}&flag=list`, callback)
}

// Box Plot APIs
export const getMachineData = (machine, partType, startDate, callback) => {
    return call('parts', `?machine=${machine}&parttype=${partType}&timestamp=${startDate}&flag=mach`, callback)
}
export const getOverviewData = (machine, startDate, callback) => {
    return call('parts', `?machine=${machine}&timestamp=${startDate}&flag=list`, callback)
}

// Single Part API
export const getPartData = (tracking, callback) => {
    return call('parts', `?tracking=${tracking}`, callback)
}