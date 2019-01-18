import express from 'express';

const router = express.Router();

/**
 * Error handler
 */
router.get(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.json({
        status: err.status,
        message: err.message,
    });
});

export default router;