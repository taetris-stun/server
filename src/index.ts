import http from 'http'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import WebSocket from 'ws'
import path from 'path'
import { Server, matchMaker } from 'colyseus'
import { GameRoom } from './room'

const serverSecret = crypto.randomBytes(30).toString('hex')
const portColyseus = Number(process.env['TAE_PORT_COLY'] || 3000)
const portBridge = Number(process.env['TAE_PORT_BRIDGE'] || 3001)
const baseShockTime = 10 // ms


const shockers = new Map<string, WebSocket>()
const bridge = new WebSocket.Server({ port: portBridge })
bridge.on('connection', (socket: WebSocket) => {
  socket.on('message', (data: WebSocket.Data) => {
    console.log(`[taetris-stun] New shocker: ${data as string}`)
    shockers.set(data as string, socket)
  })
})
console.log('[taetris-stun] Bridge on port ' + portBridge)


const app = express()
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.set('trust proxy', 1)
app.use(cors({ origin: '*' }))

const colyseus = new Server({ server: http.createServer(app) })
colyseus.define('GameRoom', GameRoom).enableRealtimeListing()
colyseus.listen(portColyseus)
console.log('[taetris-stun] Listening on port ' + portColyseus)

matchMaker.createRoom('GameRoom', { serverSecret }).then(() => {
  console.log('[taetris-stun] Created GameRoom')
})

export { serverSecret, shockers, baseShockTime }