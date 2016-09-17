import * as express from 'express';

let router: express.Router;
router = express.Router();

router.route('/')
.get((req, res) => {
    res.json({ success: true, message: 'API' });
});

export { router as mainRouter};