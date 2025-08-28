const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const statusCode = res.statusCode ? res.statusCode : 500; // Default to 500 if status code is not set
    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null, // Hide stack trace in production
    });
};

module.exports = errorHandler;