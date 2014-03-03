// Administration routes

// options => user, pass
exports.Admin = function (options) {

    function auth (user, pass) {
        return user === options.user && pass === options.pass;
    }

    function login (req, res) {

        if (!auth(req.param('user'), req.param('pass')))
            return res.status(401).send('Unauthorized');

        req.session.user = req.param('user');
        res.redirect('/blog/admin');
    }

    function logout (req, res) {
        req.session.user = undefined;
    }

    return {
        login  : login,
        logout : logout
    };
};
