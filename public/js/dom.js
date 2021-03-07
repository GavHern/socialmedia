app.dom = {
  sidenav(state){ // Set state (open/closed) of sidenav
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

  changeFeedLayout(layout){ // Change the layout of all feeds on the application
    switch(layout) {
      case 0:
        $('body').removeClass('compact');
        $('.home-layout').addClass('hidden');
        $('.home-layout.layout-normal').removeClass('hidden');
        localStorage['compact'] = false;
        break;
      case 1:
        $('body').addClass('compact');
        $('.home-layout').addClass('hidden');
        $('.home-layout.layout-compact').removeClass('hidden');
        localStorage['compact'] = true;
        break;
    }
  },

  updateExploreFollowingList(user, value){ // Update the following list on the explore tab (when a user is followed or unfollowed)
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

  async loadHomeFeed(){ // Load the home feed. Called on page load
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

  editProfileModal(data){ // Toggle state of the profile edit modal (to change name, username, profile picture, etc.)
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

  async submitProfileEdit(){ // Called when the submit button is pressed on the profile edit modal
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

  closeProfileEdit(){ // Called when the close button on the edit profile modal is clicked
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
    templates: { // List of sheet components
      confirm(data){ // Prompts user to confirm if they wish to perform an action. Provides a cancel button and a action button with a callback
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
      
      text(data){ // Prompts user to enter information into a text field
        let inputs = [];

        for(const i of data.inputs){
          inputs.push({
            tag: 'div',
            classes: [],
            children: [
              {
                tag: 'h1',
                classes: ["text-gray-600", "dark:text-gray-400","text-lg","font-semibold","mb-2","mt-4"],
                text: i.label
              },
              {
                tag: 'input',
                classes: ["w-full","h-12","dark:text-gray-200","dark:bg-gray-900","border-2","px-3","rounded-xl","transition","duration-300","border-gray-200","focus:border-green-400","dark:border-gray-700","dark:focus:border-green-400","focus:ring-1","focus:ring-green-400","outline-none","mb-2"],
                attributes: {
                  "type": i.type,
                  "placeholder": i.placeholder,
                  "value": i.value
                }
              }
            ]
          });
        }

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
                tag: 'div',
                children: inputs
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
                        data.action(
                          $(this).parents().eq(1).find('input'),
                          _=> {
                            $(this).parents().eq(4).removeClass('active');

                            setTimeout(_=>{
                              $(this).parents().eq(4).remove();
                            },300)
                          }
                        );
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },

      options(data){ // Prompts user with a list of actions
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

      report(data){ // Prompts user to report a post or comment with a reason and an optional message
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

      comment(data){ // Prompts user to compose a comment
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

      edit(data){ // Prompts user to edit an existing post or comment
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
                html: data.text.replaceAll(/\<@[a-zA-Z0-9]+\:[a-zA-Z0-9]+\>/g, match => {
                  let username = match.split(':')[1].split('>')[0];
                  return `@${username}`;
                })
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
                            $(`div[data-post-id=${data.id}] .post-body-text`).html(app.methods.parseMentions( // Parse new text to have mention links
                              text.replaceAll(/([@][a-zA-Z0-9]{3,})/g, match => {
                                match = match.replace('@','');
                                return `<@${match}:${match}>`;
                              })
                            ));
                          } else {
                            $(`div[data-comment-id=${data.id}] .comment-body-text`).html(app.methods.parseMentions( // Parse new text to have mention links
                              text.replaceAll(/([@][a-zA-Z0-9]{3,})/g, match => {
                                match = match.replace('@','');
                                return `<@${match}:${match}>`;
                              })
                            ));
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
    create(sheet, data){ // Method to create a new sheet element using a template
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
  }
}