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
        this.broadcast('start')
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
    console.log(`[taetris-stun] New client: ${JSON.stringify(options)}`)

    // Add the new player to the state
    this.state.players.set(client.sessionId, new PlayerState())
    this.state.players.get(client.sessionId).username = options.username
    this.state.players.get(client.sessionId).shocker = options.shocker
    this.state.players.get(client.sessionId).ready = false
  }

  onLeave (client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId)
  }

  onDispose() {

  }

}