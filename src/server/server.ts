import express from 'express';
import { Vessel, PortCall, PortCallHistory } from './models';
import { importVesselsIntoLocalDatabase, safeImportAllSchedules } from './import-service';
import { PORT } from './conf';
var path = require('path');

const app = express()

const staticPath = path.resolve(__dirname, '..', '..', 'dist', 'front-end', 'public')
console.log('Serving static files at ',staticPath)
app.use(express.static(staticPath, {cacheControl: false}));

app.post('/api/import', async (req, res) => {
  safeImportAllSchedules()
    .then(() => {
      res.send({status:'ok'})
    })
    .catch(err => {
      console.error(err)
      res.status(500).send({status:'ko', message: err.message})
    })
})

app.get('/api/vessels', async (req, res) => {
  const vessels = await Vessel.findAll()
  res.send(vessels || [])
})

app.get('/api/vessel-schedule/:vesselImo', async (req, res) => {
  const { vesselImo } = req.params

  const vesselSchedule = await PortCall.findAll({
    where: {
      vessel_imo: vesselImo
    },
    include: [{
        model: Vessel,
    }],
  })
  res.send(vesselSchedule || [])
})

app.get('/api/port-call-history/:portCallId', async (req, res) => {
  const { portCallId } = req.params

  if (!portCallId) throw Error('Provide portCallId')

  const history = await PortCallHistory.findAll({
    where: {
      port_call_id: portCallId
    },
    include: [{
        model: Vessel,
    }],
  })
  res.send(history || [])
})

app.use(function(req, res){
  res.sendfile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Example app listening on port ${PORT}!`)
  await importVesselsIntoLocalDatabase()
})