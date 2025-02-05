from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from game.models.player.player import Player


class PlayerView(APIView):
    def post(self, request):
        dat = request.POST
        username = dat.get("username", "").strip()
        password = dat.get("password", "").strip()
        password_confirm = dat.get("password_confirm", "").strip()

        if not username or not password:
            return Response({
                'result': "用户名和密码不能为空",
            })
        if password != password_confirm:
            return Response({
                'result': "两次输入的密码不一致",
            })
        if User.objects.filter(username=username).exists():
            return Response({
                'result': "用户名已存在",
            })
        user = User(username=username)
        user.set_password(password)
        user.save()
        Player.objects.create(user=user,
                              photo="https://img1.baidu.com/it/u=22288077,496599681&fm=253&fmt=auto&app=138&f=JPEG")
        return Response({
            'result': "success",
        })
