// Register Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js')
}

// Check if the app is being run as a Progressive Web Application
const pwa = (new URL(window.location.href)).searchParams.get("pwa") !== null;

// Redirect to the install screen if they are viewing with a browser (and not in the PWA)
if(!pwa)
  window.location.href = "install.html"


// Gets a cookie from its name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Pull session from local storage (ios pwa support)
if(window.localStorage.getItem("session") != null)
 document.cookie="session="+window.localStorage.getItem("session");

// Redirect to login screen if the session cookie is missing
if(getCookie("session") === undefined)
  window.location.href="/login.html#";


// Define default settings if they arent set
if(localStorage['system-theme'] === undefined)
  localStorage['system-theme'] = true

if(localStorage['dark'] === undefined)
  localStorage['dark'] = false

if(localStorage['compact'] === undefined)
  localStorage['compact'] = false



// Function to make a request (fetch api but creates a dialogue on error)
async function makeRequest(uri, data = {}){

  // Add authentication data to headers
  let requestHeaders = new Headers();
  requestHeaders.append("Authentication",window.localStorage.getItem('session'))
  data.headers = requestHeaders;

  // Fetch to the uri and parse the response as JSON
  let res = await fetch(uri, data);
  resParsed = await res.json();

  // Display error if the request was unsuccessful
  if(!resParsed.success) app.methods.dialogue(resParsed.message, false);

  // Return the JSON response
  return resParsed;
}


const currentUser = window.localStorage.getItem('session').split('-')[0];
var profileEdited = false;




// App functions
var app = {}; // App functions appended in other files