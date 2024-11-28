// lib/mongodb.js
import {MongoClient} from 'mongodb';


let client;
let clientPromise;

const uri = "mongodb://yourmongodb/delta_force?authSource=admin";
if (process.env.NODE_ENV === 'development') {
    // 开发模式下使用全局变量
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // 生产模式下直接连接
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export default clientPromise;
