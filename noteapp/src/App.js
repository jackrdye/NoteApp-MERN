import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import {Button, Col, Container, Form, FormControl, Image, InputGroup, ListGroup, ListGroupItem, Row} from 'react-bootstrap'

function App() {
  const [name, setName] = useState()
  const [icon, setIcon] = useState()
  const [notes, setNotes] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)


  useEffect(() => {
    console.log(name, icon, notes)
  }, [name, icon, notes])

  const SignIn = async (username, password) => {
    fetch('http://localhost:3001/signin', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"username": username, "password": password}),
      credentials: "include"
    })
    .then((response) => response.json())
    .then((data) => { // name, icon, notes
      console.log(data)
      if (data.status == "Login Success") {
        setName(data.name)
        setIcon(data.icon)
        setNotes(data.notes)
        setLoggedIn(true)
      } else {
        alert("Login Failed, please enter valid credentials")
      }
      
    })
    .catch(err => console.log(err))
  }

  const logout = async () => {
    fetch('http://localhost:3001/logout')
    .then(() => {
      setLoggedIn(false)
    })
    .catch(err => console.log(err))
  }
  
  if (loggedIn == false) {
    return <SignInPage signInFunction={SignIn}/>
  }

  return (
    <Routes>
      {/* <Route path="/signin" element={<>Sign in</>}/> */}
      <Route path="*" element={<MainPage name={name} icon={icon} notes={notes} setNotes={setNotes} logoutFunction={logout}/>}/>
    </Routes>

  );
}

export default App;


const MainPage = (props) => {
  const notes = props.notes // Stores {"_id", "lastsavedtime, title"} of each note
  const setNotes = props.setNotes
  const logoutFunction = props.logoutFunction
  const [activeNoteId, setActiveNote] = useState("")
  
  const [searchString, setSearchString] = useState("")
  const [searchNotes, setSearchNotes] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    
  }, [searchString])

  useEffect(() => {
    console.log(activeNoteId)
  }, [activeNoteId])

  const handleNoteClick = (e, noteId) => {
    e.preventDefault();
    setActiveNote(noteId)
    navigate(`/note/${noteId}`, {state: {noteId: noteId}})
  }

  const updateSearchNotes = async (e) => {
    e.preventDefault();
    setSearchString(e.target.value)
    fetch(`http://localhost:3001/searchnotes?searchstr=${e.target.value}`, {
      method: "GET",
      headers: {},
      credentials: "include"
    })
    .then((response) => response.json())
    .then((data) => {
      setSearchNotes(data.notes)
    })
    .catch(err => console.log(err))
  }

  return (
    <div className="d-flex flex-column" style={{height: "100vh", maxHeight: "100vh"}}>
      <CustomNavbar name={props.name} icon={props.icon} logoutFunction={logoutFunction}/>

      <Row className="flex-grow-1 m-0 p-0 border-top border-2" >
        {/* Side Panel */}
        <Col xs={3} sm={3} lg={3} xl={3} xxl={2} className="bg-primar border-end">
          {/* Search Bar */}
          <InputGroup className="w-100 p-2 m-auto">
            <InputGroup.Text id="basic-addon1" 
              className='bg-white border-left-0 bi bi-search mr-0 pr-0'
              style={{borderRight: 0}}>
            </InputGroup.Text>
            <FormControl
              className='text-dark ml-0 pl-0 shadow-none'
              placeholder="Search for Note"
              value={searchString}
              onChange={(e) => {updateSearchNotes(e)}}
              aria-label="Search for Note"
              aria-describedby="basic-addon2"
              style={{borderLeft: 0}}
            />
          </InputGroup>
          {/* List of Notes - All or filtered by search*/}
          <ListGroup>
            {searchString === "" ?
              // Display notes loaded on sign in
              notes.map((note) => {
                return (
                  <ListGroupItem key={note._id} active={(activeNoteId === note._id) ? true : false} onClick={(e) => handleNoteClick(e, note._id)}>{note.title}</ListGroupItem>
                )
              })  
              :
              // Display notes if user is searching
              searchNotes.map((note) => {
                return (
                  <ListGroupItem key={note._id} active={(activeNoteId === note._id) ? true : false} onClick={(e) => handleNoteClick(e, note._id)}>{note.title}</ListGroupItem>
                )
              })
            }
          </ListGroup>
        </Col>

        {/* Main Display */}
        <Col className='bg-secondar'>
          <Container className='position-relative bg-secondary h-100'>
            <Routes>
              <Route index element={<OpeningDisplay/>}/>
              <Route path="/createnote" element={<CreateNoteDisplay setNotes={setNotes} setActiveNote={setActiveNote}/>}/>
              <Route path="/note/:id" element={<ViewNoteDisplay noteId={activeNoteId} setNotes={setNotes}/>}/>
              <Route path="/note/:id/edit" element={<EditNoteDisplay noteId={""} title={""} content={""}/>}/>
            </Routes>
          </Container>
        </Col>
      </Row>
      

    </div>
  )
}


