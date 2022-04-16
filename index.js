const http = require('http');
const fs = require('fs');
const { newRoommate, saveRoomate } = require('./roommate')
const { v4: uuidv4 } = require('uuid')
const url = require('url')
const { send } = require('./correos')

http.createServer((req, res) => {
    let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf-8'))
    let roomantesJSON = JSON.parse(fs.readFileSync('roommate.json', 'utf-8'))
    let gastos = gastosJSON.gastos
    let roommates = roomantesJSON.roommates
    let { id } = url.parse(req.url, true).query


    // ruta raíz que levanta el html

    if (req.url == '/' && req.method == 'GET') {
        res.setHeader('content-type', 'text/html');
        res.end(fs.readFileSync('index.html', 'utf-8'))
    }

    // ruta que genera los roomantes

    if (req.url.startsWith('/roommate') && req.method == 'POST') {
        newRoommate().then(async (roommateApi) => {
            saveRoomate(roommateApi)
            res.end(JSON.stringify(roommateApi))
        }).catch((err => {
            res.statusCode = 500;
            res.end();
            console.log('Error en el registro de un usuario', err);
        }))
    }

    // ruta que entrega al cliente los roommates almacenados en el json roommate

    if (req.url.startsWith('/roommates') && req.method == 'GET') {
        res.setHeader('content-type', 'application/json')
        res.end(fs.readFileSync('roommate.json', 'utf-8'))
    }

    // ruta que recoge del body los gatos ingresados de un roommate

    if (req.url.startsWith('/gasto') && req.method == 'POST') {
        let body = '';
        req.on('data', (payload) => {
            body = JSON.parse(payload)
        })
        req.on('end', () => {
            let gasto = {
                id: uuidv4().slice(30),
                roommate: body.roommate,
                descripcion: body.descripcion,
                monto: body.monto
            }
            gastosJSON.gastos.push(gasto)
            const nombre = body.roommate
            const correos = roommates.map((e) => e.correo)
            const descripcion = body.descripcion
            const monto = body.monto

            send(nombre, descripcion, monto, correos).then(() => {
                res.end(fs.writeFile('gastos.json', JSON.stringify(gastosJSON, null, ' '), (err) => {
                    err ? console.log('Ha ocurrido un error') : console.log('Todo ok');
                    res.end('Gasto ingresado con exito')
                }))
            }).catch(e => {
                res.statusCode = 500;
                res.end();
                console.log('Error en el envío de correos electronicos', e);
            })
            
        })
    }

    // ruta que entrega al cliente los gastos almacendos en el json gastos

    if (req.url.startsWith('/gastos') && req.method == 'GET') {
        res.setHeader('content-type', 'application/json')
        res.end(fs.readFileSync('gastos.json', 'utf-8'))
    }

    // ruta que recibe la consulta y modifica los datos almacenados en el json gastos 

    if (req.url.startsWith('/gasto') && req.method == 'PUT') {
        let body = ''

        req.on('data', (payload) => {
            body = JSON.parse(payload)
        })

        req.on('end', () => {
            gastosJSON.gastos = gastos.map((g) => {
                if (g.id == id) {
                    let gasto = {
                        id: id,
                        roommate: body.roommate,
                        descripcion: body.descripcion,
                        monto: body.monto
                    }

                    return gasto
                }
                return g
            })

            fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON, null, ' '), (err) => {
                err ? console.log('Ha ocurrido un error') : console.log('Todo ok');
                res.end('Gasto modificado con exito')
            })
            res.end()
        })
    }

    // ruta que borra registro del json gasto

    if (req.url.startsWith('/gasto') && req.method == 'DELETE') {
        gastosJSON.gastos = gastos.filter((g) => g.id !== id)
        fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON, null, ' '), (err) => {
            err ? console.log('Ha ocurrido un error') : console.log('Todo ok');
            res.end('Gasto borrado con exito')
        })
        res.end(fs.readFileSync('gastos.json', 'utf-8'))
    }
})
    .listen(3500, () => console.log('Server ON'))