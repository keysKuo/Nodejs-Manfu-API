module.exports.adminAuth = (req, res, next) => {
    let role = req.session.role || '';
    if(role == 'admin')
        next();

    return res,redirect('/login')
}