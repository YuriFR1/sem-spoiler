
const axios = require('axios')
const express = require('express')
const app = express()

//middleware
app.use(express.json())

let id = 1
const series = {}

//Criar uma série
//POST /series
app.post('/series', (req, res) => {
  const titulo = req.body.titulo
  const plataforma = req.body.plataforma

  if (titulo === undefined || titulo === '' ||
      plataforma === undefined || plataforma === '') {
    return res.status(400).send({
      erro: "titulo e plataforma são obrigatórios"
    })
  }

  const serie = {
    id: id,
    titulo: titulo,
    plataforma: plataforma
  }

  series[id] = serie
  id++

  res.status(201).send(serie)
})


app.get('/series', function(req, res){
  res.json(series)
})

const port = 4000
app.listen(port, () => console.log(`Séries. Porta ${port}.`))
