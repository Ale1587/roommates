const axios = require('axios');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const newRoommate = async () =>{
    try {
        const { data } = await axios.get('http://randomuser.me/api')
        const roommate = data.results[0]
        const roommateApi = {
            correo: roommate.email,
            nombre:`${roommate.name.first} ${roommate.name.last}`
        }
        return roommateApi
    } catch (err) {
        throw err
    }
}

const saveRoomate = (roommateApi) => {
    const roommatesJSON = JSON.parse(fs.readFileSync('roommate.json', 'utf-8'))
    roommatesJSON.roommates.push(roommateApi)
    fs.writeFileSync('roommate.json', JSON.stringify(roommatesJSON, null, ' '))
}

module.exports = { newRoommate, saveRoomate }