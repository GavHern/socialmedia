// Register Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js')
}

const pwa = (new URL(window.location.href)).searchParams.get("pwa") !== null;

if(!pwa){
  window.location.href = "install.html"
}

// Gets a cookie from its name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Pull session from local storage (ios pwa support)
if(window.localStorage.getItem("session") != null){
  document.cookie="session="+window.localStorage.getItem("session");
}

// Redirect to login screen if the session cookie is missing
if(getCookie("session") === undefined){
  window.location.href="/login.html#";
}

// Function to make a request (fetch api but creates a dialogue on error)
async function makeRequest(uri, data = {}){

  let requestHeaders = new Headers();
  requestHeaders.append("Authentication",window.localStorage.getItem('session'))
  data.headers = requestHeaders;

  let res = await fetch(uri, data);
  resParsed = await res.json();

  if(!resParsed.success){
    app.methods.dialogue(resParsed.message, false);
  }

  return resParsed;
}


const currentUser = window.localStorage.getItem('session').split('-')[0];
var profileEdited = false;




// App functions
var app = {};