<?php
    $ROOT = '..';
    include_once $ROOT . '/header.php';
?>
<link rel='stylesheet' href="<?php echo $ROOT?>/styles/signIn.css">

<section class = 'signInBackground'></section>

<div class = 'formsWrapper'>
    <form id = 'logIn' action='<?php echo $ROOT?>/auth/login-redirect.php' method='post'>
        <label>Log In.</label>
        <input required='required' type='text' name='uName' placeholder='Enter your username'>
        <button type='submit' name='submit'>LOG IN</button>
    </form>
    <form id = 'signUp' action='<?php echo $ROOT?>/auth/register-redirect.php' method='post'>
        <label>Sign Up.</label>
        <input required='required' type='text' name='username' placeholder='Create your username'>
        <button type='submit' name='submit'>REGISTER</button>
    </form>
</div>




<?php
    include_once $ROOT . '/footer.php';
?>
 

