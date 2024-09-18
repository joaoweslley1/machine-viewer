import sqlite3

DATABASE_PATH = 'database/db.sqlite'

def connect() -> sqlite3.Connection: 
    return sqlite3.connect(DATABASE_PATH)