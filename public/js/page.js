app.dom.page = {
  templates: {
    "blank": { // Blank page with a provided component structure
      domElement(data){
        return elem.create(data);
      }
    },
    "post": { // Page displaying additional information for a post
      uri(id){return `https://socialmedia.gavhern.com/api/postinfo.php?post=${id}`},
      domElement(data){
        let commentArray = data.comments.map(comment => {
          return app.dom.components.commentElement(comment)
        });
        
        if(data.comments.length < 1){ // Filler element if there are no comments
          commentArray.push({
            tag: 'div',
            html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg></div><div class="font-semibold text-xl text-gray-400 dark:text-gray-600 text-center mb-2">This post has no comments</div></div>'
          })
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
                  text: "Write a comment..."
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
      },
      errorElement(){
        return elem.create({
          tag: "div",
          classes: ["w-full","flex","justify-center","px-4"],
          html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><div class="font-semibold text-xl text-gray-400 dark:text-gray-500 text-center mb-2">The post you were looking for may have been deleted</div></div>'
        })
      }
    },
    "profile": { // Page displaying a user's profile and posts
      uri(user){return `https://socialmedia.gavhern.com/api/profile.php?user=${user}`},
      domElement(data){
        $(`.recently-viewed-shelf a[data-recent-card=${data.info.id}]`).remove();
        $(`.recently-viewed-shelf`).prepend(app.dom.components.userShelfCard(data.info));
        $('.user-shelf-container').scrollLeft(0);

        return app.dom.components.profilePage(data);
      },
      errorElement(){
        return elem.create({
          tag: "div",
          classes: ["w-full","flex","justify-center","px-4"],
          html: '<div class="flex flex-col justify-center"><div class="flex justify-center mt-4 mb-1"><svg class="w-24 h-24 text-gray-300 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><div class="font-semibold text-xl text-gray-400 dark:text-gray-500 text-center mb-2">The account you were looking doesn\'t exist, or may have been deleted</div></div>'
        })
      }
    },
    "follows": { // Page showing a user's mutual, follower, or following list
      uri(data){return `https://socialmedia.gavhern.com/api/followers.php?user=${data.user}&feed=${data.feed}`},
      domElement(data){
        let userCards=[];

        if(data.data.length != 0 && data.data != null){
          userCards = data.data.map(userInfo => {
            return app.dom.components.userCard(userInfo);
          });
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
    "saved": { // Page displaying a feed of posts saved by the user
      uri(data){return `https://socialmedia.gavhern.com/api/savedfeed.php`},
      domElement(data){
        let postArray = app.dom.components.postFeed(data.data, {page:'saved', checkpoint: data.checkpoint});

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
              children: [postArray]
            }
          ]
        });
      }
    },
    "search": { // Page displaying search results
      uri(data){return `https://socialmedia.gavhern.com/api/search.php?q=${data}`},
      domElement(data){
        let userCards = data.users.map(user => {
          return app.dom.compoents.userCard(user)
        });

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
    "settings": { // Settings page
      domElement(data){
        const settings = {
          "Appearance": {
            "Use system theme": {
              type: 'switch',
              data: 'system-theme'
            },
            "Dark Mode": {
              type: 'switch',
              data: 'dark'
            },
            "Compact Mode": {
              type: 'switch',
              data: 'compact'
            }
          },
          "Account": {
            "Change email": {
              type: 'button',
              data: {
                danger: false,
                action: _=> {
                  app.dom.sheet.create('text', {
                    inputs: [
                      {
                        type: "email",
                        label: "New email",
                        value: "",
                        placeholder: ""
                      },
                      {
                        type: "email",
                        label: "Confirm email",
                        value: "",
                        placeholder: ""
                      },
                      {
                        type: "password",
                        label: "Password",
                        value: "",
                        placeholder: ""
                      }
                    ],
                    text: "Change email",
                    color: "bg-green-400",
                    actionText: "Change email",
                    action: async function(values, closeSheet){
                      let res = await app.api.changeEmail(
                        $(values[0]).val(), // New email
                        $(values[1]).val(), // Confirm email
                        $(values[2]).val() // Password
                      );

                      if(res.success){
                        app.methods.dialogue("Your email was successfully edited.", true);
                        closeSheet();
                      }
                    }
                  });
                }
              }
            },
            "Change password": {
              type: 'button',
              data: {
                danger: false,
                action: _=> {
                  app.dom.sheet.create('text', {
                    inputs: [
                      {
                        type: "email",
                        label: "Email",
                        value: "",
                        placeholder: ""
                      }
                    ],
                    text: "Send reset",
                    color: "bg-green-400",
                    actionText: "Send reset",
                    action: async function(values, closeSheet){
                      let res = await app.api.resetPassword(
                        $(values[0]).val(), // Email Address
                      );

                      if(res.success){
                        closeSheet();
                        app.dom.sheet.create('resetPasswordSuccess');
                      }
                    }
                  });
                }
              }
            },
            "Delete account": {
              type: 'button',
              data: {
                danger: true,
                action: _=> {
                  app.dom.sheet.create('confirm', {
                    text: "Are you sure you want to delete your account?",
                    subtext: "This action cannot be undone and all your acount data will be permanently deleted",
                    color: "bg-red-500",
                    actionText: "I Understand",
                    action: async _=>{


                      app.dom.sheet.create('text', {
                        inputs: [
                          {
                            type: "password",
                            label: "Password",
                            value: "",
                            placeholder: ""
                          }
                        ],
                        text: "Please confirm your password to delete your account",
                        color: "bg-red-500",
                        actionText: "Delete Forever",
                        action: async function(values){
                          let res = await app.api.deleteAccount($(values[0]).val());

                          if(res.success){
                            app.methods.dialogue("Account successfully deleted. Redirecting to login page shortly.", true);
                            setTimeout(_=>{window.location.href="login.html"}, 1000);
                          }
                        }
                      });


                    }
                  });
                }
              }
            }
          }
        }

        let sections = [];

        for(const i in settings){
          let items = [];

          for(const ii in settings[i]){
            let current = settings[i][ii];
            let defaultValue;

            if(typeof current.default !== 'undefined'){
              defaultValue = current.default;
            } else {
              defaultValue = localStorage[current.data]=="true";
            }

            items.push(
              app.dom.components.settings[current.type](ii, current.data, defaultValue)
            );
          }

          sections.push({
            tag: 'div',
            children: [
              {
                tag: 'h1',
                classes: ["font-semibold","text-2xl","dark:text-white","transition-all","duration-300"],
                text: i
              },
              {
                tag: 'div',
                classes: ["m-4"],
                children: [
                  {
                    tag: 'div',
                    classes: ["bg-white","dark:bg-gray-800","shadow-xl","rounded-xl","dark:text-gray-200","overflow-hidden","transition-all","duration-300"],
                    children: items 
                  }
                ]
              }
            ]
          })
        }

        return elem.create({
          tag: 'div',
          classes: ["m-4"],
          children: sections
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

    if(res.success !== false){
      $(newPage).append(app.dom.page.templates[page].domElement(res));
    } else {
      $(newPage).append(app.dom.page.templates[page].errorElement(res));
    }
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