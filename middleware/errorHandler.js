exports.errorHandler = (err, req, res, next) => {
    console.log(`Error Occured:- ${err.stack}`)
    return res.status(500).json({ code: 500, msg: "Something went Wrong! Please try again Later" })
}