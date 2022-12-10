var conn = new Mongo();
var db = conn.getDB("assignment2");

const users = ["Andy", "Jack", "Alex"]

for (let i = 0; i < users.length; i++) {
    db.userList.insert({"name": users[i], "password": "123456", "icon": `icons/${users[i]}.jpg`})
}


// db.noteList.insert({'userId': '63902036d4d4181f6978ea83', 'lastsavedtime': '20:12:10 Tue Nov 15 2022', 'title':
// 'assigment2', 'content': 'an iNotes app based on react'})




// var conn = new Mongo();
// var db = conn.getDB("lab6-db");

// var topic_name = ["www", "html", "css", "javascript", "nodejs", "jquery"];
// var topic_status = ["no", "no", "no", "no", "no", "no"];
// var topic_hour = [2, 4, 4, 6, 10, 6];

// db.topicList.remove({});

// for(let i = 0; i < topic_name.length; i++){
//     db.topicList.insert(
//         {
//             'name': topic_name[i],
//             'hour': topic_hour[i],
//             'status': topic_status[i]
//         }
//     )
// }