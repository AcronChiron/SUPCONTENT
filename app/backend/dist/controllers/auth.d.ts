import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const refresh: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const oauthGoogle: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const oauthGoogleCallback: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const oauthGithub: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const oauthGithubCallback: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map