
const HOST = '192.168.15.11'
const axios = require('axios')
const express = require('express')
const app = express()

app.use(express.json())

const baseConsulta = {}

const atualizarComentario = (comentario) => {
  const comentarios = baseConsulta[comentario.serieId]['comentarios']
  const indice = comentarios.findIndex(c => c.id === comentario.id)
  comentarios[indice] = comentario
}

const funcoes = {
  SerieCriada: (serie) => {
    baseConsulta[serie.id] = {
      id: serie.id,
      titulo: serie.titulo,
      plataforma: serie.plataforma,
      comentarios: []
    }
  },
  ComentarioCriado: (comentario) => {
    const comentarios = baseConsulta[comentario.serieId]['comentarios'] || []
    comentarios.push(comentario)
    baseConsulta[comentario.serieId]['comentarios'] = comentarios
  },
  ComentarioAtualizado: atualizarComentario,
  ComentarioEditado: atualizarComentario
}

app.get('/series', (req, res) => {
  res.json(baseConsulta)
})

app.get('/series/:id', (req, res) => {
  const serie = baseConsulta[req.params.id]

  if (serie === undefined) {
    return res.status(404).send({
      erro: "série não encontrada"
    })
  }

  res.json(serie)
})

app.post('/eventos', function(req, res) {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  res.end()
})

const port = 4200
app.listen(port, async () => {
  console.log(`Consulta. Porta ${port}.`)

  try{
    const resp = await axios.get(`http://${HOST}:10000/eventos`)

    resp.data.forEach((evento) => {
      try{
        funcoes[evento.tipo](evento.dados)
      }
      catch(e){}
    })
  }
  catch(e){
    console.log('Barramento indisponível')
  }
})
