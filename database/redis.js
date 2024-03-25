const redis = require('redis');

const client = redis.createClient({
  url: process.env.AWS_REDIS
});
client.connect();


client.on('error', (err) => {
    console.log('Redis Client Error', err);
});

const setValue = async(key, TTL, value) => {
    await client.setEx(key,TTL,value);
};

const getValue = async (key) => {
    try {
        const value = await client.get(key);
        return value; 
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
      return true; 
    } else {
      console.log('Key does not exist.');
      return false; 
    }
  } catch (err) {
    console.error(err);
    return false; 
  }
};
const deleteKey = async (key) => {
  await client.del(key);
};

const getAllKey = async()=>{
  try{
    const value = await client.keys('*');
    return value;
  }catch(err){
    console.log(err);
  }
}

module.exports = { setValue, getValue,keyExists,deleteKey,getAllKey };
