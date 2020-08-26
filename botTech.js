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

    let lyrics = async (url, song) => {
        let id = url.split('=')[1]
        let info = await fetchVideo(id)
        

        let artist = info.owner

        if (artist.includes('VEVO')) {
            let name = artist.replace('VEVO', '')
            if (info.title.replace(' ', '').includes(name)) {
                artist = info.title.split(' -')[0]
            }
        }

        let url2 = `https://api.lyrics.ovh/v1/${artist}/${song}`

        try {
            const html = await fetch(url2)
            const json = await html.json()

            if (json.error) {
                msg.reply('Nenhuma música foi encontrada!')
            }
            else {
                let part1 = ''
                let part2 = ''
                for (let i = 0; i < json.lyrics.length; i++) {
                    if (i < 2000) {
                        part1 += json.lyrics[i]
                    }
                    else {
                        part2 += json.lyrics[i]
                    }
                }
                
                msg.channel.send(`Song of ${artist}!`)
                msg.channel.send(part1)
                if (part2.length != 0) {
                    msg.channel.send(part2)
                }
                msg.channel.send('-----------------------------------------------------------')
            }
        }
        catch (err) {
            console.log('Deu erro: ', err)
            msg.reply('Tente nosso outro comando: lyrics {autor} && {musica};')
        }

    }

    let lyricsRandom = async (author, song) => {
        let url = `https://api.lyrics.ovh/v1/${author}/${song}`

        try {
            const html = await fetch(url)
            const json = await html.json()

            if (json.error) {
                msg.reply('Nenhuma música foi encontrada!')
            }
            else {
                let part1 = '' 
                let part2 = ''
                for (let i = 0; i < json.lyrics.length; i++) {
                    if (i < 2000) {
                        part1 += json.lyrics[i]
                    }
                    else {
                        part2 += json.lyrics[i]
                    }
                }

                msg.channel.send(`Song of ${author}!`)
                msg.channel.send(part1.trim())
                if (part2.length != 0) {
                    msg.channel.send(part2.trim())
                }
                msg.channel.send('-----------------------------------------------------------')
            }
        }
        catch (erro) {
            console.log('Deu erro: ', erro)
            msg.reply('Erro inesperado!')
        }

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
        if (msg.member.voice.channel) {
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
        else {
            msg.reply('Para usar o Skip, você precisa estar em um canal de voz!')
        }
    }

    else if (msg.content.startsWith('lyrics ') && msg.content[msg.content.length - 1] == ';' && msg.content[msg.content.length - 2] != ' ' 
        && !msg.content.includes('&&')) {
        if (queue.length != 0) {
            let fakesong = msg.content.split('lyrics')[1].split(';')[0]
            let song = fakesong.replace(fakesong[0], '')
            lyrics(queue[0], song)
        }
        else {
            msg.reply('Tente nosso outro comando: lyrics {autor} && {musica};')
        }
    }

    else if (msg.content.startsWith('lyrics ') && msg.content[msg.content.length - 1] == ';' && msg.content[msg.content.length - 2] != ' ' 
        && msg.content.includes('&&')) {
        let author = msg.content.split(' &&')[0].split(' lyrics')[0].split('lyrics ')[1]
        let song = msg.content.split('&& ')[1].split(';')[0]
        lyricsRandom(author, song)
    }
})

client.login(config.token)
