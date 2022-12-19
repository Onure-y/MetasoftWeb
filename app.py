
from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, join_room
from datetime import timedelta
from markupsafe import escape
import os.path


class LastData:
    def __init__(self):
        self.roomsData = {}

    def pushRoomData(self, source, roomData):
        lastData = {}
        lastData['source'] = source
        lastData['oda'] = roomData['oda']
        lastData['ekran'] = roomData['ekran']
        self.roomsData[roomData['oda']] = lastData

    def isDataExist(self, source):
        for key in self.roomsData:
            if (self.roomsData[key]["source"] == source):
                return True
            else:
                return False

    def getLastData(self, source):
        allDatasOfRoom = []
        for key in self.roomsData:
            data = {}
            if source == self.roomsData[key]['source']:
                data['oda'] = self.roomsData[key]['oda']
                data['ekran'] = self.roomsData[key]['ekran']
                allDatasOfRoom.append(data)

        return allDatasOfRoom


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
        return render_template(oda+".html")
    else:
        return render_template("poliklinik.html")


@app.route('/api', methods=["GET", "POST"])
def api():
    response = ""
    try:
        print('data came')
        data = request.json
        source = request.args.get('oda')
        socketio.send(data, json=True, to=source)
        lastData.pushRoomData(source, data)
        response = "SUCCESS", 200
    except:
        response = "ERROR", 400
    return response


@socketio.on('connect')
def ws_connect():
    if session["oda"]:
        join_room(session["oda"])
        if lastData.isDataExist(session["oda"]):
            allData = lastData.getLastData(session['oda'])
            for data in allData:
                socketio.send(data, json=True, to=request.sid)
            # data = {'ekran': lastData[session["oda"]]}
            # socketio.send(data, json=True, to=request.sid)
    pass


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0")


