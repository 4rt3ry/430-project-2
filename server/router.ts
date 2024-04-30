import express from 'express';
import * as mid from './middleware';
import {
    Account, Message, ChatRoom, App, page404, page500,
} from './controllers';

const router = (app: express.Express) => {
    app.get('/', mid.requiresLogout, Account.loginPage);

    // login requests
    app.get('/login', mid.requiresSecure, mid.requiresLogout, Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, Account.login);
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, Account.signup);
    app.get('/logout', mid.requiresLogin, Account.logout);

    // main app
    app.get('/app', mid.requiresSecure, mid.requiresLogin, App.appPage);

    app.get('/personalChatId', mid.requiresSecure, mid.requiresLogin, Account.getPersonalChatId);
    app.get('/checkUserChatId', mid.requiresSecure, mid.requiresLogin, Account.checkUserChatId);

    app.post('/account', mid.requiresSecure, mid.requiresLogin, Account.modifyAccount);
    app.post('/secureAccount', mid.requiresSecure, mid.requiresLogin, Account.modifyAccountSecure);
    app.get('/account', mid.requiresSecure, mid.requiresLogin, Account.getAccount);
    app.get('/account/settings', mid.requiresSecure, mid.requiresLogin, Account.accountPage);
    app.post('/purchasePremium', mid.requiresSecure, mid.requiresLogin, Account.purchasePremium);

    app.post('/createMessage', mid.requiresSecure, mid.requiresLogin, Message.createMessage);
    app.get('/getMessages', mid.requiresSecure, mid.requiresLogin, Message.getMessages);

    app.post('/createAndGetRoom', mid.requiresSecure, mid.requiresLogin, ChatRoom.createAndGetRoom);
    app.get('/getRooms', mid.requiresSecure, mid.requiresLogin, ChatRoom.getRooms);
    app.post('/changeRoomName', mid.requiresSecure, mid.requiresLogin, ChatRoom.changeRoomName);

    app.get('/about', App.aboutPage);

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
