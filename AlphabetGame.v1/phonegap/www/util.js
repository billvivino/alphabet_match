
function randint(a, b) {
    if (typeof b === 'undefined') {
        b = a - 1;
        a = 0;
    }
    return a + Math.floor(Math.random() * (b - a + 1));
}
