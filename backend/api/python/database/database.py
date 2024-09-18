import sqlite3

DATABASE_PATH = 'database/db.sqlite'

def connect():
    return sqlite3(DATABASE_PATH)