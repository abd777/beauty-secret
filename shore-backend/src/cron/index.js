var cron = require("node-cron");
const { google } = require("googleapis");
var axios = require("axios");
const shoreAuthService = require("../services/shoreAuthService");
require('dotenv').config({path: './.env'});


//Shore Creds
var shoreKey = "";

//Google Creds & Auth
const credentialFilename = "src/cron/credentials.json";
const scopes = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({
  keyFile: credentialFilename,
  scopes: scopes,
});
const drive = google.drive({ version: "v3", auth });

let files;
let cS;

function main() {
  console.log("Starting Cron");
  cron.schedule("*/5 * * * * *", async () => {
  shoreKey = await shoreAuthService.getShoreKey();
  console.log('cron');
  await getFileNames();
  await getCoustomers();
  console.log(files);
  let cSjS = JSON.parse(cS);
  files.files.forEach(async(file) => {
  console.log(file.name);
  let mail = file.name.split('_');   
    let customer = cSjS.data.filter((c) => {
      return c.attributes.emails[0].value === mail[2];
    });
    if(mail[0] !== 'Done'){
        console.log(file);
        await createCustomerNote(customer[0].id, file.webViewLink);
        await renameFile(file.id, "Done_" + file.name)
    } 
  }); 
})
}

// Google Drive
async function getFileNames() {
  await drive.files
    .get({
      q: "mimeType='application/pdf'",
      fileId: "",
      fields: "files(id,name,webViewLink,kind,parents)",
    })
    .then((res) => {
      files = res.data;
    });
}

async function renameFile(fileId, newName) {
  await drive.files
    .update({ fileId: fileId, resource: { name: newName } })
    .then((res) => console.log(res))
}

// Shore
async function getShoreKey() {
  await axios.post("https://api.shore.com/v2/tokens", {
    grant_type: process.env.SHORE_GANT_TYPE,
    username: process.env.SHOR_USERNAME,
    password: process.env.SHORE_PASSWORD
  }).then((token) => {
    shoreKey = token.data.access_token;
    console.log(token.data);
  }); 
}

async function getCoustomers() {
  await axios({
    url: "https://api.shore.com/v2/customers",
    method: "GET",
    headers: {
      Authorization: `Bearer ${shoreKey}`,
      Accept: "application/vnd.api+json",
    },
  }).then((data) => {
    cS = JSON.stringify(data.data);
  });
}

async function createCustomerNote(id, note) {
  var headers = {
    Authorization: `Bearer ${shoreKey}`,
    Accept: "application/vnd.api+json",
    "Content-type": "application/vnd.api+json",
  };
  var data = JSON.stringify({
    data: {
      type: "customer_notes",
      attributes: {
        content: note,
      },
      relationships: {
        customer: {
          data: {
            id: id,
            type: "customers",
          },
        },
      },
    },
  });
  axios.post("https://api.shore.com/v2/customer_notes", data, {
    headers: headers,
  });
}

module.exports = { main };
