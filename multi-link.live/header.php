<?php
    session_start();
    if (isset($_SESSION['db_id'])){
        if (!isset($_SESSION['user_first_name'])){
            session_unset();
            session_destroy();
            header('location: ' . $ROOT . '/../index.php?e=failedToGetUserData');
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
    <link rel="stylesheet" href="<?php echo $ROOT?>/styles/styles.css">
    <script src = '<?php echo $ROOT?>/js/animations.js'></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
</head>
<body>
    
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
        <div class = 'mobileLogo'>
            <a href="<?php echo $ROOT?>/../index.php">
                <img src='<?php echo $ROOT?>/../media/square_logo.png'>
            </a>
        </div>
        <section class='navWrapper'>
        <button class = 'mobileMenuButtonClose' onclick='hide(["navWrapper"])'>
            <span class = 'material-icons'>clear</span>
        </button>
        <ul class = 'nav'>
            <li class = 'logo'>
                <a href="<?php echo $ROOT?>/../index.php">
                    <img src='<?php echo $ROOT?>/../media/wide_logo.png'>
                </a>
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
            //If db_id is in session, show launch button
            if ($db_id_exists) {
                echo "
                <li class = 'doubleActionWrapper'>
                    <a href='" . $ROOT . "/../app.multi-link.live/index.php' class = 'actionButton' >LAUNCH</a>
                    <a class = 'profileButton' href='" . $ROOT . "/pages/account.php'>
                        <div>ACCOUNT</div>
                        <img src=" . '"' . $_SESSION['user_profile_photo_URL_thumbnail'] . '"' . " alt='cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'>
                    </a>
                </li>
            </ul>
            </section>
                ";
            }
            else {
                echo "
                <li>
                <a href='" . $ROOT . "/pages/signIn.php' class = 'actionButton'>GET STARTED</a>
                </li>
            </ul>
            </section>";
            }
        ?>
        <section class="loadingPageCoverer">
            <div class ='wrapper'>
                <div class='loadingCircle'></div>
                <div class='loadingCircle'></div>
                <div class='loadingCircle'></div>
                <div class='loadingCircle'></div>
                <div class='loadingCircle'></div>
            </div>
        </section>