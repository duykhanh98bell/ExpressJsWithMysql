import redis from "redis";

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})

client.on('connect',function() {
    console.log('Redis connected!');
});

client.on('error',(err) => console.log('Redis Client Error',err));

client.connect();

export default client;

