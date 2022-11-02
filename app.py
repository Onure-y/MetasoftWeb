
from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, join_room
from datetime import timedelta
from markupsafe import escape
import os.path


app = Flask(__name__)
app.config['SECRET_KEY'] = 'ba71047a828841cb81ac5e091c226512'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=730)
socketio = SocketIO(app, logger=True, engineio_logger=True)
lastData = {}


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
        return render_template("index.html")


@app.route('/api', methods=["GET", "POST"])
def api():
    response = ""
    try:
        data = request.json
        socketio.send(data, json=True, to=data['oda'])
        lastData[data['oda']] = data['ekran']
        response = "SUCCESS", 200
    except:
        response = "ERROR", 400
    return response


@socketio.on('connect')
def ws_connect():
    if session["oda"]:
        join_room(session["oda"])
        if lastData.get(session["oda"]):
            data = {'ekran': lastData[session["oda"]]}
            socketio.send(data, json=True, to=request.sid)
    pass


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0")
