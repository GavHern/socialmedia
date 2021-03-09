app.api = {
  async getFeed(checkpoint){ // Get Home Feed
    let res = await makeRequest("https://socialmedia.gavhern.com/api/feed.php" + (checkpoint === undefined ? "" : `?checkpoint=${checkpoint}`), {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  },

  async like(post, value, isComment){ // Like a post or comment
    if(value){value=1}else{value=0} // Format binary int as boolean
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/like.php?value=${value}&comment=${isComment}&post=${post}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  },

  async save(post, value){ // Save a post
    if(value){value=1}else{value=0} // Format binary int as boolean
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/save.php?value=${value}&post=${post}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  },

  async follow(user, value){ // Follow a user
    if(value){value=1}else{value=0} // Format binary int as boolean
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/follow.php?value=${value}&account=${user}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  },

  async updateProfile(data){ // Update user profile info
    let formdata = new FormData(); // Instantiate FormData class

    for(const i in data){ // Append data to formdata object
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
    let formdata = new FormData(); // Instantiate FormData class

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

  async edit(id, isComment, body){ // Edit a post or comment
    if(isComment){isComment=1}else{isComment=0} // Format binary int as boolean
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/edit.php?id=${id}&is_comment=${isComment}&body=${body}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  },

  async delete(id, isComment){ // Delete a post or comment
    if(isComment){isComment=1}else{isComment=0} // Format binary int as boolean
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

  async getFollowers(user, feed){ // Get the mutual, follower, or following list from a user
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
  },
  
  async deleteAccount(password){
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/deleteaccount.php?password=${password}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  },

  async changeEmail(email, confirm, password){
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/reset/email.php?email=${email}&confirm=${confirm}&password=${password}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  }, 
  async resetPassword(email){
    let res = await makeRequest(`https://socialmedia.gavhern.com/api/reset/password/request.php?email=${email}`, {
      method: 'GET',
      redirect: 'follow'
    });

    return res;
  }
}