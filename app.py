from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, join_room
from datetime import timedelta
from markupsafe import escape
import os.path


# Verileri local de tutabilmek icin olusturdugum class

class LastData:
    def __init__(self):
        self.roomsData = {}

    def pushRoomData(self, source, roomData):
        data = {}
        data['source'] = source
        data['oda'] = roomData['oda']
        data['ekran'] = roomData['ekran']
        self.roomsData[roomData['oda']] = data
        print(self.roomsData)

    def isDataExist(self, source):
        for key in self.roomsData:
            if self.roomsData[key]["source"] == source:
                return True
            else:
                return False

    def checkIfSourceRoomIsExist(self, data, source):
        for key in self.roomsData:
            if self.roomsData[key]['oda'] == data['oda'] and (not self.roomsData[key]['source'] == source):
                print('founded')
                return True

        return False

    def getLastData(self, source):
        allDataOfRoom = []
        for key in self.roomsData:
            data = {}
            if source == self.roomsData[key]['source']:
                data['oda'] = self.roomsData[key]['oda']
                data['ekran'] = self.roomsData[key]['ekran']
                allDataOfRoom.append(data)

        return allDataOfRoom


class InvalidRoomNameError(Exception):
    """Bu oda ismi kullanılmaktadır lütfen farklı bir oda ismi deneyiniz"""
    pass


app = Flask(__name__)
app.config['SECRET_KEY'] = 'ba71047a828841cb81ac5e091c226512'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=730)
socketio = SocketIO(app, logger=True, engineio_logger=True)
lastData = LastData()


@app.route('/')
def home():
    return "KAPIUSTU WEB"


@app.route('/ekran/<oda>')
def ekranGoster(oda):
    oda = escape(oda)
    session['oda'] = oda
    if os.path.isfile('templates/' + oda + '.html'):
        return render_template(oda + ".html")
    else:
        return render_template("poliklinik.html")


@app.route('/api', methods=["GET", "POST"])
def api():
    response = ""
    try:
        print('data came')
        data = request.json
        source = request.args.get('oda')
        res = lastData.checkIfSourceRoomIsExist(data, source)
        print(res)
        if not res:
            socketio.send(data, json=True, to=source)
            lastData.pushRoomData(source, data)
            response = "SUCCESS", 200
        if res:
            raise InvalidRoomNameError
    except InvalidRoomNameError:
        response = "Bu oda ismi kullanılmaktadır lütfen farklı bir oda ismi deneyiniz", 400
    except:
        response = "ERROR", 400
    return response


@socketio.on('connect')
def ws_connect():
    if session["oda"]:
        join_room(session["oda"])
        print('connected')
        allData = lastData.getLastData(session['oda'])
        for data in allData:
            socketio.send(data, json=True, to=request.sid)
        # data = {'ekran': lastData[session["oda"]]}
        # socketio.send(data, json=True, to=request.sid)
    pass


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0")
