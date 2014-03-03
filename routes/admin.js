// Administration routes

function auth (user, pass) {
    return user === 'user' && pass === 'pass';
}

exports.login = function (req, res) {

    if (!auth(req.param('user'), req.param('pass')))
        return res.status(401).send('Unauthorized');

    req.session.user = req.param('user');
    console.log('logged in');
    res.redirect('/blog/admin');
};

exports.logout = function (req, res) {
    req.session.user = undefined;
};
