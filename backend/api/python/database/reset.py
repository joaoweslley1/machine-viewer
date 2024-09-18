import database.migration as mg

def reset_database():
    mg.down()
    mg.up()

reset_database()