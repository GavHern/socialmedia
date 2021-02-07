// Register Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js')
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
async function makeRequest(uri, data){
  let res = await fetch(uri, data);
  resParsed = await res.json();

  if(!resParsed.success){
    app.methods.dialogue(resParsed.message, false);
  }

  return resParsed;
}







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
    async getPostInformation(id){ // Get the details of a post
      let res = await makeRequest(`https://socialmedia.gavhern.com/api/postinfo.php?post=${id}`, {
        method: 'GET',
        redirect: 'follow'
      });

      return res;
    }
  },




  // Various methods
  methods: {
    signOut(){
      window.localStorage.removeItem("session");
      document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); }); // Clear cookies
      window.location.href="/login.html#";
    },
    dialogue(msg, success){
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
    async submitForm(){
      $('.post-form-button.post-form-submit').addClass('loading');

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
    }
  },




  // DOM related methods
  dom: {

    // Components (made with custom element building library. elembuilder.js)
    components: {
      postElement(data, isInFeed){
        let body;
        if(data.type == "text"){
          body = {
            tag: isInFeed ? "a" : "p", // If the post is in a feed, make the body a link.
            href: "#",
            classes: ["flex-shrink-0","dark:text-gray-300","w-full","px-4"],
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
                classes: ["bg-black","w-full","max-h-144","object-contain"],
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
          attributes: {
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
                  classes: ["flex","flex-row","p-4","w-full"],
                  children: [
                    {
                      tag: "img",
                      src: (data.profile_picture == "") ? "https://socialmedia.gavhern.com/api/cdn.php?f=default&thumb" : "https://socialmedia.gavhern.com/api/cdn.php?thumb&f="+data.profile_picture, // Author pfp
                      classes: ["w-12","h-12","rounded-full","mr-4"]
                    },
                    {
                      tag: "div",
                      classes: ["h-12"],
                      children: [
                        {
                          tag: "p",
                          classes: ["font-semibold", "dark:text-white"],
                          text: data.username // Author's name
                        },
                        {
                          tag: "p",
                          classes: ["text-gray-600", "dark:text-gray-400"],
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
                    click: function(){
                      app.dom.sheet.create('options', (data.is_author != 1) ? {
                        "Report": _=>{alert('Reporting coming soon')},
                        "Cancel": _=>{}
                      } : {
                        "Edit": _=>{alert('Editing coming soon')},
                        "Delete": _=>{alert('Deleting coming soon')},
                        "Report": _=>{alert('Reporting coming soon')},
                        "Cancel": _=>{}
                      })
                    }
                  },
                  html: '<svg class="w-6 h-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>'
                }
              ]
            },
            {
              tag: isInFeed ? "a" : "p",
              href: "#",
              classes: ["flex-shrink-0","dark:text-gray-200","px-4","text-xl","font-semibold","pb-2"],
              text: data.title, // Post title
              eventListeners: isInFeed ? {
                click: function(e){
                  app.dom.page.create('post', data.id);
                }
              } : {}
            },
            body,
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
                      alert('Commenting coming soon.')
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
          children: [
            {
              tag: 'div',
              classes: ["flex","justify-between","items-center","mt-1"],
              children: [
                {
                  tag: 'a',
                  href: '#',
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
                          text: '@'+data.username
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
                        "Report": _=>{alert('Reporting coming soon')},
                        "Cancel": _=>{}
                      } : {
                        "Edit": _=>{alert('Editing coming soon')},
                        "Delete": _=>{alert('Deleting coming soon')},
                        "Report": _=>{alert('Reporting coming soon')},
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
              classes: ["mt-2","text-gray-800","dark:text-gray-300"],
              text: data.body
            },
            {
              tag: 'div',
              classes: ["mt-2","text-gray-800","dark:text-gray-300","flex","flex-row-reverse","p-1"],
              children: [
                {
                  tag: 'a',
                  href: '#',
                  classes: ['flex', 'items-center'],
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

    menu(){
      let elemData = {}
    },

    async loadHomeFeed(){
      $('#home-feed').html(app.dom.components.preloader()); // Append preloader

      const feedData = await app.api.getFeed(); // Request feed from server

      $('#home-feed').html(''); // Clear container (to remove preloader)
      
      // Check if feed is empty
      if(feedData.data.length != 0) {
        for(const i of feedData.data){ // Iterate JSON and append a post element
          $('#home-feed').append(app.dom.components.postElement(i, true))
        }
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
                      classes: ["w-full","h-12","flex","justify-center","items-center","rounded-xl","ring-2","ring-gray-200","ring-inset"],
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
        }

      },
      create(sheet, data){
        let element = elem.create({
          tag: 'div',
          classes: ["z-70", "absolute", "w-full", "h-full", "left-0", "top-0", "action-sheet-container"],
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
                      classes: ["h-1","w-16","bg-gray-300","rounded-full"]
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
        "post": {
          uri(id){return `https://socialmedia.gavhern.com/api/postinfo.php?post=${id}`},
          domElement(data){
            let commentArray=[];

            if(data.comments.length < 1){
              commentArray.push({
                tag: 'div',
                html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg></div><div class="font-semibold text-xl text-gray-400 text-center mb-2">This post has no comments</div></div>'
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
                      classes: ["flex","items-center","bg-white","dark:bg-gray-700","text-gray-400","h-10","w-full","rounded-xl","px-4"],
                      text: "Write comment..."
                    }
                  ]
                },
                {
                  tag: 'div',
                  children: commentArray
                }
              ]
            })
          }
        },
        "profile": {
          uri(user){return `https://socialmedia.gavhern.com/api/profile.php?user=${user}`},
          domElement(data){
            return elem.create({

            });
          }
        },
        "saved": {
          uri(data){return `https://socialmedia.gavhern.com/api/savedfeed.php`},
          domElement(data){
            let postArray=[];

            for(const i of data.data){
              postArray.push(app.dom.components.postElement(i, true));
            }

            return elem.create({
              tag: 'div',
              children: [
                {
                  tag: 'h1',
                  classes: ["text-xl","font-semibold","p-4"],
                  text: "Saved Posts"
                },
                {
                  tag: 'div',
                  children: postArray
                }
              ]
            });
          }
        }
      },


      // Creates a page and adds it to the dom
      async create(page, data){
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



        let res = await makeRequest(app.dom.page.templates[page].uri(data));

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

        if($(activeTab).find('.tab-screen-body').length > 1){ // Ensure there is still at least 1 page left
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


$(document).ready(function(){
  app.dom.loadHomeFeed();
});