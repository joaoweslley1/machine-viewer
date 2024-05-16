from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

@app.route('/api/devices')
def device_status():
    conn = sqlite3.connect('database/main_database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maquina_cadastro")
    cadastro = cursor.fetchall()

    cursor.execute("SELECT * FROM maquina_status")
    status = cursor.fetchall()

    conn.close()

    return jsonify([cadastro,status],[])

if __name__ == '__main__':
    app.run(debug=True, port=59001)