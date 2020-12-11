
var Storage = (function() {
    var M = {};

    M.setSmall = function(key, value) {
        return window.localStorage.setItem(key, JSON.stringify(value));
    };

    M.getSmall = function(key) {
        return JSON.parse(window.localStorage.getItem(key));
    };

    M.delSmall = function(key) {
        window.localStorage.removeItem(key);
    };

    // TODO implement
    M.getLarge = M.getSmall;
    M.setLarge = M.setSmall;
    M.delLarge = M.delSmall;
    
    return M;
})();
