<?php 
    session_start();
    include_once 'domain.php';
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
    if (isset($_POST['submit'])){
        try {
            $ch = curl_init();
            $url = $NODE_DOMAIN . '/users/login?username=' . $_POST['uName'];
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
            echo 'unableToAccessBackend';
            header('location: ../pages/signIn.php?e=unableToAccessBackend');
            exit;
        }
    }
    else {
        header('location: ../pages/signIn.php?e=formSubmissionError');
        exit;
    }
    

?>
</body>
</html>