const SignInPage = (props) => {
  const signInFunction = props.signInFunction
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e) => {
    e.preventDefault();
    signInFunction(username, password)
  }

  return (
    <Container className='p-5 my-5 bg-'>
      <Form onSubmit={onSubmit}>
        <h2>Please Sign In</h2>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control type='text' value={username} onChange={(e) => setUsername(e.target.value)}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' vaue={password} onChange={(e) => setPassword(e.target.value)}/>
        </Form.Group>
        <Button type="submit" className='mt-3' >Sign in</Button>
      </Form>
    </Container>
  )
}




const OpeningDisplay = () => {
  return (
    <Link to='/createnote'>
      <Button className='position-absolute bottom-0 end-0 mb-4 me-5'> 
        Create Note
      </Button>
    </Link>
  )
}

const ViewNoteDisplay = (props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const setNotes = props.setNotes
  const noteId = location.state.noteId
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [lastSavedTime, setLastSavedTime] = useState("")

  

  useEffect(() => {
    getNoteDetails(noteId)
  }, [noteId])

  const getNoteDetails = async (noteId) => {
    fetch(`http://localhost:3001/getnote?noteid=${noteId}`, {
      method: "GET",
      headers: {},
      credentials: "include"
    })
    .then((response) => response.json())
    .then(data => {
      setTitle(data.title)
      setContent(data.content)
      setLastSavedTime(data.lastsavedtime)
    })
    .catch(err => console.log(err))
  }

  const navigateToEdit = (e) => {
    e.preventDefault();
    navigate(`/note/${noteId}/edit`, {state: {noteId: noteId , title: title, content: content}})
  }

  const deleteNote = async (e) => {
    e.preventDefault();
    fetch(`http://localhost:3001/deletenote/${noteId}`, {
      method: "DELETE",
    })
    .then(() => {
      setNotes(prevNotes => prevNotes.filter((note) => note._id != noteId))
      navigate("/")
    })
    .catch(err => console.log(err))
  }


  return (
    <React.Fragment>
      {/* View existing Note */}
      <Container className='pt-5 px-5 h-100 bg-dar'>
        {/* Last edited */}
        <p className='position-absolute top-0 mt-2 bg-ligh'>Last saved: {lastSavedTime}</p>
        {/* Delete Button */}
        <Button variant='light' className='position-absolute top-0 end-0 mt-2 me-3 px-1 py-0' onClick={(e) => deleteNote(e)}>Delete</Button>
        {/* Title */}
        <Form.Control placeholder='Title' className='mb-3'defaultValue={title} onClick={(e) => navigateToEdit(e)}/>
        {/* Content */}
        <Form.Control as='textarea' placeholder='Content' className='h-75' defaultValue={content} onClick={(e) => navigateToEdit(e)}/>
      </Container>
      <Link to='/createnote'>
        <Button className='position-absolute bottom-0 end-0 mb-4 me-5'> 
          Create Note
        </Button>
      </Link>
    </React.Fragment>
  )
}


