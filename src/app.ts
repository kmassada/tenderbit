import * as express from 'express';
import * as dotenv from "dotenv";
import * as socketIo from "socket.io";
import * as path from "path";
import * as http from "http";
import * as mongoose from "mongoose";
import * as bunyan from "bunyan";

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
    // Static Assets
    this.app.use('/assets', express.static(path.resolve(this.root, 'assets')));
    // Api Routing
    this.app.use(this.apiPrefix, mainRouter);
    // Use docs generated from Raml as the api
    staticRouter.get('/', (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(this.root, 'docs/index.html'));
    });
    this.app.use('*', staticRouter);
  }
  private listen(): void {
    this.server.listen(this.port);
    this.server.on("error", error => {
        console.log("ERROR", error);
    });
    this.server.on("listening", () => {
        console.log(`==> Listening on port ${this.port}.
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
  public logger(): bunyan.Logger {
    return bunyan.createLogger({
      name: 'MAIN',
      streams: [
        {
          stream: process.stderr,
          level: 'debug',
        },
      ],
    });
  }
}
// Bootstrap the server
let server = new Server();
export = server.app;