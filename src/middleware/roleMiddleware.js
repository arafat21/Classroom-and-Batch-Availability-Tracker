function teacherOnly(req, res, next) {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Teachers only.' });
    }
    next();
}

function studentOnly(req, res, next) {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
}

module.exports = { teacherOnly, studentOnly, adminOnly };