const EditNoteDisplay = (props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const noteId = location.state.noteId
  const [title, setTitle] = useState(location.state.title)
  const [content, setContent] = useState(location.state.content)


  useEffect(() => {
    // console.log(title, content)
    // console.log(props)
  }, [title, content])

  const saveNote = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3001/savenote/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({title: title, content: content})
    })
    .then(response => response.json())
    .then(data => {
      // navigate(-1)
      console.log(data)
      navigate(`/note/${noteId}`, {state: {noteId: noteId}})
    })
    .catch(err => console.log(err))
  }

  const cancelEdits = (e) => {
    e.preventDefault();
    navigate(-1);
  }

  return (
    <React.Fragment>
      {/* Add/Edit mode */}
      <Form className='pt-5 px-5 h-100'>

      {/* Save/Cancel Buttons */}
      <Container fluid className='d-flex p-0 w-25 mt-2 me-4 position-absolute top-0 end-0'>
        <Button variant="light" className="p-0 w-50 me-2" onClick={(e) => cancelEdits(e)}>
          Cancel
        </Button>
        <Button variant='light' className='p-0 w-50' onClick={(e) => saveNote(e)}>
          Save
        </Button>
      </Container>

      {/* Title */}
      {/* onChange={(e) => setTitle(() => e.target.value)} */}
      <Form.Control placeholder='Title' className='mb-3' value={title} onChange={(e) => setTitle(() => e.target.value)}/>
      {/* Content */}
      {/* onChange={(e) => setContent(() => e.target.value)} */}
      <Form.Control as='textarea' placeholder='Content' className='h-75' value={content} onChange={(e) => setContent(() => e.target.value)}/>

    </Form>
  </React.Fragment>
  )
}

const CreateNoteDisplay = (props) => { // setNotes to append new note to current state
  const navigate = useNavigate()
  const setNotes = props.setNotes
  const setActiveNote = props.setActiveNote
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const createNote = async (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/addnote', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"title": title, "content": content}),
      credentials: "include"
    })
    .then((response) => response.json())
    .then(data => {
      if (data.result == "no userId session") {
        alert("Please log in again")
      } else {
        console.log(data)
        const newNote = {"_id": data._id, "lastsavedtime": data.lastsavedtime, "title": title}
        setNotes(prevNotes => [...prevNotes, newNote])
        setActiveNote(data._id)
        navigate(`/note/${data._id}`, {state: {noteId: data._id}})
      }
    })
    .catch(err => console.log(err))
  }

  return (
    <React.Fragment>
      {/* Add/Edit mode */}
      <Form className='pt-5 px-5 h-100' onSubmit={createNote}>

      {/* Save/Cancel Buttons */}
      <Container fluid className='d-flex p-0 w-25 mt-2 me-4 position-absolute top-0 end-0'>
        <Button variant="light" className="p-0 w-50 me-2">
          Cancel
        </Button>
        <Button type="submit" variant='light' className='p-0 w-50'>
          Save
        </Button>
      </Container>

      {/* Title */}
      <Form.Control placeholder='Title' className='mb-3' value={title} onChange={(e) => setTitle(() => e.target.value)}/>
      {/* Content */}
      <Form.Control as='textarea' placeholder='Content' className='h-75' value={content} onChange={(e) => setContent(() => e.target.value)}/>

    </Form>
  </React.Fragment>
  )
}



const CustomNavbar = (props) => {
  const name = props.name
  const icon = props.icon
  const logoutFunction = props.logoutFunction

  return (
    <Container className='bg-light d-flex align-items-center position-relative' fluid>
      <Image src={`http://localhost:3001/${icon}`} //replace with icons/{username}.jpg
          width='70'
          height='70'
          className="p-0 m-0"
        />
        <h5 className='ps-3 bg-primar mt-2 '>
          {name}
        </h5>
        <h2 className='px-2 bg-primar position-absolute top-50 start-50 translate-middle'>
          iNotes
        </h2>
        <Button variant="light" className='ms-auto px-3 me-4' onClick={logoutFunction}>
          Log out
        </Button>
    </Container>
  )
}