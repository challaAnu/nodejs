const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'covid19India.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
app.get('/states/', async (request, response) => {
  const getall = `select state_name from state`
  const responsequery = await db.all(getall)
  response.send(
    responsequery.map(eachMovie => ({
      stateId: eachMovie.state_id,
      stateName: eachMovie.state_name,
      population: eachMovie.population,
    })),
  )
})
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getquery = `select state_id as stateId,state_name as stateName,population from state where state_id=${stateId}`
  const responsequery = await db.get(getquery)
  response.send(responsequery)
})
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postquery = `insert into district (district_name,state_id,cases,cured,active,deaths) values('${districtName}',${stateId},${cases},${cured},${active},${deaths})`
  const postresponse = await db.run(postquery)
  response.send('District Successfully Added')
})
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getquery = `select * from district where district_id=${districtId}`
  const responseget = await db.get(getquery)
  response.send(
    responseget.map(eachdistrict => ({
      districtId: eachdistrict.district_id,
      districtName: eachdistrict_name,
      stateId: eachdistrict.state_id,
      cases: eachdistrict.cases,
      cured: eachdistrict.cured,
      active: eachdistrict.active,
      deaths: eachdistrict.active,
    })),
  )
})
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deletequery = `delete from district where district_id=${districtId}`
  await db.run(deletequery)
  response.send('District Removed')
})
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updatequery = `update district set district_name='${districtName}',state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths} where district_id=${districtId}`
  await db.run(updatequery)
  response.send('District Details Updated')
})
app.get('/states/:stateId/stats/', async (request, response) => {
  const stateId = request.params
  const sqlquery = `select sum(cases),sum(cured),sum(active),sum(deaths) from district where state_id=${stateId}`
  const responsetotal = await db.get(sqlquery)
  response.send(responsetotal)
})
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    ` //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery)
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    ` //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await db.get(getStateNameQuery)
  response.send(getStateNameQueryResponse)
}) //sending the required response
module.exports = express
