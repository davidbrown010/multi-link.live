<?php 
    session_start();
    include_once '/domain.php';
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
    if (!isset($_GET['code'])){
        print_r("Authentication Failed");
        header('location: ../pages/signIn.php?e=unableToAccessUser');
        exit;
    }
    else {
        try {
            $ch = curl_init();
            $url = 'http://' . $NODE_DOMAIN . '/users/login?username=' . $_SESSION['login_username'];
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $resp = curl_exec($ch);

            

            $decoded = json_decode($resp);
            print_r($decoded);
            
            $_SESSION['db_id'] = $decoded->_id;
            unset($_SESSION['login_username']);
            header("Location: ../../app.multi-link.live/index.php");
            exit;
        } catch (execption $e) {
            header('location: ../pages/signIn.php?e=unableToAccessBackend');
            exit;
        }
        
    }
    

?>
</body>
</html>