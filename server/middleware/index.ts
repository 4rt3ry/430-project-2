import { Request, Response, NextFunction } from 'express';

const requiresLogin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.account) {
        return res.redirect('/');
    }
    return next();
};

const requiresLogout = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.account) {
        return res.redirect('/app');
    }
    return next();
};

const requiresSecure = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.hostname}${req.url}`);
    }
    return next();
};

const bypassSecure = (req: Request, res: Response, next: NextFunction) => {
    next();
};

const optionalSecure = process.env.NODE_ENV === 'production'
    ? requiresSecure : bypassSecure;

export {
    optionalSecure as requiresSecure,
    requiresLogin,
    requiresLogout,
};
