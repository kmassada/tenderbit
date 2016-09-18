import * as express from 'express';
import {log} from '../app'

let router: express.Router;
router = express.Router();

// Log all api Requests
router.use((req: express.Request, res: express.Response, next: express.NextFunction)=>{
    log.info({req: req},'log');
    next();
});
router.route('/')
.get((req, res) => {
    res.json({success: true, 
        message: 'API',
        status: 'success'});
});

export { router as mainRouter};