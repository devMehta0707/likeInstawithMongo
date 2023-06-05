const jwt = require('jsonwebtoken');

async function authenticate(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ code: 401, msg: "Unauthorized" })
    }
    jwt.verify(token, "InstaApp", (err, result) => {
        if (err) {
            return res.status(401).json({ code: 401, msg: "Invalid Token" })
        }
        req.body.user_detail = result;
        next();
    })
}

module.exports = { authenticate };