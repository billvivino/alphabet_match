
Config = null;

function defaultConfig() {
    // see database.py for information on this structure.
    // this function is used when either:
    // - the server can't be reached and there's no cached config
    // - the server returns a null config
    return {
        linked: false,
        version: 'home',
        profile_mode: 'chars',
        slots: ['1', '2', '3', '4'],
    };
}
