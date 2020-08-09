const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const ytdl = require('ytdl-core')

client.once('ready', () => {
    console.log("I'm Ready!")
})

// about the Server
client.on('message', msg => {
    if (msg.content == `server${config.prefix}`) {
        msg.channel.send(`---------------------------------------------------------------------------------------------------------------
O nome do servidor é ${msg.guild.name}
Total de membros: ${msg.guild.memberCount} participantes!
Servidor criado em ${msg.guild.createdAt}
Região do servidor: ${msg.guild.region}
---------------------------------------------------------------------------------------------------------------`)
    }
})

// OPA Commands
client.on('message', msg => {
    if (msg.content == 'Opa!') {
        msg.channel.send('Epa!')
    }
})

// User Commands
client.on('message', msg => {
    if (msg.content == `myuser${config.prefix}`) {
        msg.channel.send(`Seu usuário: ${msg.author.username} \nSeu ID: ${msg.author.id}`)
    }
})

// Music Commands
let queue = []
let cont = 0
client.on('message', msg => {
    let music = {}
    let tocarMusic = con => {
        music = con.play(ytdl(queue[0], {
            filter: 'audio',
            quality: 'highestaudio',
            highWaterMark: 1<<25
        }))
        msg.channel.send(`Tocando agora: ${queue[0]}`)

        music.on('finish', () => {
            queue.shift()
            cont--
            if (queue.length == 0) {
                msg.channel.send('Todas as músicas acabaram, adeus!')
                msg.member.voice.channel.leave()
                cont = 0
            }
            else {
                tocarMusic(con)
            }
        })
    }

    if (msg.content.startsWith('play ') && msg.content[msg.content.length - 1] == ';' && msg.content[msg.content.length - 2] != ' ') {
        if (msg.member.voice.channel) {
            let link = msg.content.replace('play', '').replace(';', '').replace(' ', '')

            if (ytdl.validateURL(link)) {
                msg.member.voice.channel.join()
                    .then(con => {
                        queue.push(link)
                        if (cont == 0) {
                           tocarMusic(con)
                        }
                        else {
                            msg.channel.send(`Sua música foi adicionada na ${cont}ª posição da fila! :)`)
                        }
                        cont++
                    })
                    .catch(e => console.log(e))
            }
            else {
                msg.channel.send('Digite somente link do youtube, por favor!')
            }
        }
        else {
            msg.channel.send('Por favor, entre em um canal de voz primeiro')
        }
    }

    else if (msg.content == `queue${config.prefix}`) {
        if (queue.length <= 1) {
            msg.channel.send('A fila está vazia!')
        }
        else {
            msg.channel.send(`=--=-=-=--===-=-=-=-=-==--==-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-==-=-=-=-=-=-=-=-
** QUEUE **`)
            for (let i = 0; i < queue.length - 1; i++) {
                msg.channel.send(`${i + 1}º - ${queue[i + 1]}`)
            }
            msg.channel.send('=--=-=-=--===-=-=-=-=-==--==-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-==-=-=-=-=-=-=-=-')
        }
    }

    else if (msg.content == `skip${config.prefix}`) {
        queue.shift()
        cont--
        if (queue.length == 0) {
            msg.channel.send('Todas as músicas acabaram, adeus!')
            msg.member.voice.channel.leave()
            cont = 0
        }
        else {
            msg.member.voice.channel.join()
                .then(con => tocarMusic(con))
                .catch(e => console.log(e))
        }
    }
})

client.login(config.token)
