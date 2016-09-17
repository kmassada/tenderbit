import * as express from 'express';
import * as dotenv from "dotenv";
import * as socketIo from "socket.io";
import * as path from "path";
import * as http from "http";

import { mainRouter } from "./routes/router";

class Server {
  public app: any;
  private server: any;
  private io: any;
  private root: string;
  private apiPrefix: string;
  private port: number;
  
  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.server = http.createServer(this.app);
    this.sockets();
    this.listen();
  }
  private config(): void {
    dotenv.config();
    this.port = process.env.PORT || 4500;
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
}
// Bootstrap the server
let server = new Server();
export = server.app;