let shoreToken = "";
var axios = require("axios");
let expiresIn = null;
let validFrom = null;
let refreshToken = null;
module.exports = {
  async getShoreKey() {
    const body =
      refreshToken
        ? {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }
        : {
            grant_type: "password",
            username: "tschanu0@gmail.com",
            password: "jnpassww3",
          };
    await axios.post("https://api.shore.com/v2/tokens", body).then((token) => {
      shoreToken = token.data.access_token;
      expiresIn = token.data.expires_in;
      validFrom = new Date();
    }).catch((error) => {
      console.log(error.message);
    })
    return shoreToken;
  },
};
