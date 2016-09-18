import * as express from 'express';
import * as dotenv from "dotenv";
import * as socketIo from "socket.io";
import * as path from "path";
import * as http from "http";
import * as mongoose from "mongoose";
import * as bunyan from "bunyan";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

import { mainRouter } from "./routes/router";

class Server {
  public log: bunyan.Logger;
  public app: any;
  private server: any;
  private io: any;
  private root: string;
  private apiPrefix: string;
  private port: number;
  private mongo: any;
  
  constructor() {
    this.log = this.logger();
    this.app = express();
    this.config();
    this.routes();
    this.server = http.createServer(this.app);
    this.sockets();
    this.listen();
    this.databases();
  }
  private config(): void {
    dotenv.config();
    this.port = process.env.PORT || 3222;
    this.apiPrefix = process.env.APP_API_VERSION || '/api/v1';
    this.root = path.join(path.resolve(__dirname, '../'));
  }
  private sockets(): void {
    this.io = socketIo(this.server);
  }

  private routes(): void {
    // Static Routing for /
    let staticRouter: express.Router;
    staticRouter = express.Router();
    // For parsing application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({extended: true}));
    // For parsing application/json
    this.app.use(bodyParser.json());
    this.app.use(session({
      secret: 'library',
      resave: true,
      saveUninitialized: true,
    }));
    this.app.use(cookieParser());
    // Static Assets
    this.app.use('/assets', express.static(path.resolve(this.root, 'assets')));
    // Api Routing
    this.app.use(this.apiPrefix, mainRouter);
    // Use docs generated from Raml as the api
    staticRouter.get('/', (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(this.root, 'docs/index.html'));
    });
    this.app.use('/#\?', staticRouter);
    // Error Handling
      this.app.use((req: express.Request, res: express.Response, next: express.NextFunction)=>{
      this.log.info("burrrrrr");
      res.status(500).json({status: 'error', 
        message: 'error loading page', 
        success: false});
    });
    this.app.use((err, req: express.Request, res: express.Response, next: express.NextFunction)=>{
      if (res.headersSent) {
        return next(err);
      }
      this.log.info(err.stack);
      res.status(500).json({
        status: 'error', 
        message: 'error occured in application\n'+err.stack, 
        success: false});
    });
  }
  private listen(): void {
    this.server.listen(this.port);
    this.server.on("error", error => {
        this.log.info("ERROR", error);
    });
    this.server.on("listening", () => {
        this.log.info(`==> Listening on port ${this.port}.
        Open up http://localhost:${this.port}/ in your browser.`);            
    });
  }
  private databases(): void {
    // MongoDB URL
    let mongoDBUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/tenderbit';

    // Get MongoDB handle
    this.mongo = mongoose.connect(mongoDBUrl, (err, res)=>{
      if (err) {
        this.log.info('ERROR connecting to: ' + mongoDBUrl + '. ' + err);
      } else {
        this.log.info('Succeeded connected to: ' + mongoDBUrl);
      }
    });
  }
  private reqSerializer(req):any {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers
    };
  }
  public logger(): bunyan.Logger {
    return bunyan.createLogger({
      name: 'MAIN',
      streams: [
        {
          stream: process.stderr,
          level: 'debug',
        },
      ],
      serializers: {
        req: this.reqSerializer
      }
    });
  }
}
// Bootstrap the server
let server = new Server();
let app = server.app;
let log = server.log;
export {app, log };