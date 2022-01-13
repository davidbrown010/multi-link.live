<?php
    session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php   
    unset($_SESSION['login_username']);
    if (!isset($_SESSION['db_id'])) {
        header('location: ../multi-link.live/pages/signIn.php?e=loginFailed');
        exit;
    }
    $ROOT = '..';
    include_once './DA/getUser.php';

    print_r($_SESSION);




    echo '<a href="../index.php">GO BACK</a>';
?>
</body>
</html>