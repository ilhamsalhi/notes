require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note.js')

const app = express()

app.use((req,res,next) =>{
  console.log(req.method,req.hostname, req.path);
  next();
});

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())


app.get('/api/notes', (req, res) => {
    Note.find({})
    .then((notes) => {
      res.json(notes)
    })
})

app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id

  Note.findById(id)
  .then((note) => {
    if (note)
      res.json(note)
    else
      res.status(404).end()
  })
  .catch((error) => next(error))
})


app.post('/api/notes', (req, res, next) => {
  const body = req.body


  const note = new Note({
      content: body.content,
      important: body.important || false,
  })

  note.save()
  .then((savedNote) => {
    console.log('saved note ', savedNote)
    res.json(savedNote)
  })
  .catch((error) => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {

  Note.findById(req.params.id)
  .then((note) => {
    if (!note)
      return next();
    Note.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json(note)
    })
  })
  .catch(error => {
    console.log('error ', error)
    next(error)
  })
})

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, {
    new: true,
    runValidators: true,
    context: 'query'
  })
  .then((updatedNote) => {
    res.json(updatedNote)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)


const errorHandler = (error, req, res, next) => {
  console.log("error ", error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({error: 'malformatted id'})
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({error: error.message})
  }
  // default express error handler
  next(error)
}
app.use(errorHandler)


// console.log(app._router)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
 

