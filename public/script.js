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

const app = {
  
  // Api Functions
  api: {
    async getFeed(checkpoint){ // Get Home Feed
      let res = await makeRequest("https://socialmedia.gavhern.com/api/feed.php" + (checkpoint == undefined ? "" : `?checkpoint=${checkpoint}`), {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async like(post, value, isComment){ // Like a post or comment
      if(value){value=1}else{value=0}
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/like.php?value=${value}&comment=${isComment}&post=${post}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async save(post, value){ // Save a post
      if(value){value=1}else{value=0}
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/save.php?value=${value}&post=${post}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async follow(user, value){ // Follow a user
      if(value){value=1}else{value=0}
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/follow.php?value=${value}&account=${user}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async updateProfile(data){ // Update user profile info
      let formdata = new FormData();

      for(const i in data){
        formdata.append(i,data[i])
      }

      let res = await makeRequest(`https://socialmedia.gavhern.com/api/editprofile.php`, {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
      });

      return res;
    },
    async post(data){ // Create a post
      let formdata = new FormData();

      formdata.append("title", data.title);
      formdata.append("type", data.type);
      formdata.append("body", data.body);

      let res = await makeRequest(`https://socialmedia.gavhern.com/api/post.php`, {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
      });

      return res;
    },
    async comment(parent, text){ // Create a comment
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/comment.php?parent=${parent}&body=${text}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async edit(id, isComment, body){ // Delete a post or comment
      if(isComment){isComment=1}else{isComment=0}
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/edit.php?id=${id}&is_comment=${isComment}&body=${body}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async delete(id, isComment){ // Delete a post or comment
      if(isComment){isComment=1}else{isComment=0}
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/delete.php?id=${id}&is_comment=${isComment}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async getPostInformation(id){ // Get the details of a post
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/postinfo.php?post=${id}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async getUser(id){ // Get the info and posts of a user
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/profile.php?user=${id}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async getFollowers(user, feed){ // Get the info and posts of a user
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/followers.php?user=${user}&feed=${feed}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async search(query){ // Search the database
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/search.php?q=${query}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async report(id, isComment, reason, message){ // Report a post or comment
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/report.php?id=${id}&comment=${isComment}&reason=${reason}&message=${message}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async getExplorePage(){ // Get the explore page
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/explore.php`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    },
    async getActivity(){ // Get the activity page
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/activity.php`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    }
  },




  // Various methods
  methods: {
    signOut(){ // Sign the user out of thier account
      window.localStorage.removeItem("session");
      document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); }); // Clear cookies
      window.location.href="/login.html#"; // Redirect to the login screen
    },
    dialogue(msg, success){ // Build a dialogue message
      let elem = app.dom.components.buildDialogue(msg, success);
      $('#dialogue-container').append(elem);

      setTimeout(_=>{
        $(elem).addClass('active');
      },0);

      setTimeout(_=>{
        $(elem).removeClass('active');
      },3000);

      setTimeout(_=>{
        $(elem).remove();
      },3300);
      
    },
    toBase64: file => new Promise((resolve, reject) => {
      const reader = new FileReader(); // Start file reader
      reader.readAsDataURL(file); // Read the file blob as a data url (base64)
      reader.onload = () => resolve(reader.result); // Resolve the promise if successful
      reader.onerror = error => reject(error); // Reject the promise if unsuccessful
    }),
    async submitForm(){ // Submits the post form (to avoid using a form tag)
      if(document.getElementById('file-upload').files.length==0 && $('#post-type div.active').attr('data-post-type') == 'image'){
        app.methods.dialogue('Please provide an image', false);
        return;
      }

      $('.post-form-button.post-form-submit').addClass('loading'); // Set the submit button state to "loading"

      // Grab values
      let postTitle = $('#post-form-title').val(); 
      let postType = $('#post-type div.active').attr('data-post-type');
      let postBody;

      // Get post information based on the type of post
      switch(postType){
        case('text'): // Text post
          postBody = $('#post-form-text-body').val();
          break;
        case('image'): // Image post
          const result = await app.methods.toBase64(document.getElementById('file-upload').files[0]);
          if(result instanceof Error){ // Error catching
            app.methods.dialogue("Malformed file information.", false);
            return;
          }

          postBody = result.split(',')[1]; // Split data url after the comma to remove the mime type
      }

      // Send post request
      const res = await app.api.post({
        title: postTitle,
        type: postType,
        body: postBody
      });

      if(res.success){
        $('#fab').removeClass('active');
        $('.film').removeClass('active');
        app.dom.clearPostForm();
        app.methods.dialogue('Post created successfully!', true);
        app.dom.page.create('post', res.post_id)
      }

      $('.post-form-button.post-form-submit').removeClass('loading');
    },
    homeLayoutSelect(){ // Change the layout of the home screen (normal or compact)
      app.dom.sheet.create('options', {
        "Normal": _=>{
          app.dom.changeHomeLayout(0)
        },
        "Compact": _=>{
          app.dom.changeHomeLayout(1)
        }
      })
    }
  },




  // DOM related methods
  dom: {

    // Components (made with custom element building library (made by me). elembuilder.js)
    components: {
      postElement(data, isInFeed){
        let body;
        if(data.type == "text"){
          body = {
            tag: isInFeed ? "a" : "p", // If the post is in a feed, make the body a link.
            href: "#",
            classes: ["flex-shrink-0","dark:text-gray-300","w-full","px-4","compact:hidden","post-body-text"],
            text: data.body, // Body text
            eventListeners: isInFeed ? { // Adds event listener for posts in a feed
              click: function(e){
                app.dom.page.create('post', data.id);
              }
            } : {}
          }
        } else if(data.type == "image") {
          body = {
            tag: "a",
            classes: ["flex-shrink-0","projector-trigger"],
            href: "#",
            children: [
              {
                tag: "img",
                classes: ["bg-black","w-full","max-h-144","compact:w-32","compact:h-24","object-contain","compact:object-cover","compact:mr-2","compact:rounded-xl"],
                src: "https://socialmedia.gavhern.com/api/cdn.php?f="+data.body, // Body image
                eventListeners: {
                  click: ()=>{app.dom.openProjector("https://socialmedia.gavhern.com/api/cdn.php?f="+data.body)} // Body image
                },
                attributes: {
                  "loading": "lazy"
                }
              }
            ]
          }
        }
      
        return elem.create({
          tag: "div",
          classes: ["bg-white","dark:bg-gray-800","flex","flex-col","mb-4"],
          attributes: { // Add post id and like count as attributes so liking/ saving can update all post element across the app
            'data-post-id': data.id,
            'data-likes': data.likes
          },
          children: [
            {
              tag: "div",
              classes: ["flex-shrink-0","flex","flex-row"],
              children: [
                {
                  tag: 'a',
                  href: '#',
                  eventListeners: {
                    click: _=>{
                      app.dom.page.create('profile', data.author)
                    }
                  },
                  classes: ["flex","flex-row","p-4","w-full"],
                  children: [
                    {
                      tag: "img",
                      attributes: {
                        "data-user-info-profile-picture": data.author
                      },
                      src: (data.profile_picture == "") ? "https://socialmedia.gavhern.com/api/cdn.php?f=default&thumb" : "https://socialmedia.gavhern.com/api/cdn.php?thumb&f="+data.profile_picture, // Author pfp
                      classes: ["w-12","h-12","compact:w-6","compact:h-6","rounded-full","mr-4","compact:mr-3"]
                    },
                    {
                      tag: "div",
                      classes: ["h-12","compact:h-6"],
                      children: [
                        {
                          tag: "p",
                          attributes: {
                            "data-user-info-name": data.author
                          },
                          classes: ["font-semibold", "dark:text-white", "compact:font-normal"],
                          text: data.name // Author's name
                        },
                        {
                          tag: "p",
                          attributes: {
                            "data-user-info-username": data.author
                          },
                          classes: ["text-gray-600", "dark:text-gray-400", "compact:hidden"],
                          text: "@"+data.username // Author's Username
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: 'a',
                  href: '#',
                  classes: ["flex-shrink-0","flex","justify-center","items-center","px-4"],
                  eventListeners: {
                    click: function(){ // 3 dot options menu
                      let optionList = {};

                      if(data.is_author == 1){
                        if(data.type == 'text'){
                          optionList["Edit"] = _=>{app.dom.sheet.create('edit', {
                            id: data.id,
                            isComment: false,
                            text: data.body
                          })}
                        }
                        optionList["Delete"] = _=>{app.dom.sheet.create('confirm', {
                          text: "Are you sure you want to delete this post?",
                          subtext: "This action cannot be undone",
                          color: "bg-red-500",
                          actionText: "Delete Forever",
                          action: async _=>{
                            let res = await app.api.delete(data.id, false);
                            if(res.success){
                              app.methods.dialogue('Post successfully deleted', true);
                              if(!isInFeed){
                                app.dom.page.back();
                              }
                              $(`div[data-post-id=${data.id}]`).remove();
                            }
                          }
                        })}
                      }

                      optionList["Report"] = _=>{
                        app.dom.sheet.create('report', {id:data.id,isComment:0})
                      }

                      optionList["Cancel"] = _=>{}

                      app.dom.sheet.create('options', optionList)
                    }
                  },
                  html: '<svg class="w-6 h-6 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>'
                }
              ]
            },
            {
              tag: 'div',
              classes: ['flex', 'flex-col', 'compact:flex-row', 'compact:justify-between'],
              children:[
                {
                  tag: isInFeed ? "a" : "p",
                  href: "#",
                  classes: ["flex-shrink-0","compact:flex-shrink","compact:w-full","dark:text-gray-200","px-4","text-xl","font-semibold","pb-2"],
                  text: data.title, // Post title
                  eventListeners: isInFeed ? {
                    click: function(e){
                      app.dom.page.create('post', data.id);
                    }
                  } : {}
                },
                body,
              ]
            },
            {
              tag: "div",
              classes: ["flex-shrink-0","flex","justify-between","items-center","dark:text-gray-200"],
              children: [
                {
                  tag: "a",
                  href: "#",
                  classes: ((data.liked==1) ? ["post-action", "like",  "active"] : ["post-action", "like"]),
                  eventListeners: {
                    click: async function(){
                      let likePost = !$(this).hasClass('active');
                      let res = await app.api.like(data.id, likePost, false); // Like the post with the ID
                      
                      if(res.success){ // If request was successful
                        if(likePost){ // Like post
                          $(`div[data-post-id=${data.id}] .like`).addClass('active'); // Find all instances of the post
                          let numLikes = $(`div[data-post-id=${data.id}]`).attr('data-likes'); // Find the attribute 'data-likes'
                          numLikes++; // Increment like number
                          $(`div[data-post-id=${data.id}]`).attr('data-likes', numLikes); // Assign mutated value to the attribute
                          $(`div[data-post-id=${data.id}] .like p`).text(parseInt(numLikes)); // Make the innertext of the like counter reflect the attribute
                        } else { // Unlike post
                          $(`div[data-post-id=${data.id}] .like`).removeClass('active'); // Find all instances of the post
                          let numLikes = $(`div[data-post-id=${data.id}]`).attr('data-likes'); // Find the attribute 'data-likes'
                          numLikes--; // Decrement like number
                          $(`div[data-post-id=${data.id}]`).attr('data-likes', numLikes); // Assign mutated value to the attribute
                          $(`div[data-post-id=${data.id}] .like p`).text(parseInt(numLikes)); // Make the innertext of the like counter reflect the attribute
                        }
                      }
                    }
                  },
                  html: `<svg class="w-4 h-4 mr-1.5" xmlns="http:\/\/www.w3.org\/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg><p>${data.likes}</p>`
                },
                {
                  tag: "a",
                  href: "#",
                  classes: ["post-action", "commment"],
                  eventListeners: {
                    click: isInFeed ? (e) => {
                      app.dom.page.create('post', data.id);
                    } : (e) => {
                      app.dom.sheet.create('comment',{parent:data.id})
                    }
                  },
                  html: '<svg class="w-4 h-4 mr-1.5" xmlns="http:\/\/www.w3.org\/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg><p>Comment</p>'
                },
                {
                  tag: "a",
                  href: "#",
                  classes: ((data.saved==1) ? ["post-action", "save", "active"] : ["post-action", "save"]),
                  eventListeners: {
                    click: async function(){
                      let savePost = !$(this).hasClass('active');
                      let res = await app.api.save(data.id, savePost); // Save the post with the ID
                      if(res.success){ // If request was successful
                        if(savePost){ // Save post
                          $(`div[data-post-id=${data.id}] .save`).addClass('active');
                          $(`div[data-post-id=${data.id}] .save p`).text('Saved');
                          app.methods.dialogue('Post saved!', true);
                        } else { // Unsave post
                          $(`div[data-post-id=${data.id}] .save`).removeClass('active');
                          $(`div[data-post-id=${data.id}] .save p`).text('Save');
                        }
                      }
                    } 
                  },
                  html: `<svg class="w-4 h-4 mr-1.5" xmlns="http:\/\/www.w3.org\/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg><p>${(data.saved == 1) ? "Saved" : "Save"}</p>`
                }
              ]
            }
          ]
        })
      },
      commentElement(data){
        return elem.create({
          tag: 'div',
          classes: ["bg-white","dark:bg-gray-800","dark:text-gray-200","mb-2","px-4","py-2","flex","flex-col"],
          attributes: {
            "data-comment-id": data.id,
            "data-comment-likes": data.likes
          },
          children: [
            {
              tag: 'div',
              classes: ["flex","justify-between","items-center","mt-1"],
              children: [
                {
                  tag: 'a',
                  href: '#',
                  eventListeners:{
                    click: _=> {
                      app.dom.page.create('profile', data.author)
                    }
                  },
                  classes: ["flex", "items-center"],
                  children: [
                    {
                      tag: 'div',
                      classes: ['mr-3'],
                      children: [
                        {
                          tag: 'img',
                          classes: ['h-8','w-8','rounded-full'],
                          src: (data.profile_picture=="") ? `https://socialmedia.gavhern.com/api/cdn.php?thumb&f=default` : `https://socialmedia.gavhern.com/api/cdn.php?thumb&f=${data.profile_picture}`
                        }
                      ]
                    },
                    {
                      tag: 'div',
                      classes: ['font-semibold'],
                      children: [
                        {
                          tag: 'p',
                          text: data.name
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: 'a',
                  href: '#',
                  eventListeners: {
                    "click": _=>{
                      app.dom.sheet.create('options', (data.is_author != 1) ? {
                        "Report": _=>{
                          app.dom.sheet.create('report', {id:data.id,isComment:1})
                        },
                        "Cancel": _=>{}
                      } : {
                        "Edit": _=>{app.dom.sheet.create('edit', {
                          id: data.id,
                          isComment: true,
                          text: data.body
                        })},
                        "Delete": _=>{app.dom.sheet.create('confirm', {
                          text: "Are you sure you want to delete this comment?",
                          subtext: "This action cannot be undone",
                          color: "bg-red-500",
                          actionText: "Delete Forever",
                          action: async _=>{
                            let res = await app.api.delete(data.id, true);
                            if(res.success){
                              app.methods.dialogue('Comment successfully deleted', true);
                              $(`div[data-comment-id=${data.id}]`).remove();
                            }
                          }
                        })},
                        "Report": _=>{
                          app.dom.sheet.create('report', {id:data.id,isComment:1})
                        },
                        "Cancel": _=>{}
                      })
                    }
                  },
                  html: '<svg class="w-6 h-6 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>'
                }
              ]
            },
            {
              tag: 'div',
              classes: ["mt-2","text-gray-800","dark:text-gray-300","comment-body-text"],
              text: data.body
            },
            {
              tag: 'div',
              classes: ["mt-2","text-gray-800","dark:text-gray-300","flex","flex-row-reverse","p-1"],
              children: [
                {
                  tag: 'a',
                  href: '#',
                  classes: (data.liked==1) ? ['flex', 'items-center', 'comment-like', 'active'] : ['flex', 'items-center', 'comment-like'],
                  eventListeners:{
                    click: async function(){
                      let likeComment = !$(this).hasClass('active');
                      let res = await app.api.like(data.id, likeComment, true); // Like the comment with the ID

                      
                      if(res.success){ // If request was successful
                        if(likeComment){ // Like comment
                          $(`div[data-comment-id=${data.id}] .comment-like`).addClass('active'); // Find all instances of the comment
                          let numLikes = $(`div[data-comment-id=${data.id}]`).attr('data-comment-likes'); // Find the attribute 'data-likes'
                          numLikes++; // Increment like number
                          $(`div[data-comment-id=${data.id}]`).attr('data-comment-likes', numLikes); // Assign mutated value to the attribute
                          $(`div[data-comment-id=${data.id}] .comment-like p`).text(parseInt(numLikes)); // Make the innertext of the like counter reflect the attribute
                        } else { // Unlike comment
                          $(`div[data-comment-id=${data.id}] .comment-like`).removeClass('active'); // Find all instances of the comment
                          let numLikes = $(`div[data-comment-id=${data.id}]`).attr('data-comment-likes'); // Find the attribute 'data-likes'
                          numLikes--; // Decrement like number
                          $(`div[data-comment-id=${data.id}]`).attr('data-comment-likes', numLikes); // Assign mutated value to the attribute
                          $(`div[data-comment-id=${data.id}] .comment-like p`).text(parseInt(numLikes)); // Make the innertext of the like counter reflect the attribute
                        }
                      }
                    }
                  },
                  html: `<svg class="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg><p>${data.likes}</p>`
                }
              ]
            }
          ]
        });
      },
      preloader(){
        return elem.create({
          tag: "div",
          classes: ["lds-ellipsis-container"],
          children: [
            {
              tag: "div",
              classes: ["lds-ellipsis"],
              children: [
                {
                  tag: "div"
                },
                {
                  tag: "div"
                },
                {
                  tag: "div"
                },
                {
                  tag: "div"
                }
              ]
            }
          ]
        });
      },
      profilePage(data){
        let posts;

        if(data.posts.length != 0) {
          posts = app.dom.components.postFeed(data.posts,{page:'profile', checkpoint:data.checkpoint, user:data.info.id})
        } else { // Fallback if feed is empty
          posts = elem.create({
            tag: "div",
            classes: ["w-full","flex","justify-center"],
            html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div class="font-semibold text-xl text-gray-400 text-center mb-2">This user has no posts.</div></div>'
          });
        }

        return elem.create({
          tag: 'div',
          children: [
            {
              tag: 'div',
              classes: ["border-b-2","border-gray-200","dark:border-gray-700","pb-4","bg-white","dark:bg-gray-800"],
              children: [
                {
                  tag: 'div',
                  classes: ["flex","flex-col","justify-center","relative","mb-16"],
                  children: [
                    {
                      tag: 'div',
                      attributes: {
                        "data-user-info-banner": data.info.id
                      },
                      classes: ["w-full","h-36","shadow-lg"],
                      children: [
                        (data.info.banner!="") ? {
                          tag: 'img',
                          classes: ["w-full","h-full","object-cover"],
                          src: "https://socialmedia.gavhern.com/api/cdn.php?f=" + data.info.banner
                        } : {
                          tag: 'div',
                          classes: ["w-full","h-full","bg-gradient-to-br","from-red-300","to-purple-300"]
                        }
                      ]
                    },
                    {
                      tag: 'div',
                      classes: ["w-32","h-32","bg-gray-200","border-white","border-4","rounded-full","shadow-2xl","z-10","absolute","-bottom-16","left-1/2","transform","-translate-x-16"],
                      children: [
                        {
                          tag: 'img',
                          attributes: {
                            "data-user-info-profile-picture": data.info.id
                          },
                          classes: ["w-full","h-full","rounded-full"],
                          src: (data.info.profile_picture=="") ? "https://socialmedia.gavhern.com/api/cdn.php?f=default" : "https://socialmedia.gavhern.com/api/cdn.php?f="+data.info.profile_picture
                        }
                      ]
                    },
                    (data.info.is_owner == 1) ? {
                      tag: 'a',
                      href: '#',
                      eventListeners: {
                        click: _=>{
                          app.dom.editProfileModal(data.info)
                        }
                      },
                      classes: ["absolute","top-0","right-0","m-2","w-12","h-12","rounded-full","bg-black","bg-opacity-30","flex","justify-center","items-center","ring-2","ring-white","shadow-xl"],
                      html: '<svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>'
                    } : {
                      tag: 'a',
                      href: '#',
                      attributes:{
                        "data-user-id-follow": data.info.id
                      },
                      eventListeners: {
                        click: async function(){
                          let follow = !$(this).hasClass('active');

                          let res = await app.api.follow(data.info.id, follow);

                          if(res.success){
                            app.dom.updateExploreFollowingList(data.info, follow);

                            if(follow){
                              $(`a[data-user-id-follow=${data.info.id}]`).addClass('active');
                            } else {
                              $(`a[data-user-id-follow=${data.info.id}]`).removeClass('active');
                            }
                          }
                        }
                      },
                      classes: (data.info.is_following == 1) ? ["follow-button", "active"] : ["follow-button"]
                    }
                  ]
                },
                {
                  tag: 'div',
                  classes: ["text-center","pt-3"],
                  children: [
                    {
                      tag: 'h1',
                      attributes: {
                        "data-user-info-name": data.info.id
                      },
                      classes: ["font-semibold","text-3xl","dark:text-white"],
                      text: data.info.name
                    },
                    {
                      tag: 'p',
                      attributes: {
                        "data-user-info-username": data.info.id
                      },
                      classes: ["text-gray-800","dark:text-gray-200","text-xl","pt-1"],
                      text: '@'+data.info.username
                    },
                    {
                      tag: 'p',
                      attributes: {
                        "data-user-info-bio": data.info.id
                      },
                      classes: ["text-gray-600","dark:text-gray-400","text-md","mx-4","pt-1.5"],
                      text: data.info.bio
                    }
                  ]
                },
                {
                  tag: 'div',
                  classes: ["bg-gray-200","dark:bg-gray-900","h-12","mx-2","mt-4","px-1","rounded-xl","shadow-lg","flex","flex-row"],
                  children: [
                    {
                      tag: 'a',
                      href: '#',
                      eventListeners:{
                        click: _=>{
                          app.dom.page.create('follows', {user: data.info.id, feed: 'mutual'})
                        }
                      },
                      classes: ["bg-white","dark:bg-gray-700","dark:text-white","w-full","mx-1","my-1.5","p-2","rounded-lg","justify-center","items-center", "flex"],
                      children: [
                        {
                          tag: 'span',
                          text: "Mutual"
                        },
                        {
                          tag: 'span',
                          classes: ["text-gray-400","pl-2"],
                          text: data.info.mutual
                        }
                      ]
                    },
                    {
                      tag: 'a',
                      href: '#',
                      eventListeners:{
                        click: _=>{
                          app.dom.page.create('follows', {user: data.info.id, feed: 'followers'})
                        }
                      },
                      classes: ["bg-white","dark:bg-gray-700","dark:text-white","w-full","mx-1","my-1.5","p-2","rounded-lg","flex","justify-center","items-center"],
                      children: [
                        {
                          tag: 'span',
                          text: "Followers"
                        },
                        {
                          tag: 'span',
                          classes: ["text-gray-400","pl-2"],
                          text: data.info.followers
                        }
                      ]
                    },
                    {
                      tag: 'a',
                      href: '#',
                      eventListeners:{
                        click: _=>{
                          app.dom.page.create('follows', {user: data.info.id, feed: 'following'})
                        }
                      },
                      classes: ["bg-white","dark:bg-gray-700","dark:text-white","w-full","mx-1","my-1.5","p-2","rounded-lg","flex","justify-center","items-center"],
                      children: [
                        {
                          tag: 'span',
                          text: "Following"
                        },
                        {
                          tag: 'span',
                          classes: ["text-gray-400","pl-2"],
                          text: data.info.following
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              tag: 'div',
              classes: ["bg-gray-100","dark:bg-gray-900","flex","flex-col","mb-4"],
              children: [posts]
            }
          ]
        });
      },
      postFeed(postData, feedInfo){
        let postarray = [];

        for(const i of postData){ // Iterate JSON and append a post element
          postarray.push(app.dom.components.postElement(i, true))
        }


        return elem.create({
          tag: 'div',
          children: [
            {
              tag: 'div',
              classes: ['feed'],
              attributes: {
                "data-checkpoint": feedInfo.checkpoint 
              },
              children: postarray
            },
            {
              tag: 'div',
              classes: ['m-4'],
              children: [
                {
                  tag: 'button',
                  eventListeners: {
                    click: async function(){
                      let postContainer = $(this).parents().eq(1).find('.feed');
                      let preloader = app.dom.components.preloader();
                      $(postContainer).append(preloader);
                      $(this).addClass('hidden');

                      let uri
                      let postObj;
                      let checkpoint = $(postContainer).attr('data-checkpoint');

                      switch(feedInfo.page) {
                        case 'home':
                          uri = `https://socialmedia.gavhern.com/api/feed.php?checkpoint=${checkpoint}`;
                          postObj = 'data';
                          break;
                        case 'saved':
                          uri = `https://socialmedia.gavhern.com/api/savedfeed.php?checkpoint=${checkpoint}`;
                          postObj = 'data';
                          break;
                        case 'profile':
                          uri = `https://socialmedia.gavhern.com/api/savedfeed.php?user=${feedInfo.user}&checkpoint=${checkpoint}`;
                          postObj = 'posts';
                          break;
                      }

                      let nextPage = await makeRequest(uri);

                      $(preloader).remove()

                      for(const i of nextPage[postObj]){ // Iterate JSON and append a post element
                        $(postContainer).append(app.dom.components.postElement(i, true))
                      }

                      if(nextPage[postObj].length >= 25){
                        $(this).removeClass('hidden');
                      }

                    }
                  },
                  classes: ['w-full','text-center','p-2','rounded-xl','dark:text-white','bg-white','dark:bg-gray-900','ring-2','ring-gray-200','dark:ring-gray-700', (postData.length >= 25) ? 'block' : 'hidden'],
                  text: 'Load more'
                }
              ]
            }
          ]
        });
      },
      userCard(data){
        return elem.create({
          tag: 'div',
          attributes: {
            "data-user-card": data.id
          },
          classes: ["flex","items-center","border","border-gray-200","dark:border-gray-700","bg-white","dark:bg-gray-800","rounded","w-full","shadow-md"],
          children: [
            {
              tag: 'a',
              href: '#',
              eventListeners: {
                click: _=>{
                  app.dom.page.create('profile', data.id)
                }
              },
              classes: ['flex', 'flex-grow', 'p-4'],
              children: [
                {
                  tag: 'img',
                  attributes: {
                    "data-user-info-profile-picture": data.id
                  },
                  classes: ["w-12","h-12","rounded-full","mr-3"],
                  src: (data.profile_picture == "") ? "https://socialmedia.gavhern.com/api/cdn.php?f=default&thumb" : "https://socialmedia.gavhern.com/api/cdn.php?thumb&f="+data.profile_picture
                },
                {
                  tag: 'div',
                  classes: ["flex-grow"],
                  children: [
                    {
                      tag: 'h1',
                      attributes: {
                        "data-user-info-name": data.id
                      },
                      classes: ["dark:text-white","font-semibold","truncate"],
                      text: data.name
                    },
                    {
                      tag: 'p',
                      attributes: {
                        "data-user-info-username": data.id
                      },
                      classes: ["text-gray-600","dark:text-gray-400","truncate"],
                      text: '@'+data.username
                    }
                  ]
                }
              ]
            },
            {
              tag: 'a',
              href: '#',
              classes: ["p-4","user-card-follow"].concat((data.is_following == 1) ? ["active"] : []),
              eventListeners: {
                click: async function(){
                  let follow = !$(this).hasClass('active')
                  if(follow){
                    let res = await app.api.follow(data.id, true);
                        
                    if(res.success) {
                      app.dom.updateExploreFollowingList(data, follow);
                      $(this).addClass('active');
                    }
                  } else {
                    app.dom.sheet.create('confirm', {
                      text: `Are you sure you want to unfollow ${data.name}?`,
                      subtext: "",
                      color: "bg-red-500",
                      actionText: "Unfollow",
                      action: async _=>{
                        let res = await app.api.follow(data.id, false);
                        
                        if(res.success) {
                          app.dom.updateExploreFollowingList(data, follow);
                          $(this).removeClass('active');
                        }
                      }
                    })
                  }
                }
              },
              html: '<svg class="text-gray-700 dark:text-gray-300 w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>'
            }
          ]
        });
      },
      userShelfCard(data){
        return elem.create({
          tag: 'a',
          attributes: {
            "data-recent-card": data.id
          },
          href: '#',
          eventListeners: {
            click: _=> {
              app.dom.page.create('profile', data.id)
            }
          },
          classes: ["flex-none","border","border-gray-200","dark:border-gray-700","bg-white","dark:bg-gray-800","rounded","p-4","w-48"],
          children: [
            {
              tag: 'img',
              src: (data.profile_picture=="") ? `https://socialmedia.gavhern.com/api/cdn.php?thumb&f=default` : `https://socialmedia.gavhern.com/api/cdn.php?thumb&f=${data.profile_picture}`,
              classes: ["w-12","h-12","rounded-full","mb-2"]
            },
            {
              tag: 'h1',
              classes: ["dark:text-white","font-semibold","truncate"],
              text: data.name
            },
            {
              tag: 'h1',
              classes: ["text-gray-600","dark:text-gray-400","truncate"],
              text: '@' + data.username
            }
          ]
        });
      },
      explorePage(data){
        let recentlyViewed = [];
        let userCards = [];

        if(data.following.length != 0){
          for(const i of data.following){
            userCards.push(app.dom.components.userCard(i));
          }
        } else {
          userCards.push({
            tag: "div",
            classes: ["w-full","flex","justify-center"],
            html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div><div class="font-semibold text-xl text-gray-400 dark:text-gray-600 text-center mb-2">You are not following anyone.</div></div>'
          });
        }

        for(const i of data.recent){
          recentlyViewed.push(app.dom.components.userShelfCard(i));
        }

        return elem.create({
          tag: 'div',
          children: [
            {
              tag: 'div',
              classes: ["h-12","m-4","rounded","ring-2","ring-gray-300","dark:ring-gray-700"],
              children: [
                {
                  tag: 'form',
                  eventListeners: {
                    submit: function(e){
                      e.preventDefault(); // Prevent default form submit (to keep the page from refreshing)
                      let input = $(this).find('input');
                      let value = $(input).val();

                      if(value.length != 0){ // Only create the page if the input field has a value (isn't empty)
                        app.dom.page.create('search', value);
                        $(input).val(''); // Empty the field
                        $(input).blur(); // Unfocus element to make sure on-screen keyboards are hidden
                      }
                    }
                  },
                  children: [
                    {
                      tag: 'input',
                      classes: ["w-full","h-full","bg-none","rounded","outline-none","bg-gray-100","dark:bg-gray-900","focus:bg-white","dark:focus:bg-gray-800","dark:text-white","px-4","transition"],
                      attributes: {
                        type: "search",
                        placeholder: "Search..."
                      }
                    }, 
                    { // Submit button for screen readers
                      tag: 'input',
                      classes: ["sr-only"],
                      attributes: {
                        type: "submit",
                        value: "Search"
                      }
                    }
                  ]
                }
              ]
            },
            {
              tag: 'div',
              classes: ["my-6"].concat((data.recent.length == 0) ? ['hidden'] : []),
              children: [
                {
                  tag: 'h1',
                  classes: ["mx-4","font-semibold","text-xl","dark:text-white"],
                  text: "Recently Viewed"
                },
                {
                  tag: 'div',
                  classes: ["mt-2","mb-4","px-4","overflow-auto","user-shelf-container"],
                  children: [
                    {
                      tag: 'div',
                      classes: ["w-min","inline-block"],
                      children: [
                        {
                          tag: 'div',
                          classes: ["flex","flex-row","space-x-2","w-min","recently-viewed-shelf"],
                          children: recentlyViewed
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              tag: 'div',
              classes: ["mx-4","my-6"],
              children: [
                {
                  tag: 'h1',
                  classes: ["font-semibold","text-xl","dark:text-white"],
                  text: "Following"
                },
                {
                  tag: 'div',
                  attributes: {
                    "data-following": JSON.stringify(data.following)
                  },
                  classes: ["flex","flex-col","space-y-2","mt-2","mb-4","explore-following-list"],
                  children: userCards
                }
              ]
            }
          ]
        });
      },
      activityItems(data){
        let items = [];
        
        for(const i of data){
          let icon;
          let messageSuffix;
          let action;

          switch(i.type){
            case 'post_like':
              icon = `<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
              messageSuffix = "liked your post.";
              action = _=>{
                app.dom.page.create('post', i.link);
              };
              break;
            case 'comment_like':
              icon = `<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
              messageSuffix = "liked your comment.";
              action = _=>{
                app.dom.page.create('post', i.link);
              };
              break;
            case 'follow':
              icon = `<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>`;
              messageSuffix = "followed you.";
              action = _=>{
                app.dom.page.create('profile', i.link);
              };
              break;
            case 'comment':
              icon = `<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>`;
              messageSuffix = "commented on your post.";
              action = _=>{
                app.dom.page.create('post', i.link);
              };
              break;
          }

          items.push({
            tag: 'a',
            href: '#',
            eventListeners: {
              click: action
            },
            classes: ["bg-white","dark:bg-gray-800","p-3","flex"],
            children: [
              {
                tag: 'div',
                classes: ['mr-4'],
                html: icon
              },
              {
                tag: 'div',
                classes: ["flex-grow","w-full","dark:text-gray-200"],
                children: [
                  {
                    tag: 'div',
                    children: [
                      {
                        tag: 'span',
                        classes: ["font-semibold","mr-0.5"],
                        text: i.data
                      },
                      {
                        tag: 'span',
                        text: messageSuffix
                      },
                      {
                        tag: 'p',
                        classes: ["text-gray-600","dark:text-gray-400","mt-2", (i.meta.length == 0) ? 'hidden' : 'block'],
                        text: i.meta 
                      }
                    ]
                  }
                ]
              },
              {
                tag: 'div',
                classes: ["flex","justify-center","items-center"],
                html: `<svg class="w-4 h-4 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`
              }
            ]
          });
        }

        return {
          tag: 'div',
          classes: ["bg-gray-200","dark:bg-gray-700","flex","flex-col","space-y-0.5","rounded-xl","w-full","shadow-md","mt-4","overflow-hidden"],
          children: items
        }
      },
      activityPage(data){
        let elements = [];

        if(data.data.day.length==0 && data.data.week.length==0 && data.data.all.length==0){
          console.log("test");
          elements.push({
            tag: "div",
            classes: ["w-full","flex","justify-center"],
            html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg></div><div class="font-semibold text-xl text-gray-400 text-center mb-2">You have no notifications.</div></div>'
          })
        } else {
          for(const i in data.data){
            let heading;
  
            switch(i){
              case 'day':
                heading = 'Today';
                break;
              case 'week':
                heading = 'This Week';
                break;
              case 'all':
                heading = 'All Activity';
                break;
            }
  
            if(data.data[i].length != 0){
              elements.push({
                tag: 'div',
                classes: ["mb-6"],
                children: [
                  {
                    tag: 'h1',
                    classes: ["font-semibold","text-2xl","dark:text-white"],
                    text: heading
                  },
                  app.dom.components.activityItems(data.data[i])
                ]
              })
            }
          }
        }

        return elem.create({
          tag: 'div',
          classes: ["my-3","mx-4"],
          children: elements
        });
      },
      buildDialogue(msg, success){
        return elem.create({
          tag: "div",
          classes: ["dialogue"],
          children: [
            {
              tag: "div",
              classes: ["mr-2","p-1",success?"bg-green-500":"bg-yellow-500","bg-opacity-30",success?"text-green-200":"text-yellow-200","rounded-full"],
              html: success ?
              '<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>'
              :'<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
            },
            {
              tag: "div",
              classes: ["mx-1"],
              text: msg
            }
          ]
        });
      }
    },

    sidenav(state){
      if(state){
        $('.sidenav').addClass('active');
        $('.film').addClass('active');
        $('#fab').addClass('scale-0');
      } else {
        $('.sidenav').removeClass('active');
        $('#fab').removeClass('active');
        $('#fab').removeClass('scale-0');
        $('.film').removeClass('active');
      }
    },

    changeHomeLayout(layout){
      switch(layout) {
        case 0:
          $('#home-feed').removeClass('compact');
          $('.home-layout').addClass('hidden');
          $('.home-layout.layout-normal').removeClass('hidden');
          break;
        case 1:
          $('#home-feed').addClass('compact');
          $('.home-layout').addClass('hidden');
          $('.home-layout.layout-compact').removeClass('hidden');
          break;
      }
    },

    updateExploreFollowingList(user, value){
      let list = $('.explore-following-list');
      let data = JSON.parse(list.attr('data-following'));

      if(!value){
        list.find(`div[data-user-card=${user.id}]`).remove();
        data = data.filter(function(el){return el.id != user.id;});
        list.attr('data-following', JSON.stringify(data));
      } else {
        list.html('');

        user.is_following = 1;

        data.push(user);
  
        for(const i of data.sort(function(a, b){
          if(a.username < b.username) { return -1; }
          if(a.username > b.username) { return 1; }
          return 0;
        })){
          list.append(app.dom.components.userCard(i));
        }

        list.attr('data-following', JSON.stringify(data));
      }

    },

    async loadHomeFeed(){
      $('#home-feed').html(app.dom.components.preloader()); // Append preloader

      const feedData = await app.api.getFeed(); // Request feed from server

      $('#home-feed').html(''); // Clear container (to remove preloader)
      
      // Check if feed is empty
      if(feedData.data.length != 0) {
        $('#home-feed').append(app.dom.components.postFeed(feedData.data, {page:'home',checkpoint:feedData.checkpoint}))
      } else { // Fallback if feed is empty
        $('#home-feed').append(elem.create({
          tag: "div",
          classes: ["w-full","flex","justify-center"],
          html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div class="font-semibold text-xl text-gray-400 text-center mb-2">Feeling a bit empty.</div><div class="font-normal text-md text-gray-400 text-center">Follow some people to start your adventure!</div></div>'
        }));
      }
    },

    openProjector(img){
      $('#projector-img').attr('src',img); // Set source of projector image
      $('#projector').addClass('active'); // Activate the projector overlay
      $('#fab').addClass('scale-0'); // hide post FAB
    },

    clearPostForm(){
      $('#post-form-title').val(''); // Clear title field
      $('#post-type div').removeClass('active'); // Deactivate all post type buttons
      $('.post-body').removeClass('active'); // Deactivate all post body panels
      $('#post-type div[data-post-type="text"]').addClass('active'); // Activate text post type button
      $('#post-body-text').addClass('active'); // Activate text body panel
      $('#post-form-text-body').val(''); // Clear text body field
      $('#file-upload').val(''); // Clear image upload field

      // Clear image upload background
      $('#image-upload-preview').attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=');
    },

    editProfileModal(data){
      let info; 
      if(!profileEdited){
        $('.edit-profile-modal').attr('data-user', JSON.stringify(data));
        info = data;
      } else {
        info = JSON.parse($('.edit-profile-modal').attr('data-user'));
      }


      let elems = {
        banner: $('.edit-profile-modal-container .edit-profile-banner'),
        profilePicture: $('.edit-profile-modal-container .edit-profile-profile-picture'),
        name: $('.edit-profile-modal-container .edit-profile-name'),
        username: $('.edit-profile-modal-container .edit-profile-username'),
        bio: $('.edit-profile-modal-container .edit-profile-bio')
      }

      if(data.banner != ""){
        $(elems.banner).attr('src', "https://socialmedia.gavhern.com/api/cdn.php?f="+info.banner);
        $(elems.banner).removeClass('hidden');
      }

      if(data.profile_picture != ""){
        $(elems.profilePicture).attr('src', "https://socialmedia.gavhern.com/api/cdn.php?f="+info.profile_picture);
      } else {
        $(elems.profilePicture).attr('src', "https://socialmedia.gavhern.com/api/cdn.php?f=default&thumb");
      }

      $(elems.name).val(info.name);
      $(elems.username).val(info.username);
      $(elems.bio).text(info.bio);

      $('.edit-profile-modal-container').addClass('active');

    },

    async submitProfileEdit(){
      let oldData = JSON.parse($('.edit-profile-modal').attr('data-user'));

      $('.edit-profile-modal .edit-profile-submit .label').addClass('hidden');
      $('.edit-profile-modal .edit-profile-submit .loader').removeClass('hidden');
      $('.edit-profile-modal .edit-profile-submit .loader').addClass('flex');

      let values = {
        banner: document.getElementById('banner-upload').files[0],
        profile_picture: document.getElementById('profile-picture-upload').files[0],
        name: $('.edit-profile-modal-container .edit-profile-name').val(),
        username: $('.edit-profile-modal-container .edit-profile-username').val(),
        bio: $('.edit-profile-modal-container .edit-profile-bio').val()
      }

      let valuesUpdated = {}; // Only send changed values
      let altered = {
        banner: [values.banner != undefined,'image'],
        profile_picture: [values.profile_picture != undefined,'image'],
        name: [values.name != oldData.name,'text'],
        username: [values.username != oldData.username,'text'],
        bio: [values.bio != oldData.bio,'text']
      };

      for(const i in altered){ // Loop through conditions
        if(altered[i][0]){ // Check if the value was changed

          if(altered[i][1]=='text') // Case for text alterations
            valuesUpdated[i] = values[i];
          else if(altered[i][1]=='image') // Case for image alterations
            valuesUpdated[i] = (await app.methods.toBase64(values[i])).split(',')[1];
            
        }
      }


      let res = await app.api.updateProfile(valuesUpdated);


      if(res.success){
        app.dom.closeProfileEdit();
        app.methods.dialogue('Profile updated successfully!', true);

        if(altered.banner[0]){           oldData['banner'] = res.info['banner'];                   $(`*[data-user-info-banner="${currentUser}"]`).html(`<img class="w-full h-full object-cover" src="https://socialmedia.gavhern.com/api/cdn.php?f=${res.info.banner}">`)};
        if(altered.profile_picture[0]){  oldData['profile_picture'] = res.info['profile_picture']; $(`*[data-user-info-profile-picture="${currentUser}"]`).html('src', 'https://socialmedia.gavhern.com/api/cdn.php?thumb&f='+res.info['profile_picture'])};
        if(altered.name[0]){             oldData['name'] = res.info['name'];                       $(`*[data-user-info-name="${currentUser}"]`).text(res.info['name'])};
        if(altered.username[0]){         oldData['username'] = res.info['username'];               $(`*[data-user-info-username="${currentUser}"]`).text('@'+res.info['username'])};
        if(altered.bio[0]){              oldData['bio'] = res.info['bio'];                         $(`*[data-user-info-bio="${currentUser}"]`).text(res.info['bio'])};

        $('.edit-profile-modal').attr('data-user', JSON.stringify(oldData));
        profileEdited = true;
      } else {
        $('.edit-profile-modal .edit-profile-submit .label').removeClass('hidden');
        $('.edit-profile-modal .edit-profile-submit .loader').addClass('hidden');
        $('.edit-profile-modal .edit-profile-submit .loader').removeClass('flex');
      }
    },

    closeProfileEdit(){
      let elems = {
        banner: $('.edit-profile-modal-container .edit-profile-banner'),
        profilePicture: $('.edit-profile-modal-container .edit-profile-profile-picture'),
        name: $('.edit-profile-modal-container .edit-profile-name'),
        username: $('.edit-profile-modal-container .edit-profile-username'),
        bio: $('.edit-profile-modal-container .edit-profile-bio')
      }

      $('.edit-profile-modal-container').removeClass('active');
      $(elems.banner).addClass('hidden')
      $(elems.name).val('');
      $(elems.username).val('');
      $(elems.bio).text('');

      $('.edit-profile-modal .edit-profile-submit .label').removeClass('hidden');
      $('.edit-profile-modal .edit-profile-submit .loader').addClass('hidden');
      $('.edit-profile-modal .edit-profile-submit .loader').removeClass('flex');
    },

    // Sheet modals
    sheet: {
      templates: {
        confirm(data){
          return [
            {
              tag: 'div',
              classes: ["mx-4"],
              children: [
                {
                  tag: 'h1',
                  classes: ["text-2xl","font-semibold","my-1"],
                  text: data.text
                },
                {
                  tag: 'p',
                  text: data.subtext
                },
                {
                  tag: 'div',
                  classes: ["flex","space-x-2","mt-6","mb-4"],
                  children: [
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","ring-2","ring-gray-200","dark:ring-gray-700","ring-inset"],
                      text: "Cancel",
                      eventListeners:{
                        click: function(){ // Close the sheet
                          $(this).parents().eq(4).removeClass('active');

                          setTimeout(_=>{
                            $(this).parents().eq(4).remove();
                          },300)
                        }
                      }
                    },
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl",data.color,"text-white"],
                      text: data.actionText,
                      eventListeners: {
                        click: function(){ // Close the sheet and perform the action
                          data.action();

                          $(this).parents().eq(4).removeClass('active');

                          setTimeout(_=>{
                            $(this).parents().eq(4).remove();
                          },300)
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },

        options(data){
          opt = [];

          for(const i in data){
            opt.push({
              tag: 'a',
              href: '#',
              classes: ["py-4","px-6","w-full","block"],
              text: i,
              eventListeners: {
                click: function(){
                  data[i]();

                  $(this).parents().eq(2).removeClass('active');

                  setTimeout(_=>{
                    $(this).parents().eq(2).remove();
                  },300)
                }
              }
            });
          }

          return opt;
        },

        report(data){
          return [
            {
              tag: 'div',
              classes: ["mx-4"],
              children: [
                {
                  tag: 'h1',
                  classes: ["text-2xl","font-semibold","my-1"],
                  text: "Report Post"
                },
                {
                  tag: 'div',
                  classes: ["relative"],
                  children: [
                    {
                      tag: 'select',
                      classes: ["w-full","bg-gray-100","dark:bg-gray-700","rounded-xl","p-3","my-2","appearance-none"],
                      children: [
                        {
                          tag: 'option',
                          attributes: {
                            value: ''
                          },
                          html: '---'
                        },
                        {
                          tag: 'option',
                          attributes: {
                            value: 'inappropriate'
                          },
                          html: 'Innapropriate content'
                        },
                        {
                          tag: 'option',
                          attributes: {
                            value: 'hate'
                          },
                          html: 'Hateful or abusive content'
                        },
                        {
                          tag: 'option',
                          attributes: {
                            value: 'spam'
                          },
                          html: 'Spam or unwanted content'
                        },
                        {
                          tag: 'option',
                          attributes: {
                            value: 'impersonation'
                          },
                          html: 'Impersonation'
                        },
                        {
                          tag: 'option',
                          attributes: {
                            value: 'other'
                          },
                          html: 'Other'
                        }
                      ]
                    },
                    {
                      tag: 'div',
                      classes: ["absolute","right-0","top-0","h-full","flex","items-center","px-4"],
                      html: '<svg class="h-4 w-4 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>'
                    }
                  ]
                },
                {
                  tag: 'textarea',
                  classes: ['w-full','h-36','bg-white','dark:bg-gray-800','border-2','border-gray-200','dark:border-gray-700','rounded-xl','focus:border-green-400','dark:focus:border-green-400','rounded-xl','focus:border-green-400','outline-none','px-3','py-2','transition'],
                  attributes:{
                    'placeholder': 'Describe your issue...'
                  }
                },
                {
                  tag: 'div',
                  classes: ["flex","space-x-2","mt-6","mb-4"],
                  children: [
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","ring-2","ring-gray-200","dark:ring-gray-700","ring-inset"],
                      text: "Cancel",
                      eventListeners:{
                        click: function(){ // Close the sheet
                          $(this).parents().eq(4).removeClass('active');

                          setTimeout(_=>{
                            $(this).parents().eq(4).remove();
                          },300)
                        }
                      }
                    },
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","bg-red-500","text-white"],
                      text: "Report",
                      eventListeners: {
                        click: async function(){ // Close the sheet and perform the action
                          let reason = $(this).parents().eq(1).find('select').val();
                          let message = $(this).parents().eq(1).find('textarea').val();

                          let res = await app.api.report(data.id,data.isComment,reason,message);

                          if(res.success){
                            app.methods.dialogue('Report successful. Thanks for your feedback.', true);

                            $(this).parents().eq(4).removeClass('active');
  
                            setTimeout(_=>{
                              $(this).parents().eq(4).remove();
                            },300)
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },

        comment(data){
          return [
            {
              tag: 'div',
              classes: ["mx-4"],
              children: [
                {
                  tag: 'h1',
                  classes: ["text-2xl","font-semibold","my-1"],
                  text: "Comment"
                },
                {
                  tag: 'textarea',
                  classes: ['w-full','h-36','bg-white','dark:bg-gray-800','border-2','border-gray-200','dark:border-gray-700','rounded-xl','focus:border-green-400','dark:focus:border-green-400','rounded-xl','focus:border-green-400','outline-none','px-3','py-2','mt-2','transition'],
                  attributes:{
                    'placeholder': 'Your comment...'
                  }
                },
                {
                  tag: 'div',
                  classes: ["flex","space-x-2","mt-6","mb-4"],
                  children: [
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","ring-2","ring-gray-200","dark:ring-gray-700","ring-inset"],
                      text: "Cancel",
                      eventListeners:{
                        click: function(){ // Close the sheet
                          $(this).parents().eq(4).removeClass('active');

                          setTimeout(_=>{
                            $(this).parents().eq(4).remove();
                          },300)
                        }
                      }
                    },
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","bg-green-400","text-white"],
                      text: "Post",
                      eventListeners: {
                        click: async function(){ // Close the sheet and perform the action
                          let text = $(this).parents().eq(1).find('textarea').val();

                          let res = await app.api.comment(data.parent,encodeURIComponent(text));

                          if(res.success){

                            app.methods.dialogue('Comment created!', true);

                            app.dom.page.back();
                            app.dom.page.create('post', data.parent);

                            $(this).parents().eq(4).removeClass('active');
  
                            setTimeout(_=>{
                              $(this).parents().eq(4).remove();
                            },300)
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },

        edit(data){
          return [
            {
              tag: 'div',
              classes: ["mx-4"],
              children: [
                {
                  tag: 'h1',
                  classes: ["text-2xl","font-semibold","my-1"],
                  text: "Edit"
                },
                {
                  tag: 'textarea',
                  classes: ['w-full','h-36','bg-white','dark:bg-gray-800','border-2','border-gray-200','dark:border-gray-700','rounded-xl','focus:border-green-400','dark:focus:border-green-400','outline-none','px-3','py-2','mt-2','transition'],
                  attributes:{
                    'placeholder': 'New text...'
                  },
                  text: data.text
                },
                {
                  tag: 'div',
                  classes: ["flex","space-x-2","mt-6","mb-4"],
                  children: [
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","ring-2","ring-gray-200","dark:ring-gray-700","ring-inset"],
                      text: "Cancel",
                      eventListeners:{
                        click: function(){ // Close the sheet
                          $(this).parents().eq(4).removeClass('active');

                          setTimeout(_=>{
                            $(this).parents().eq(4).remove();
                          },300)
                        }
                      }
                    },
                    {
                      tag: 'button',
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","bg-green-400","text-white"],
                      text: "Edit",
                      eventListeners: {
                        click: async function(){ // Close the sheet and perform the action
                          let text = $(this).parents().eq(1).find('textarea').val();

                          let res = await app.api.edit(data.id,data.isComment,encodeURIComponent(text));

                          if(res.success){

                            app.methods.dialogue(((data.isComment) ? 'Comment' : 'Post') + ' was successfully edited!', true);

                            if(!data.isComment){
                              $(`div[data-post-id=${data.id}] .post-body-text`).text(text);
                            } else {
                              $(`div[data-comment-id=${data.id}] .comment-body-text`).text(text);
                            }

                            $(this).parents().eq(4).removeClass('active');
  
                            setTimeout(_=>{
                              $(this).parents().eq(4).remove();
                            },300)
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }

      },
      create(sheet, data){
        let element = elem.create({
          tag: 'div',
          classes: ["z-60", "absolute", "w-full", "h-full", "left-0", "top-0", "action-sheet-container"],
          children: [
            {
              tag: 'div',
              classes: ["action-sheet-film"],
              eventListeners: {
                click: function(){
                  $(this).parent().removeClass('active');

                  setTimeout(_=>{
                    $(this).parent().remove();
                  },300)
                }
              }
            },
            {
              tag: 'div',
              classes: ["action-sheet"],
              children: [
                {
                  tag: 'div',
                  classes: ["flex","justify-center","w-full","pt-4","pb-1"],
                  children: [
                    {
                      tag: 'div',
                      classes: ["h-1","w-16","bg-gray-300","dark:bg-gray-700","rounded-full"]
                    }
                  ]
                },
                {
                  tag: 'div',
                  classes: ["pb-2"],
                  children: app.dom.sheet.templates[sheet](data)
                }
              ]
            }
          ]
        })

        $("body").append(element);

        setTimeout(_=>{
          $(element).addClass('active');
        },10)
      }
    },


    // Page element system
    page: {
      templates: {
        "blank": {
          domElement(data){
            return elem.create(data);
          }
        },
        "post": {
          uri(id){return `https://socialmedia.gavhern.com/api/postinfo.php?post=${id}`},
          domElement(data){
            let commentArray=[];

            if(data.comments.length < 1){
              commentArray.push({
                tag: 'div',
                html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg></div><div class="font-semibold text-xl text-gray-400 dark:text-gray-600 text-center mb-2">This post has no comments</div></div>'
              })
            } else {
              for(const i of data.comments){
                commentArray.push(app.dom.components.commentElement(i))
              }
            }

            return elem.create({
              tag: 'div',
              classes: ['flex', 'flex-col'],
              children: [
                app.dom.components.postElement(data.data, false),
                {
                  tag: 'div',
                  classes: ["pb-4", "px-4"],
                  children: [
                    {
                      tag: 'a',
                      href: '#',
                      eventListeners: {
                        click: _=>{
                          app.dom.sheet.create('comment',{parent:data.data.id});
                        }
                      },
                      classes: ["flex","items-center","bg-white","dark:bg-gray-700","text-gray-400","h-10","w-full","rounded-xl","px-4"],
                      text: "Write comment..."
                    }
                  ]
                },
                {
                  tag: 'div',
                  children: [
                    {
                      tag: 'div',
                      attributes: {
                        "data-comment-feed": data.checkpoint
                      },
                      classes: ['comment-feed'],
                      children: commentArray
                    },
                    {
                      tag: 'div',
                      classes: ["m-4"],
                      children: [
                        {
                          tag: "button",
                          eventListeners: {
                            click: async function(){
                              let res = await makeRequest(`https://socialmedia.gavhern.com/api/postinfo.php?post=${data.data.id}&checkpoint=${data.checkpoint}`);
                              let commentContainer = $(this).parents().eq(1).find('.comment-feed');

                              for(const i of res.comments){
                                $(commentContainer).append(app.dom.components.commentElement(i))
                              }

                              $(commentContainer).attr('data-comment-feed',res.checkpoint);

                              if(res.comments.length < 25){
                                $(this).addClass('hidden')
                              }
                            }
                          },
                          classes: ["w-full","text-center","p-2","rounded-xl","dark:text-white","bg-white","dark:bg-gray-900","ring-2","ring-gray-200","dark:ring-gray-700", (data.comments.length >= 25) ? "block" : "hidden"],
                          text: 'Load more'
                        }
                      ]
                    }
                  ]
                }
              ]
            })
          }
        },
        "profile": {
          uri(user){return `https://socialmedia.gavhern.com/api/profile.php?user=${user}`},
          domElement(data){
            $(`.recently-viewed-shelf a[data-recent-card=${data.info.id}]`).remove();
            $(`.recently-viewed-shelf`).prepend(app.dom.components.userShelfCard(data.info));
            $('.user-shelf-container').scrollLeft(0);

            return app.dom.components.profilePage(data);
          }
        },
        "follows": {
          uri(data){return `https://socialmedia.gavhern.com/api/followers.php?user=${data.user}&feed=${data.feed}`},
          domElement(data){
            let userCards=[];

            if(data.data.length != 0 && data.data != null){
              for(const i of data.data){
                userCards.push(app.dom.components.userCard(i))
              }
            } else {
              userCards = [
                {
                  tag: "div",
                  classes: ["w-full","flex","justify-center"],
                  html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div class="font-semibold text-xl text-gray-400 dark:text-gray-500 text-center mb-2">Feels a bit empty here</div></div>'
                }
              ]
            }


            return elem.create({
              tag: 'div',
              classes: ["p-4"],
              children: [
                {
                  tag: 'h1',
                  classes: ["text-xl","font-semibold","dark:text-white","mb-4"],
                  text: data.feed.charAt(0).toUpperCase() + data.feed.slice(1)
                },
                {
                  tag: 'div',
                  classes: ["flex","flex-col","space-y-2","mt-2","mb-4"],
                  children: userCards
                }
              ]
            });
          }
        },
        "saved": {
          uri(data){return `https://socialmedia.gavhern.com/api/savedfeed.php`},
          domElement(data){
            let postArray=[];

            postArray.push(app.dom.components.postFeed(data.data, {page:'saved', checkpoint: data.checkpoint}));

            return elem.create({
              tag: 'div',
              children: [
                {
                  tag: 'h1',
                  classes: ["text-xl","font-semibold","p-4","dark:text-white"],
                  text: "Saved Posts"
                },
                {
                  tag: 'div',
                  children: postArray
                }
              ]
            });
          }
        },
        "search": {
          uri(data){return `https://socialmedia.gavhern.com/api/search.php?q=${data}`},
          domElement(data){
            let userCards = [];

            for(const i of data.users){
              userCards.push(app.dom.components.userCard(i));
            }

            return elem.create({
              tag: 'div',
              children: [
                {
                  tag: 'div',
                  children: [
                    {
                      tag: 'h1',
                      classes: ["text-xl","font-semibold","p-4","dark:text-white"],
                      text: `Results for "${data.query}"`
                    },
                    {
                      tag: 'div',
                      classes: ["flex","flex-col","space-y-2","mb-4","p-4","pt-0"],
                      children: userCards
                    }
                  ]
                },
              ]
            });
          }
        },
        "settings": {
          domElement(data){
            return elem.create({
              tag: 'div',
              classes: ["m-4"],
              children: [
                {
                  tag: 'h1',
                  classes: ["font-semibold","text-2xl"],
                  text: "Settings"
                },
                {
                  tag: "div",
                  classes: ["bg-gray-200","dark:bg-gray-700","flex","flex-col","space-y-0.5","rounded-xl","w-full","shadow-md","mt-4","overflow-hidden"],
                  children: [
                    {
                      tag: 'a',
                      href: '#',
                      classes: ["bg-white","dark:bg-gray-800","p-3","flex"],
                      children: [
                        {
                          tag: 'div',
                          classes: ['mr-4'],
                          html: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
                        },
                        {
                          tag: 'div',
                          classes: ["flex-grow","w-full","dark:text-gray-200"],
                          children: [
                            {
                              tag: 'div',
                              children: [
                                {
                                  tag: 'span',
                                  classes: ["font-semibold","mr-0.5"],
                                  text: "Account"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          tag: 'div',
                          classes: ["flex","justify-center","items-center"],
                          html: `<svg class="w-4 h-4 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`
                        }
                      ]
                    },
                    {
                      tag: 'a',
                      href: '#',
                      classes: ["bg-white","dark:bg-gray-800","p-3","flex"],
                      children: [
                        {
                          tag: 'div',
                          classes: ['mr-4'],
                          html: '<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
                        },
                        {
                          tag: 'div',
                          classes: ["flex-grow","w-full","dark:text-gray-200"],
                          children: [
                            {
                              tag: 'div',
                              children: [
                                {
                                  tag: 'span',
                                  classes: ["font-semibold","mr-0.5"],
                                  text: "Appearance"
                                }
                              ]
                            }
                          ]
                        },
                        {
                          tag: 'div',
                          classes: ["flex","justify-center","items-center"],
                          html: `<svg class="w-4 h-4 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`
                        }
                      ]
                    }
                  ]
                }
              ]
            });
          }
        }
      },


      // Creates a page and adds it to the dom
      async create(page, data, executeRequest = true){
        // Ensure that the back button is shown instead of the sidenav trigger
        $('#sidenav-trigger').addClass('hidden');
        $('#page-back-trigger').removeClass('hidden');

        let activeTab = $('.tab-screen.active');

        $(activeTab).find('.tab-screen-body.selected').removeClass('selected'); // Deselect current selected page
        
        // Create new page element
        let newPage = elem.create({
          tag: "div",
          classes: ["tab-screen-body","selected","offscreen"]
        });

        $(newPage).append(app.dom.components.preloader()); // Append the preloader to the element

        $(activeTab).append(newPage); // Append new page to the current tab 

        // Remove the 'offscreen' class to make the new tab slide in. Timeout is used because it causes the css transition to play
        setTimeout(function(){
          $(newPage).removeClass('offscreen');
        },10);

        new Hammer(newPage).on('swiperight', function(ev) {
          let touchPos = ev.changedPointers[0].screenX-ev.deltaX;
          if(touchPos <= 45){
            if($('#sidenav-trigger').hasClass('hidden')){
              app.dom.page.back();
            } else {
              app.dom.sidenav(true);
            }
          }
        });

        let res;

        if(executeRequest){
          res = await makeRequest(app.dom.page.templates[page].uri(data));
        } else {
          res = data;
        }

        $(newPage).html('');

        $(newPage).append(app.dom.page.templates[page].domElement(res));
      },
      
      // Removes the current page, going back by 1
      back(){
        let activeTab = $('.tab-screen.active');

        if($(activeTab).find('.tab-screen-body').length <= 2){ // Show the sidenav button instead of the back button when the user gets to the root page
          $('#sidenav-trigger').removeClass('hidden');
          $('#page-back-trigger').addClass('hidden');
        }

        if($(activeTab).find('.tab-screen-body:not(.offscreen)').length > 1){ // Ensure there is still at least 1 page left
          let discardedPage = $(activeTab).find('.tab-screen-body.selected'); // Get the page that is being discarded 
          $(discardedPage).addClass('offscreen'); // Make the page slide off screen
          $(activeTab).find('.tab-screen-body:not(.offscreen)').last().addClass('selected'); // Make the next-to-last page the new active

          setTimeout(_=>{ // Renove discarded page from the dom when the animation completes
            $(discardedPage).remove(); 
          },500);
        }
      }
    }
  }
}









// Events

$('.bottom-nav-item').click(function(e){
  $('.bottom-nav-item').removeClass('active');
  $(this).addClass('active');
  $('.tab-screen').removeClass('active');
  $('#'+$(this).attr('data-page')).addClass('active');

  if($('.tab-screen.active .tab-screen-body').length <= 1){ // Show the sidenav button instead of the back button when the user gets to the root page
    $('#sidenav-trigger').removeClass('hidden');
    $('#page-back-trigger').addClass('hidden');
  } else {
    $('#sidenav-trigger').addClass('hidden');
    $('#page-back-trigger').removeClass('hidden');
  }
});

$('.projector-trigger').click(function(e){
  $('#projector-img').attr('src',this.querySelector('img').src);
  $('#projector').addClass('active');
  $('#fab').addClass('scale-0');
});

$('#projector-close').click(e=>{
  $('#projector-img').attr('src','');
  $('#projector').removeClass('active');
  $('#fab').removeClass('scale-0');
});

$('#projector-share').click(e=>{
  if(navigator.share){ // Check if user agent supports the share api
    navigator.share({
      url: $('#projector-img').attr('src')
    });
  } else {
    app.methods.dialogue("Your browser doesn't support sharing", false);
  }
});

$('#sidenav-trigger').click(e=>{
  app.dom.sidenav(true);
});

$('#page-back-trigger').click(e=>{
  app.dom.page.back();
});


$('#fab, #compose-post').click(e=>{
  $('#fab').addClass('active');
  $('.film').addClass('active');
});

$('.film, .sidenav-button').on('click', e=>{
  app.dom.sidenav(false);
});

new Hammer($('.film')[0]).on('swipeleft', function(ev) {
	app.dom.sidenav(false);
});

new Hammer($('.sidenav')[0]).on('swipeleft', function(ev) {
	app.dom.sidenav(false);
});

$('.post-form-button.post-form-cancel').click(e=>{
  setTimeout(function(){ // workaround for jquery bug
    $('#fab').removeClass('active');
    $('.film').removeClass('active');
  }, 10);
  app.dom.clearPostForm();
});

$('.post-form-button.post-form-submit').click(e=>{
  app.methods.submitForm();
});

$('.edit-profile-modal .edit-profile-submit').click(e=>{
  app.dom.submitProfileEdit();
});


$('.post-body-type-select').click(function(e){
  $('.post-body-type-select').removeClass('active');
  $(this).addClass('active');

  $('.post-body').removeClass('active');
  $('#'+$(this).attr('trigger')).addClass('active');
})


$('#file-upload').change(async function(e){
  const result = await app.methods.toBase64(this.files[0]);
  if(!(result instanceof Error)){ // Error catching
    $('#image-upload-preview').attr('src', result);
  }
})

$('#banner-upload').change(async function(e){
  const result = await app.methods.toBase64(this.files[0]);
  if(!(result instanceof Error)){ // Error catching
    $('.edit-profile-banner').attr('src', result);
    $('.edit-profile-banner').removeClass('hidden');
  }
})

$('#profile-picture-upload').change(async function(e){
  const result = await app.methods.toBase64(this.files[0]);
  if(!(result instanceof Error)){ // Error catching
    $('.edit-profile-profile-picture').attr('src', result);
  }
})

for(const i of $('.tab-screen-body')){
  new Hammer(i).on('swiperight', function(ev) {
    let touchPos = ev.changedPointers[0].screenX-ev.deltaX;
    if(touchPos <= 45){
      if($('#sidenav-trigger').hasClass('hidden')){
        app.dom.page.back();
      } else {
        app.dom.sidenav(true);
      }
    }
  });
}


$(document).ready(app.dom.loadHomeFeed);

$(".bottom-nav-item[data-page='explore']").one("click", async function(){
  $('#explore .tab-screen-body.selected').append(app.dom.components.preloader);
  let data = await app.api.getExplorePage();
  $('#explore .tab-screen-body.selected').html('');
  $('#explore .tab-screen-body.selected').append(app.dom.components.explorePage(data))
});

$(".bottom-nav-item[data-page='activity']").one("click", async function(){
  $('#activity .tab-screen-body.selected').append(app.dom.components.preloader);
  let data = await app.api.getActivity();
  $('#activity .tab-screen-body.selected').html('');
  $('#activity .tab-screen-body.selected').append(app.dom.components.activityPage(data))
});

$(".bottom-nav-item[data-page='profile']").one("click", async function(){
  $('#profile .tab-screen-body.selected').append(app.dom.components.preloader);
  let data = await app.api.getUser(currentUser);
  $('#profile .tab-screen-body.selected').html('');
  $('#profile .tab-screen-body.selected').append(app.dom.components.profilePage(data))
});

app.dom.page.create('settings', '', false);