import { Schema, type, MapSchema, ArraySchema, filter } from '@colyseus/schema'

export class PlayerState extends Schema {
  @type('string') sessionId: string
  
  @type('string') username: string

  @filter(function() { return false })
  @type('string') shocker: string

  @type('boolean') ready: boolean = false

  @type('string') canvas: string

  @type('boolean') alive: boolean = false

  @type('number') score: number = 0
}

export class GameRoomState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>()
}