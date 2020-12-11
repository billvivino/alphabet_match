
function htmlsafe(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function checkLoginToken() {
    if (Storage.getSmall('logintoken') == null)
        window.location.href = window.location.origin;
    else
        Server.setvalue('token', Storage.getSmall('logintoken'));
}

function addSocialMedia() {
    $("#socialmedia").append('<a href="https://www.facebook.com/TheKangarooCrew"><img src="' + window.location.origin + '/img/social_media_facebook.png" title="Facebook" alt="Facebook" id="sm_facebook"</a>');
    
    $("#socialmedia").append('<a href="https://twitter.com/TheKangarooCrew"><img src="' + window.location.origin + '/img/social_media_twitter.png" title="Twitter" alt="Twitter" id="sm_twitter"></a>');

    $("#socialmedia").append('<a href="https://www.youtube.com/channel/UCSUbUE8E4CosmeA8AnMHK0w"><img src="' + window.location.origin + '/img/social_media_youtube.png" title="Youtube" alt="Youtube" id="sm_youtube"></a>');

    $("#socialmedia").append('<a href="https://apps.apple.com/us/app/loo-loos-alphabet-matching/id893278924"><img src="' + window.location.origin + '/img/social_media_apple.png" title="Apple Store" alt="Apple Store" id="sm_apple"></a>');

    $("#socialmedia").append('<a href="https://play.google.com/store/apps/details?id=com.kangaroocrew.alphabet"><img src="' + window.location.origin + '/img/social_media_google_store.png" title="Google Play Store" alt="Google Play Store" id="sm_google"></a>');

    $("#socialmedia").append('<a href="https://www.pinterest.com/thekangaroocrew/"><img src="' + window.location.origin + '/img/social_media_pinterest.png" title="Pinterest" alt="Pinterest" id="sm_pinterest"></a>');
}


