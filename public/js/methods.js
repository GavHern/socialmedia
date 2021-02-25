// Various methods
app.methods = {
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
        app.dom.changeFeedLayout(0)
      },
      "Compact": _=>{
        app.dom.changeFeedLayout(1)
      }
    })
  },
  computeSettings(){
    let settings = {
      "dark": JSON.parse(localStorage['dark']),
      "systemTheme": JSON.parse(localStorage['system-theme']),
      "compact": JSON.parse(localStorage['compact'])
    }

    if(!settings.systemTheme){
      $('#settings_Dark-Mode').prop('disabled', false);
      if(settings.dark){
        $('body').addClass('dark');
      } else {
        $('body').removeClass('dark');
      }
    } else {
      $('body').toggleClass('dark', systemDarkTheme);
      $('#settings_Dark-Mode').prop('disabled', true);
    }
    
    if(!settings.compact){
      app.dom.changeFeedLayout(0);
    } else {
      app.dom.changeFeedLayout(1);
    }
  }
}