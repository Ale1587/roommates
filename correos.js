const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nodemailertestbootcamp22@gmail.com',
        pass: 'desafioFullStack2122*'
    }
})

const send = async (nombre, descripcion, monto, correos) => {
    let mailOptions = {
        from: 'nodemailertestbootcamp22@gmail.com',
        to: ['valencialemus.a@gmail.com'].concat(correos),
        subject: `Hola!, ${nombre} a agregado un nuevo gasto`,
        html: `<h3> El roommate: ${nombre} a agregado el siguiente gasto: <br/> -${descripcion} con un valor de ${monto}</h3>`
    };

    try{
        const result = await transport.sendMail(mailOptions)
        return result
    } catch (err){
        throw err;
    }
}

module.exports = { send }