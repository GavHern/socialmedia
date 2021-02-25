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

var systemDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if(systemDarkTheme && ['true', undefined].includes(localStorage['system-theme'])){
  $('body').addClass('dark');
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  if(['true', undefined].includes(localStorage['system-theme'])){
    $('body').toggleClass('dark', e.currentTarget.matches);
  }

  systemDarkTheme = e.currentTarget.matches;
});

$(document).ready(app.methods.computeSettings);