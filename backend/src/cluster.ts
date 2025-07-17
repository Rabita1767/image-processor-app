import cluster from "cluster";
import { cpus } from "os";
import {startServer} from "./index";

const numCPUs=cpus().length;
if(cluster.isPrimary){
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    for(let i=0;i<numCPUs;i++)
    {
        cluster.fork();
    }
    cluster.on("exit",(worker,code,signal)=>{
        console.log(`Worker ${worker.process.pid} died`);
        // Fork a new worker
        cluster.fork();
    })
    
}
else{
    startServer();
    console.log(`Worker ${process.pid} started`);
}