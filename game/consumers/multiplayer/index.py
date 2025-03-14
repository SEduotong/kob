from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match_service import Match
from game.models.player.player import Player
from channels.db import database_sync_to_async


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):

        self.room_name = None
        self.uuid = data['uuid']

        transport = TSocket.TSocket('127.0.0.1', 9090)

        transport = TTransport.TBufferedTransport(transport)

        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player) ()

        transport.open()

        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)

        transport.close()

    async def group_send_event(self, data):
        if not self.room_name:
            keys = cache.keys('*%s*' % self.uuid)
            if keys:
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data))

    async def move_to(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "move_to",
            'uuid': data['uuid'],
            'tx': data['tx'],
            'ty': data['ty'],
        })

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "shoot_fireball",
            'uuid': data['uuid'],
            'tx': data['tx'],
            'ty': data['ty'],
            'ball_uuid': data['ball_uuid'],
        })

    async def attack(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "attack",
            'uuid': data['uuid'],
            'attackee_uuid': data['attackee_uuid'],
            'x': data['x'],
            'y': data['y'],
            'angle': data['angle'],
            'damage': data['damage'],
            'ball_uuid': data['ball_uuid'],
        })

    async def blink(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "blink",
            'uuid': data['uuid'],
            'tx': data['tx'],
            'ty': data['ty'],
        })

    async def message(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "message",
            'uuid': data['uuid'],
            'username': data['username'],
            'text': data['text'],
        })

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
