app.dom.components = {
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
      classes: ["bg-white","dark:bg-gray-800","flex","flex-col","mb-4"].concat(!isInFeed ? ['ignore-compact'] : []),
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
              classes: ["flex","flex-row","p-4","w-full","truncate"],
              children: [
                {
                  tag: "img",
                  attributes: {
                    "data-user-info-profile-picture": data.author
                  },
                  src: app.methods.profilePicture(data.profile_picture), 
                  classes: ["w-12","h-12","compact:w-6","compact:h-6","rounded-full","mr-4","compact:mr-3"]
                },
                {
                  tag: "div",
                  classes: ["h-12","compact:h-6", "compact:flex"],
                  children: [
                    {
                      tag: "p",
                      attributes: {
                        "data-user-info-name": data.author
                      },
                      classes: ["font-semibold", "dark:text-white", "compact:font-normal", "mr-1"],
                      text: data.name // Author's name
                    },
                    {
                      tag: 'p',
                      children: [
                        {
                          tag: "span",
                          attributes: {
                            "data-user-info-username": data.author
                          },
                          classes: ["text-gray-600", "dark:text-gray-400", "compact:hidden"],
                          text: "@"+data.username // Author's Username
                        },
                        {
                          tag: "span",
                          classes: ["text-gray-400", "dark:text-gray-600"],
                          text: ` • ${app.methods.dateToTimeAgo(data.timestamp)}` + (data.edited==1 ? ` • edited` : '')
                        }
                      ]
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
                      src: app.methods.profilePicture(data.profile_picture)
                    }
                  ]
                },
                {
                  tag: 'div',
                  children: [
                    {
                      tag: 'p',
                      children: [
                        {
                          tag: 'span',
                          classes: ['font-semibold'],
                          text: data.name + ' '
                        },
                        {
                          tag: 'span',
                          classes: ['text-gray-400', 'dark:text-gray-600'],
                          text: ` • ${app.methods.dateToTimeAgo(data.timestamp)}` + (data.edited==1 ? ` • edited` : '')
                        }
                      ]
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

                  $(preloader).remove();

                  $(this).parents().eq(1).find('.feed').attr('data-checkpoint', nextPage.checkpoint);

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
              src: app.methods.profilePicture(data.profile_picture)
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
          src: app.methods.profilePicture(data.profile_picture),
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
  },
  settings: {
    switch(label, toggled, store){
      return elem.create({
        tag: 'div',
        classes: ["p-4","border-b","dark:border-gray-700","flex","justify-between","items-center","transition-bg","duration-500"],
        children: [
          {
            tag: 'p',
            classes: [],
            text: label
          },
          {
            tag: 'label',
            attributes: {
              for: "settings_"+label.replace(/\s+/g, '-')
            },
            classes: ["switch-container"],
            children: [
              {
                tag: 'input',
                id: "settings_"+label.replace(/\s+/g, '-'),
                attributes: Object.assign({},
                  {type: 'checkbox'},
                  toggled ? {checked: ''} : {}
                ),
                eventListeners: {
                  change(e){
                    localStorage[store] = $(this).is(':checked');
                    app.methods.computeSettings();
                  }
                },
                classes: ['switch']
              }
            ]
          }
        ]
      });
    }
  }
}