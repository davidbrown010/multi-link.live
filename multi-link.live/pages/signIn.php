<?php
    $ROOT = '..';
    include_once $ROOT . '/header.php';
?>
<link rel='stylesheet' href="<?php echo $ROOT?>/styles/signIn.css">

<section class = 'signInBackground'></section>

<section class = 'formsWrapper'>
    <form class = 'logInForm' id = 'logIn' action='<?php echo $ROOT?>/auth/login-redirect.php' method='post'>
        <h2>Log In.</h2>
        <div>
            <input required='required' type='text' name='uName' placeholder='Enter your username'>
            <label for="username">Enter username.</label>
        </div>
        <button type='submit' name='submit'>LOG IN</button>
    </form>
    <form class = 'signUpForm hidden' id = 'signUp' action='<?php echo $ROOT?>/auth/register-redirect.php' method='post'>
        <h2>Sign Up.</h2>
        <div>
            <input required='required' type='text' name='username' placeholder='Create your username'>
            <label for="username">Create username.</label>
        </div>
        <button type='submit' name='submit'>REGISTER</button>
    </form>
</section>




<?php
    include_once $ROOT . '/footer.php';
?>
 
<script src = '../js/signIn.js'></script>
