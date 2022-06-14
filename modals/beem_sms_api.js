const axios = require("axios");
const https = require("https");
var btoa = require("btoa");

const api_key = "5513dd57225fdeb5";
const secret_key = "ZmZhYmQyNDViNWFiYzc2NzgxN2EwZGZhNWZhZmI2NTJlOTQ3NmIxYmRmMGI1ZmEzYzI3MjRlMTk1MmEwMTBmZg==";
const content_type = "application/json";
const source_addr ="INFO";

var send=async(code,address) =>{
  await axios.post(
      "https://apisms.beem.africa/v1/send",
      {source_addr: source_addr, schedule_time: "", encoding: 0, message: `This is your chattycode link \n https://chattycode.com/code/${code}`,recipients: [ { recipient_id: 1, dest_addr: address, } ],},
      {
        headers: { "Content-Type": content_type,  Authorization: "Basic " + btoa(api_key + ":" + secret_key),},
        httpsAgent: new https.Agent({ rejectUnauthorized: false,}),
      }
    )
    .then((response) => {console.log(response.status); })
    .catch((error) => {console.log(error.response.data.code); });
}

module.exports={send}