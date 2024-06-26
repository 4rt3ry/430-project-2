import { Request, Response } from 'express';

const page404 = (req: Request, res: Response) => {
    const title = '404 Page Not Found';
    const message = '';
    return res.status(404).render('error', { title, message });
};

const page500 = (req: Request, res: Response) => {
    const title = '500 Internal Server Error';
    const message = '';
    return res.status(500).render('error', { title, message });
};

export * as Account from './Account';
export * as App from './App';
export * as Message from './Message';
export * as ChatRoom from './ChatRoom';

export {
    page404,
    page500,
};
