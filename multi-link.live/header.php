<?php
    session_start();
    if (isset($_SESSION['db_id'])){
        if (!isset($_SESSION['user_first_name'])){
            session_unset();
            session_destroy();
            header('location: ./index.php?e=failedToGetUserData');
            exit;
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Link</title>
    <link rel="stylesheet" href="styles/styles.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
</head>
<body>
    <script src = 'js/animations.js'></script>
        <?php
            $db_id_exists = isset($_SESSION['db_id']);
            if (!$db_id_exists) { session_unset(); session_destroy(); }
            
            if (count($_GET) > 0){
                echo "
                <section class = 'errorBanner show'>
                    <div class = 'messageWrapper'>";
                        foreach ($_GET as $param) echo $param . ".";
                echo "
                    </div>
                <button onclick='" . 'hide(["errorBanner"])' . "'>
                    <span class='material-icons'>clear</span>
                </button>
                </section>";
            }
            
        ?>
        <button class = 'mobileMenuButton' onclick='show(["navWrapper"])'>
            <span class = 'material-icons'>menu</span>
        </button>
        <div class = 'mobileLogo'></div>
        <section class='navWrapper'>
        <button class = 'mobileMenuButtonClose' onclick='hide(["navWrapper"])'>
            <span class = 'material-icons'>clear</span>
        </button>
        <ul class = 'nav'>
            <li class = 'logo'>
                logo
            </li>
            <li>
                <a href="">All Features</a>
            </li>
            <li>
                <a href="">Privacy And Security</a>
            </li>
            <li>
                <a href="">Documentation</a>
            </li>
            <li>
                <a href="">Pricing</a>
            </li>
        <?php 
            //If db_id is in cookies, show launch button
            if ($db_id_exists) {
                echo "
                <li class = 'doubleActionWrapper'>
                    <a href='../app.multi-link.live/index.php' class = 'actionButton' >LAUNCH</a>
                    <button class = 'profileButton'>
                        <div>ACCOUNT</div>
                        <img src=" . '"' . $_SESSION['user_profile_photo_URL_thumbnail'] . '"' . " alt='cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'>
                    </button>
                    <!--<a href='./auth/logout.php' class = 'actionButton redButton' >LOG OUT</a> -->
                </li>
            </ul>
            </section>
                ";
            }
            else {
                echo "
                <li>
                    <button onclick='show(" . '["getStartedWrapper", "exitButton", "formsWrapper"]' . ")'>GET STARTED</button>
                </li>
            </ul>
            </section>
            <div class = 'getStartedWrapper'>
                <button class = 'exitButton' onclick='hide(" . '["getStartedWrapper", "exitButton", "formsWrapper"]' . ")'>
                    <span class = 'material-icons'>arrow_forward_ios</span>
                </button>
                <div class = 'formsWrapper'>
                    <form id = 'logIn' action='./auth/username-redirect.php' method='post'>
                        <label>Log In.</label>
                        <input required='required' type='text' name='uName' placeholder='Enter your username'>
                        <button type='submit' name='submit'>LOG IN</button>
                    </form>
                    <form id = 'signUp' action='./auth/register-redirect.php' method='post'>
                        <label>Sign Up.</label>
                        <input required='required' type='text' name='username' placeholder='Create your username'>
                        <button type='submit' name='submit'>REGISTER</button>
                    </form>
                </div>
            </div>";
            }
        ?>
        