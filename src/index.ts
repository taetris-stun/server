import http from 'http'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { Server, matchMaker } from 'colyseus'
import { GameRoom } from './room'

export const serverSecret = crypto.randomBytes(30).toString('hex')
const port = Number(process.env['PORT'] || 20605)

const server = express()
server.set('trust proxy', 1)
server.use(express.json())
server.use(cors({
    origin: '*'
}))

const colyseus = new Server({ server: http.createServer(server) })

colyseus.define('GameRoom', GameRoom).enableRealtimeListing()

colyseus.listen(port)
console.log('[taetris-stun] Listening on port ' + port)