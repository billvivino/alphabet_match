
if (Storage.getSmall('logintoken') != null) {
    Server.call('login', {token: Storage.getSmall('logintoken')}, (data) => {
        $('#email_login').hide();
        $('#token_login').show();
    });
}

$('#loginbutton').click(() => {
    var email = $('#email').val();
    var pwd = $('#password').val();
    
    Server.call('login', {email: email, password: pwd}, (data) => {
        Storage.setSmall('logintoken', data.token);
        window.location.href = window.location.origin + '/home.html';
    }, (err) => {
        alert(err.msg);
    });
});

$('#logout').click(() => {
    Storage.delSmall('logintoken');
    window.location.reload();
});

$('#tokenbutton').click(() => {
    window.location.href = window.location.origin + '/home.html';
});

addSocialMedia();
