
const HOST = 'localhost'
const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

const palavrasProibidas = ['morre', 'final', 'assassino', 'traidor']

const moderarComentario = (comentario) => {
  const palavraProibida = palavrasProibidas.find(palavra => comentario.texto.includes(palavra))

  comentario.status = palavraProibida ? 'spoiler' : 'liberado'

  axios.post(`http://${HOST}:10000/eventos`, {
    tipo: 'ComentarioModerado',
    dados: comentario
  })
}

const funcoes = {
  ComentarioCriado: moderarComentario,
  ComentarioEditado: moderarComentario
}

app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    funcoes[evento.tipo](evento.dados)
  }
  catch(e){}
  res.end()
})

const port = 4300
app.listen(port, async () => {
  console.log(`Moderação. Porta ${port}.`)

  try{
const resp = await axios.get(`http://${HOST}:10000/eventos`)

    const ultimosEventos = {}
    const idsComentarios = []

    resp.data.forEach((evento) => {
      if (evento.tipo === 'ComentarioCriado' ||
          evento.tipo === 'ComentarioEditado' ||
          evento.tipo === 'ComentarioModerado') {

        if (ultimosEventos[evento.dados.id] === undefined) {
          idsComentarios.push(evento.dados.id)
        }

        ultimosEventos[evento.dados.id] = evento
      }
    })

    idsComentarios.forEach((id) => {
      const evento = ultimosEventos[id]

      if (evento.tipo === 'ComentarioCriado' ||
          evento.tipo === 'ComentarioEditado') {
        funcoes[evento.tipo](evento.dados)
      }
    })
  }
  catch(e){
    console.log('Barramento indisponível')
  }
})
