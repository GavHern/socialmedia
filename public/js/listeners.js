// Bottom navigation
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

// Close button on image projector
$('#projector-close').click(e=>{
  $('#projector-img').attr('src','');
  $('#projector').removeClass('active');
  $('#fab').removeClass('scale-0');
});

// Share button on image projector
$('#projector-share').click(e=>{
  if(navigator.share){ // Check if user agent supports the share api
    navigator.share({
      url: $('#projector-img').attr('src')
    });
  } else {
    app.methods.dialogue("Your browser doesn't support sharing", false);
  }
});

// Top navigation sidenav trigger
$('#sidenav-trigger').click(e=>{
  app.dom.sidenav(true);
});

// Top navigation page back button
$('#page-back-trigger').click(e=>{
  app.dom.page.back();
});

// Open post modal
$('#fab, #compose-post').click(e=>{
  $('#fab').addClass('active');
  $('.film').addClass('active');
});

// Close sidenav
$('.film, .sidenav-button').on('click', e=>{
  app.dom.sidenav(false);
});

// Swipeleft gesture on film to close sidenav
new Hammer($('.film')[0]).on('swipeleft', function(ev) {
	app.dom.sidenav(false);
});

// Swipeleft gesture on sidenav to close
new Hammer($('.sidenav')[0]).on('swipeleft', function(ev) {
	app.dom.sidenav(false);
});

// Close post modal
$('.post-form-button.post-form-cancel').click(e=>{
  setTimeout(function(){ // workaround for jquery bug
    $('#fab').removeClass('active');
    $('.film').removeClass('active');
  }, 10);
  app.dom.clearPostForm();
});

// Submit post form
$('.post-form-button.post-form-submit').click(e=>{
  app.methods.submitForm();
});

// Submit profile edit form
$('.edit-profile-modal .edit-profile-submit').click(e=>{
  app.dom.submitProfileEdit();
});


// Listen for user to change the type of post (text, image)
$('.post-body-type-select').click(function(e){
  $('.post-body-type-select').removeClass('active');
  $(this).addClass('active');

  $('.post-body').removeClass('active');
  $('#'+$(this).attr('trigger')).addClass('active');
})

// Update image preview on post form when a new image is uploaded
$('#file-upload').change(async function(e){
  const result = await app.methods.toBase64(this.files[0]);
  if(!(result instanceof Error)){ // Error catching
    $('#image-upload-preview').attr('src', result);
  }
})

// Update banner upload preview when a new image is uploaded
$('#banner-upload').change(async function(e){
  const result = await app.methods.toBase64(this.files[0]);
  if(!(result instanceof Error)){ // Error catching
    $('.edit-profile-banner').attr('src', result);
    $('.edit-profile-banner').removeClass('hidden');
  }
})

// Update profile picture upload preview when a new image is uploaded
$('#profile-picture-upload').change(async function(e){
  const result = await app.methods.toBase64(this.files[0]);
  if(!(result instanceof Error)){ // Error catching
    $('.edit-profile-profile-picture').attr('src', result);
  }
})

// Gesture for when user swipes right on the left edge of the screen (open sidenav or navigate back 1 page)
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

// Load home feed when the application fully renders
$(document).ready(app.dom.loadHomeFeed);

// Load explore tab the first time it is navigated to
$(".bottom-nav-item[data-page='explore']").one("click", async function(){
  $('#explore .tab-screen-body.selected').append(app.dom.components.preloader);
  let data = await app.api.getExplorePage();
  $('#explore .tab-screen-body.selected').html('');
  $('#explore .tab-screen-body.selected').append(app.dom.components.explorePage(data))
});

// Load activity tab the first time it is navigated to
$(".bottom-nav-item[data-page='activity']").one("click", async function(){
  $('#activity .tab-screen-body.selected').append(app.dom.components.preloader);
  let data = await app.api.getActivity();
  $('#activity .tab-screen-body.selected').html('');
  $('#activity .tab-screen-body.selected').append(app.dom.components.activityPage(data))
});

// Load profile tab the first time it is navigated to
$(".bottom-nav-item[data-page='profile']").one("click", async function(){
  $('#profile .tab-screen-body.selected').append(app.dom.components.preloader);
  let data = await app.api.getUser(currentUser);
  $('#profile .tab-screen-body.selected').html('');
  $('#profile .tab-screen-body.selected').append(app.dom.components.profilePage(data))
});

// Check if user has system dark theme enabled. Initialize variable to track system theme
var systemDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// If the user has system dark theme enabled, enable dark mode on the body element
if(systemDarkTheme && ['true', undefined].includes(localStorage['system-theme'])){
  $('body').addClass('dark');
}

// Listen for system theme change
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  if(['true', undefined].includes(localStorage['system-theme'])){
    $('body').toggleClass('dark', e.currentTarget.matches);
  }

  systemDarkTheme = e.currentTarget.matches;
});

// Compute settings on page load
$(document).ready(app.methods.computeSettings);