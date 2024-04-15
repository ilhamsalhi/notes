import { useState, useEffect } from 'react'
import {getAll, create, update, del, setToken} from './services/notes'
import {login} from './services/login'

const App = (props) => {

  let [notes, setNotes] = useState([])
  let [newNote, setNewNote] = useState("new note...")
  let [showAll, setShowAll] = useState(true)
  let [credentials, setCredentials] = useState({username:"", password:""})
  let [user, setUser] = useState(null)

  let notesToShow = showAll ? notes : notes.filter((note) => note.important);

  const handleChange = (e) => setNewNote(e.target.value);

  useEffect(() => {
    getAll()
    .then((initialNotes) => {
      setNotes(initialNotes)
    })
    .catch(errorMessage => {
      console.log(errorMessage)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      setToken(user.token)
    }
  }, [])

  const addNote = (e) => {
    e.preventDefault();
    let noteObject = {
      content: newNote,   //content: e.target[0].value,
      important: Math.random() < 0.5,
    }

    create(noteObject)
    .then((returnedNote) => {
      setNotes(notes.concat(returnedNote));
      setNewNote('');
    })
    .catch(errorMessage => {
      console.log(errorMessage)
    })
  }

  const deleteNote = (id) => {
    del(id)
    .then((deletedNote) => {
      console.log(deletedNote)
      setNotes(notes.filter(note => note.id !== deletedNote.id))
    })
    .catch(errorMessage => {
      console.log(errorMessage)
    })
  }

  const toggleImportance = (id) => {
    let note = notes.find((note) => note.id === id);

    update(id, {...note, important: !note.important})
    .then((returnedNote) => {
      setNotes(notes.map((note) => note.id === id ? returnedNote : note));
    })
    .catch(errorMessage => {
      console.log(errorMessage)
    })
  }

  console.log("notes ", notes.length);

  return (
    <div>
      <h1>Notes</h1>
      {user === null && <LoginForm credentials={credentials} setCredentials={setCredentials} user={user} setUser={setUser}></LoginForm>}
      {user !== null &&  <NoteForm newNote={newNote} addNote={addNote} handleChange={handleChange}></NoteForm>}
      <div>
        <button onClick={() => setShowAll(!showAll)}>show {showAll ? "important" : "all"}</button>
        <ul>
          {notesToShow.map(note => <Note key={note.id} note={note} toggleImportance={toggleImportance} deleteNote={deleteNote}/>)}
        </ul>
      </div>
    </div>
  )
}

const Note = ({ note, toggleImportance, deleteNote }) => {
  let label = note.important ? 'make not important' : 'make important'
  return (
    <div>
      <li>
        {note.content} 
        <button onClick={() => toggleImportance(note.id)}>{label}</button>
        <button onClick={() => deleteNote(note.id)}>delete</button>
      </li>
    </div>
  )
}

const NoteForm = ({newNote, addNote, handleChange}) => {
  return (
    <form onSubmit={addNote}>
          <input type="text" value={newNote} onChange={handleChange}/>
          <button type="submit">save</button>
    </form>
  )
}

const LoginForm = ({credentials, setCredentials, user, setUser}) => {
  const handleUserNameChange = (e) => {
    const newCredentials = {
      username: e.target.value,
      password
    }
    setCredentials(newCredentials)
  }

  const handlePasswordChange = (e) => {
    const newCredentials = {
      username,
      password: e.target.value
    }
    setCredentials(newCredentials)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    login(credentials)
    .then(user => {
      setUser(user)
      setCredentials({username:"", password:""})
      setToken(user.token)
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      console.log(`${username} logged in successfully`)
    })
    .catch(error => console.log(error.message))
  }

  const {username, password} = credentials
  return (
    <div>
      <h1>Login In</h1>
      <form type="submit">
        <div>
          <div>
            username
            <input type="text" value={username} onChange={handleUserNameChange}/>
          </div>
          <div>
            password
            <input type="password" value={password} onChange={handlePasswordChange}/>
          </div>
        </div>
        <button type="submit" onClick={handleLogin}>login</button>
      </form>
    </div>
  )
}

export default App 

/*
  Controlled and uncontrolled Component in react

  UnControlled Component: form data is stored, handled by browser document

  Controlled Component: form data is stored in componnet state => use of value and onChange

  // value of event target is equal to value in input element + new entered char
  // value in input get updated in each render

  dev dependency vs runtime dependency
*/

