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
  },
  dateToTimeAgo(time){
    time = time*1000;
    
    switch (typeof time) {
      case 'number':
        break;
      case 'string':
        time = +new Date(time);
        break;
      case 'object':
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = +new Date();
    }
    var time_formats = [
      [60, 'seconds', 1], // 60
      [120, '1 minute ago', '1 minute from now'], // 60*2
      [3600, 'minutes', 60], // 60*60, 60
      [7200, '1 hour ago', '1 hour from now'], // 60*60*2
      [86400, 'hours', 3600], // 60*60*24, 60*60
      [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
      [604800, 'days', 86400], // 60*60*24*7, 60*60*24
      [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
      [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
      [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
      [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
      [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
      [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
      [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var seconds = (+new Date() - time) / 1000,
      token = 'ago',
      list_choice = 1;
  
    if (seconds == 0) {
      return 'Just now'
    }
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      list_choice = 2;
    }
    var i = 0,
      format;
    while (format = time_formats[i++])
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[list_choice];
        else
          return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
      }
    return time;
  }
}