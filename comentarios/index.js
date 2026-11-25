
const HOST = 'localhost'
const axios = require('axios')
const express = require('express')
const {v4: uuidv4} = require('uuid')
const app = express()

app.use(express.json())

const comentariosPorSerieId = {}

app.post('/series/:id/comentarios', async (req, res) => {
  const idComentario = uuidv4()
  const { texto } = req.body

  const comentario = {
    id: idComentario,
    texto: texto,
    serieId: req.params.id,
    status: 'pendente'
  }

  const comentariosDaSerie = comentariosPorSerieId[req.params.id] || []
  comentariosDaSerie.push(comentario)
  comentariosPorSerieId[req.params.id] = comentariosDaSerie

await axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioCriado',
    dados: comentario
  })

  res.status(201).send(comentariosDaSerie)
})

app.get('/series/:id/comentarios', function(req, res) {
  res.json(comentariosPorSerieId[req.params.id] || [])
})

app.put('/series/:id/comentarios/:idComentario', async (req, res) => {
  const comentarios = comentariosPorSerieId[req.params.id] || []
  const comentario = comentarios.find(c => c.id === req.params.idComentario)

  if (comentario === undefined) {
    return res.status(404).send({
      erro: "comentário não encontrado"
    })
  }

  const { texto } = req.body
  comentario.texto = texto
  comentario.status = 'pendente'

  await axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioEditado',
    dados: comentario
  })

  res.status(200).send(comentario)
})

const funcoes = {
  ComentarioModerado: (comentario) => {
    const comentarios = comentariosPorSerieId[comentario.serieId]
    const comentarioParaAtualizar = comentarios.find(c => c.id === comentario.id)

    comentarioParaAtualizar.status = comentario.status

    axios.post(`http://${HOST}:10000/eventos`, {
      tipo: 'ComentarioAtualizado',
      dados: {
        id: comentarioParaAtualizar.id,
        texto: comentarioParaAtualizar.texto,
        serieId: comentarioParaAtualizar.serieId,
        status: comentarioParaAtualizar.status
      }
    })
  }
}

app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento.tipo)
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  res.end()
})

const port = 4100
app.listen(port, () => console.log(`Comentários. Porta ${port}.`))
