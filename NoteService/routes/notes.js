var express = require('express');
const { default: monk } = require('monk');
var router = express.Router();


/* 1 POST sign in. */
router.post('/signin', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  const userList = req.db.get("userList")

  // Find user document
  userList.findOne({"name": username, "password": password}, {projection: {"_id": {"$toString": "$_id"}, name: 1, icon: 1}})
  .then(userDoc => {
    console.log(userDoc)
    if (userDoc == null) {
      console.log("failure")
      res.json({"status": "Login Failure"})
    } else {
      // Successfull login
      // Create session variable userId
      req.session.userId = userDoc._id
      req.session.save()
      // console.log(userDoc)
      console.log(typeof userDoc._id)
      console.log(userDoc._id)
      
      // console.log(req.session.userId)
      // console.log(Object.getOwnPropertyNames(userDoc._id))

      // Retrieve name, icon of user and _id, lastsavedtime, title of all notes from user
      notes = []
      req.db.get("noteList").find({"userId": { '$eq': userDoc._id}})
      .then((docs) => {
        // console.log("find", docs)
        docs.forEach(doc => {
          notes.push({
            "_id": doc._id,
            "lastsavedtime": doc.lastsavedtime,
            "title": doc.title
          })
        });
        console.log(notes)
        return notes
      })
      .then(notes => {
        result = {
          "status": "Login Success",
          "name": userDoc.name,
          "icon": userDoc.icon,
          "notes": notes
        }
        res.json(result)
      })
    }
  })
  .catch(err => res.send(err))
});

/* 2 GET logout */
router.get('/logout', (req, res, next) => {
  req.session.userId = null
  res.send("")
})

/* 3 GET retrieve note by noteid? */
router.get('/getnote', (req, res, next) => {
  const noteId = req.query.noteid
  console.log(noteId)
  req.db.get("noteList").findOne({"_id": noteId})
  .then((note) => {
    console.log(note)
    if (note != null) {
      result = {
        "_id": noteId,
        "lastsavedtime": note.lastsavedtime,
        "title": note.title,
        "content": note.content
      }

      res.json(result)
    } else {
      res.json({"result": `No note with id: ${noteId}`})
    }
  })
  .catch(err => res.send(err))
})


/* 4 POST add note */
router.post('/addnote', (req, res, next) => {
  const title = req.body.title
  const content = req.body.content
  const userId = req.session.userId
  const lastsavedtime = new Date()

  console.log(userId)
  // Check user logged in
  if (userId == undefined) {
    res.json({result: "no userId session"})
    
  } else {
    req.db.get("noteList").insert({
      "title": title,
      "content": content,
      "userId": userId,
      "lastsavedtime": lastsavedtime
    })
    .then((newNote) => {
      console.log(newNote)
      res.json({"_id": newNote._id, "lastsavedtime": newNote.lastsavedtime})
    })
    .catch(err => res.send(err))
  }
  
})


/* 5 PUT update note by id*/
router.put('/savenote/:noteid', (req, res, next) => {
  const noteId = req.params.noteid
  const title = req.body.title
  const content = req.body.content
  const lastsavedtime = new Date()

  console.log(noteId)
  console.log(title, content)

  req.db.get("noteList").update({"_id": noteId}, 
  { $set: {
    "title": title,
    "content": content,
    "lastsavedtime": lastsavedtime
  }})
  .then((updatedNote) => {
    console.log(updatedNote)
    res.json({lastsavedtime: lastsavedtime.toISOString}) // ISO date format - 2019-11-14T00:55:31.820Z
  })
  .catch(err => res.send(err))
})


/* 6 GET search notes by title and content */
router.get('/searchnotes', (req, res, next) => {
  const userId = req.session.userId
  const searchstr = req.query.searchstr
  
  notes = []
  req.db.get("noteList").find({"userId": userId, '$or': [
    {"title": {'$regex': searchstr, '$options': 'i'}}, 
    {"content": {'$regex': searchstr, '$options': 'i'}}]
  })
  .then(docs => {
    console.log(searchstr)
    console.log(docs)
    docs.forEach(note => {
      notes.push({
        "_id": note._id,
        "title": note.title,
        "lastsavedtime": note.lastsavedtime
      })
    })
    return notes
  })
  .then(result => {
    res.json({"notes": notes})
  })
  .catch(err => res.send(err))
})


/* 7 DELETE delete note by id */
router.delete('/deletenote/:noteid', (req, res, next) => {
  const noteId = req.params.noteid

  req.db.get("noteList").remove({"_id": noteId})
  .then(() => res.send(""))
  .catch(err => res.send(err))
})



module.exports = router;

