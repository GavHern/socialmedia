<?php
    // Requires (header information, database functions, authentication functions, utility functions)
    include '../../tools/db.php';
    include '../../tools/auth.php';
    include '../../tools/utils.php';
    
    
    // Get all nessisary parameters and sanitize them
    $values = array(
        "reset_key" => sanitize($_GET['key']),
        "token" => sanitize($_GET['token']),
        "timestamp" => time(),
        "expiration_time" => 600 // 10 minutes
    );
    
    // Get information surrounding the reset token
    $token_data = db("SELECT * from reset_tokens WHERE reset_key = '{$values['reset_key']}' AND `used` = 0 AND timestamp > {$values['timestamp']} - {$values['expiration_time']} ORDER BY timestamp DESC LIMIT 1;", true)[0];
    $token_is_valid = isset($token_data['token']) && password_verify($values['token'], $token_data['token']);
?>
<html lang="en" class="overflow-hidden overscroll-none relative">
<head>
  <meta charset="UTF-8">

  <!--Makes viewport on iOS devices not have a black bar-->
  <meta name='viewport' content='viewport-fit=cover, width=device-width, initial-scale=1.0'>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <title>Social Media</title>
  <link rel="stylesheet" type="text/css" href="/style.css">
  <link rel="apple-touch-icon" href="icons/manifest-icon-512.png">
  <link rel="icon" href="icons/apple-icon-180.png">
  <link rel="manifest" href="/manifest.json">
</head>
<body class="flex flex-col bg-gray-100 dark:bg-gray-900 h-full overflow-hidden overscroll none relative">
  <main class="flex justify-center items-center w-full h-full">
    <div class="bg-white dark:bg-gray-800 relative rounded-2xl shadow-md w-4/5 pt-12 pb-4 -mb-12">
      <div class="flex justify-center items-center absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full shadow-lg bg-white dark:bg-gray-700 border-4 border-green-500 overflow-hidden">
        <svg class="w-16 h-16 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      </div>

      <div id="new-credentials" class="mx-auto w-4/5 form-section<?php echo $token_is_valid ? '' : ' hidden';?>">
        <h1 class="dark:text-white text-3xl font-bold text-center mt-2 mb-6">Reset Password</h1>

        <label class="text-gray-500 dark:text-gray-300">New password</label>
        <input id="new-password" class="w-full h-12 dark:text-gray-200 dark:bg-gray-900 border-2 px-3 rounded-xl shadow-sm transition duration-300 border-gray-200 focus:border-green-400 dark:border-gray-700 dark:focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none mb-4 mt-1" type="password">

        <label class="text-gray-500 dark:text-gray-300">Confirm new password</label>
        <input id="confirm-password" class="w-full h-12 dark:text-gray-200 dark:bg-gray-900 border-2 px-3 rounded-xl shadow-sm transition duration-300 border-gray-200 focus:border-green-400 dark:border-gray-700 dark:focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none mb-4 mt-1" type="password">

        <button onclick="resetPassword()" class="flex items-center justify-center w-full h-12 mt-1 rounded-xl ring-2 ring-green-400 ring-inset focus:outline-none focus:bg-green-400 focus:text-white dark:text-white transition">Change password</button>
      </div>

      <div id="invalid-token" class="mx-auto w-4/5 form-section <?php echo !$token_is_valid ? '' : ' hidden';?>">
        <h1 class="dark:text-white text-3xl font-bold text-center mt-2 mb-6">Invalid Token</h1>

        <p class="text-center">This link has either expired or is invalid</p>
      </div>
 
      <div id="success-panel" class="mx-auto w-4/5 form-section hidden">
        <h1 class="dark:text-white text-3xl font-bold text-center mt-2 mb-6">Password successfully reset!</h1>

        <p class="text-center">You may now log in with your new credentials</p>
      </div>
    </div>
  </main>
  
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script>
    function showPanel(panelName){
      $('.form-section').addClass('hidden');
      $('#'+panelName).removeClass('hidden');
    }

    async function resetPassword(){
        let newPassword = $('#new-password').val();
        let confirmPassword = $('#confirm-password').val();
        let key = new URL(window.location.href).searchParams.get("key");
        let token = new URL(window.location.href).searchParams.get("token");
        
        console.log(`https://socialmedia.gavhern.com/api/reset/password/reset.php?key=${key}&token=${token}&password=${newPassword}&confirm=${confirmPassword}`)
        
        let res = await fetch(`https://socialmedia.gavhern.com/api/reset/password/reset.php?key=${key}&token=${token}&password=${newPassword}&confirm=${confirmPassword}`);
        let resParsed = await res.json();
        
        if(resParsed.success) {
            showPanel('success-panel');
        } else {
            alert(resParsed.message);
        }
    }
  </script>
</body>
</html>