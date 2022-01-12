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
        if (isset($_POST['submit'])){
            $_SESSION['login_username'] = $_POST['uName'];

            $url = 'http://localhost:3000/auth/login-redirect';
            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            
            $resp = curl_exec($ch);
            if ($e = curl_error($ch)) {
                echo $e;
            } else {
                $decoded = json_decode($resp);
                header("Location: " . $decoded->redirectLink);
                exit;
            }
            
            curl_close($ch);
            echo "success";
        }
        else {
            echo "error";
        }
    ?>
</body>
</html>
