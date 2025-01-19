from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player


def register(request):
    dat = request.GET
    username = dat.get("username", "").strip()
    password = dat.get("password", "").strip()
    password_confirm = dat.get("password_confirm", "").strip()

    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空",
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "两次输入的密码不一致",
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在",
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://img1.baidu.com/it/u=22288077,496599681&fm=253&fmt=auto&app=138&f=JPEG")
    login(request, user)
    return JsonResponse({
        'result': "success",
    })
