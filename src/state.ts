import { Schema, type, MapSchema, filter } from '@colyseus/schema'

export class PlayerState extends Schema {
  @type('string')
  username: string

  @filter(function() { return false })
  @type('string')
  shocker: string

  @type('boolean')
  ready: boolean
}

export class GameRoomState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>()
}