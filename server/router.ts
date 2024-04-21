import express from 'express';
import * as mid from './middleware';
import {
    Account, App, page404, page500,
} from './controllers';

const router = (app: express.Express) => {
    app.get('/', mid.requiresLogout, Account.loginPage);

    // login requests
    app.get('/login', mid.requiresSecure, mid.requiresLogout, Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, Account.login);
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, Account.signup);
    app.get('/logout', mid.requiresLogin, Account.logout);

    // main app
    app.get('/app', mid.requiresSecure, mid.requiresLogin, App.default);

    app.get('/personalChatId', mid.requiresSecure, Account.getPersonalChatId);
    app.get('/checkUserChatId', mid.requiresSecure, Account.checkUserChatId);

    app.get('/404', page404);
    app.get('/500', page500);

    // setup 404 page
    app.use((req: express.Request, res: express.Response) => {
        if (req.accepts('html')) {
            page404(req, res);
        }
    });
};

export default router;
