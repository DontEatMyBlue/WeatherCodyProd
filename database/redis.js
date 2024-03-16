const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});
client.connect();


// Redis 클라이언트 에러 처리
client.on('error', (err) => {
    console.log('Redis Client Error', err);
});

const setValue = async(key, TTL, value) => {
    await client.setEx(key,TTL,value);
};

const getValue = async (key) => {
    try {
        const value = await client.get(key);
        return value; // 함수에서 값을 반환하도록 수정
    } catch (err) {
        console.error('Get Error:', err);
    }
};
const keyExists = async (key) => {
  try {
    console.log(key);
    const reply = await client.exists(key);
    if (reply === 1) {
      console.log('Key exists.');
      return true; // 키가 존재한다면 true 반환
    } else {
      console.log('Key does not exist.');
      return false; // 키가 존재하지 않는다면 false 반환
    }
  } catch (err) {
    console.error(err);
    return false; // 에러 발생 시 false 반환
  }
};

module.exports = { setValue, getValue,keyExists };
