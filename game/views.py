from django.http import HttpResponse


def index(request):
    return HttpResponse("首页！！！")

def play(request):
    line1 = '游戏界面'
    return HttpResponse(line1)
