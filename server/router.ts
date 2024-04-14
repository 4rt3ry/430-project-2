import express from 'express';
import * as controllers from './controllers';
import * as mid from './middleware';

const router = (app: express.Express) => {
    app.get('/login', mid.requiresSecure, (req: express.Request, res: express.Response) => { });
};

export default router;
