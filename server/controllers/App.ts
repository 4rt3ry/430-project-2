import { Request, Response } from 'express';

const appPage = (req: Request, res: Response) => res.render('app');

const aboutPage = (req: Request, res: Response) => res.render('about');

export {
    appPage,
    aboutPage,
};
