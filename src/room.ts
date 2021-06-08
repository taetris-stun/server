import { Room, Client, ServerError } from 'colyseus'
import { GameRoomState, PlayerState } from './state'
import { serverSecret } from './index'
import http from 'http'

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {
    // Prevent clients from creating rooms
    if (options.serverSecret !== serverSecret) {
      this.disconnect()
      return
    }

    this.setState(new GameRoomState())
    this.autoDispose = false


    this.onMessage('ready', (client: Client, message: any) => {
      this.state.players.get(client.id).ready = true

      let allReady = true
      this.state.players.forEach((player: PlayerState) => {
        if (player.ready === false) {
          allReady = false
        }
      })

      if (allReady) {
        this.lock()
        this.broadcast('start')
        this.state.players.forEach((player: PlayerState) => {
          player.alive = true
        })
      }
    })

    this.onMessage('canvas', (client: Client, canvas: string) => {
      this.state.players.get(client.sessionId).canvas = canvas
    })

    this.onMessage('line', (client: Client, lineCount: number) => {
      this.state.players.forEach((player: PlayerState) => {
        if (player.alive && player.sessionId !== client.sessionId) {
          // TODO: Contact shocker over bridge
          console.log(`[taetris-stun] Contacting shocker: ${player.shocker}`)
        }
      })
    })

    this.onMessage('gameover', (client: Client, score: number) => {
      this.state.players.get(client.sessionId).alive = false
      this.state.players.get(client.sessionId).score = score
      this.broadcast('gameover', client.sessionId) // Tell everybody that player is dead

      // If everyone is dead reset the room
      let allDead = true
      this.state.players.forEach((player: PlayerState) => {
        if (player.alive === true) {
          allDead = false
        }
      })

      if (allDead) {
        // TODO: Broadcast winner
        this.resetRoom()
      }
    })
  }

  onAuth (client: Client, options: any, request: http.IncomingMessage): boolean {
    if ( // Only accept connections with required option data
      options &&
      options.username &&
      options.shocker &&
      typeof(options.username) === 'string' && 
      typeof(options.shocker) === 'string'
    ) { return true } 
    else { throw new ServerError(400, 'Missing options') }
  }

  onJoin (client: Client, options: any, auth: any) {
    console.log(`[taetris-stun] Client joined: ${client.sessionId}`)

    // Add the new player to the state
    this.state.players.set(client.sessionId, new PlayerState())
    this.state.players.get(client.sessionId).sessionId = client.sessionId
    this.state.players.get(client.sessionId).username = options.username
    this.state.players.get(client.sessionId).shocker = options.shocker
  }

  onLeave (client: Client, consented: boolean) {
    console.log(`[taetris-stun] Client left: ${client.sessionId}`)

    // Remove his data from the state
    this.state.players.delete(client.sessionId)
  
    // If he was the last one reset the room
    if (this.clients.length === 0) {
      this.resetRoom()
    }
  }

  resetRoom() {
    console.log('[taetris-stun] Reset room')
    // Kick everyone out of the room
    this.clients.forEach((client: Client) => {
      client.leave()
    })
    this.state.players.clear() // Clear everyones state
    this.unlock() // Open up the room again
  }

}