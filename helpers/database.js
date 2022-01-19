const redis = require('redis');

const client = redis.createClient({ url: 'redis://' + process.env['REDIS_HOST'], password: process.env['REDIS_PASSWD'] });
client.connect();

const getRandomCode = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}

module.exports = { redis: client, getRandomCode };