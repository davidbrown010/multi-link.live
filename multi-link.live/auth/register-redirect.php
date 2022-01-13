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

    //handles post request submitting username
    if (!isset($_SESSION['login_username'])){
        if (!isset($_POST['username'])){
            header("location: ../pages/signIn.php?e=noUsername");
            exit;
        }
        
        $_SESSION['login_username'] = $_POST['username'];

        $ch = curl_init();
        $url = $NODE_DOMAIN . '/auth/auth-redirect?redirct=' . $PHP_DOMAIN . '/multi-link.live/auth/login-redirect.php';

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $resp = curl_exec($ch);

        if ($e = curl_error($ch)) {
            curl_close($ch);
            header('location: ../pages/signIn.php?e=serverError');
            exit;
        } else {
            $decoded = json_decode($resp);
            curl_close($ch);
            header('location: ' . $decoded->redirectLink);
            exit;
        }
    }

    //handles the redirect with CODE sent from planning center api
    else if(isset($_SESSION['login_username'])){
        // This will always request a new access token, to login without requesting a new token see login-redirect.php
        //sends auth code
        $url = "https://api.planningcenteronline.com/oauth/token";
        $data_array = array(
            'grant_type' => 'authorization_code',
            'code' => $_GET['code'],
            'client_id' => '3053bd24aa4ba94cc6c2e4dfe3784bf57a767e31ea94776a4bb05d00291aa2e6',
            'client_secret' => '86a47f13962a3f7efca0f203855d67020d37c0cd55541f5e645084ca55246d71',
            'redirect_uri' => 'http://192.168.4.40:5000/multi-link.live/auth/register-redirect.php'
        );

        $data = http_build_query($data_array);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $resp = curl_exec($ch);

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($e = curl_error($ch)) {
            header("location: ../pages/signIn.php?e=error");
            exit;
        }
        else if ($httpCode == 401){
            header("location: ../pages/signIn.php?e=pcoAuth&code=" . $_GET['code']);
            exit;
        }
        else {
            //successfully got access_token and refresh_token
            $decoded = json_decode($resp);



            $url = $NODE_DOMAIN . '/users';
            $ch = curl_init();

            $data_array = array(
                'accessToken' => $decoded->access_token,
                'refreshToken' => $decoded->refresh_token,
                'username' => $_SESSION['login_username']
            );

            $data = json_encode($data_array);

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            //sends access_token and refresh_token to db
            $resp = curl_exec($ch);

            if ($e = curl_error($ch)) {
                header('Location: ../pages/signIn.php?e=serverError');
                exit;
            }
            else {
                $decoded = json_decode($resp);
                session_start();

                try {
                    $_SESSION['db_id'] = $decoded->db_id;
                    if ($_SESSION['db_id'] == null) throw new Exception('no db_id');
                    else if ($decoded->warning) throw new Exception('warning');
                }

                catch (exception $e) {
                    if ($decoded->message) {
                        header('location: ../pages/signIn.php?e=' . $decoded->message . '&d=' . implode(",", $decoded->details));
                        exit;
                    }
                    else if ($decoded->warning) {
                        header('location: ../../app.multi-link.live/index.php?w=' . $decoded->warning);
                        exit;
                    }
                    else {
                        header("Location: ../pages/signIn.php?e=nullId");
                        exit;
                    }
                }
                
    
                header("Location: ../../app.multi-link.live/index.php");
                exit;
            }
            curl_close($ch);
        }
    }
    else {
        header('location: ../pages/signIn.php?e=noUsername');
        exit;
    }
    

        
        
    ?>
   
</body>
</html>