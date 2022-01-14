import createAuth0Client from "@auth0/auth0-spa-js";
import { user, isAuthenticated, popUpOpen, token, errorMsg } from "./store";
import config from "./auth-config";

async function createClient() {
  return await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });
}

async function loginWithPopUp(client, options) {
  popUpOpen.set(true);
  try {
    await client.loginWithPopup(options);
    user.set(await client.getUser());
    const accessToken = await client.getIdTokenClaims();
    token.set(accessToken.__raw);
    isAuthenticated.set(true);
    errorMsg.set("");
  } catch (err) {
    errorMsg.set(`Error -> ${err}`);
  } finally {
    popUpOpen.set(false);
  }
}

function logout(client) {
  return client.logout();
}

const auth = {
  createClient,
  loginWithPopup: loginWithPopUp,
  logout,
};

export default auth;
