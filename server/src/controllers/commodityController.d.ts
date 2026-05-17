import { Request, Response } from 'express';
export declare const getAllCommodities: (req: Request, res: Response) => Promise<void>;
export declare const getCommodityBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCommodityPrediction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
