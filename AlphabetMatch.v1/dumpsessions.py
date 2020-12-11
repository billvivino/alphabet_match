import database, json

sessions = database.getProfileSessions('study')

with open('sessions.json', 'w') as f:
    json.dump(sessions, f, indent=4, sort_keys=True)
