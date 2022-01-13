<?php
include_once '../../multi-link.live/auth/domain.php';

$ch = curl_init();
$url = $NODE_DOMAIN . '/users';

$params = array('userId' => $_SESSION['db_id']);
//server isn't receiving userId
curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$resp = curl_exec($ch);

if ($e = curl_error($ch)) {
    curl_close($ch);
    header('location: ' . $ROOT . '/multi-link.live/pages/signIn.php?e=serverError');
    exit;
} else {
    $decoded = json_decode($resp);
    
    if (isset($decoded->message)) {
        header('location: ' . $ROOT . '/multi-link.live/pages/signIn.php?e=serverErrorEmptyRequest');
        exit;
    }
    

    $_SESSION['user_PCO_id'] = $decoded -> userPCO_Id;
    $_SESSION['user_username'] = $decoded -> username;
    $_SESSION['user_first_name'] = $decoded -> firstName;
    $_SESSION['user_last_name'] = $decoded -> lastName;
    $_SESSION['user_birthdate'] = $decoded -> birthdate;
    $_SESSION['user_profile_photo_URL'] = $decoded -> profilePhotoURL;
    $_SESSION['user_profile_photo_URL_thumbnail'] = $decoded -> profilePhotoURLThumbnail;
    $_SESSION['user_permission_level'] = $decoded -> permissionLevel;
    $_SESSION['user_manual_connection'] = $decoded -> manualConnection;
    $_SESSION['user_dark_mode'] = $decoded -> darkMode;
    $_SESSION['user_recent_plan'] = $decoded -> recentPlan;
    $_SESSION['user_default_room'] = $decoded -> defaultRoom;
    $_SESSION['user_default_service_type'] = $decoded -> defaultServiceType;

    curl_close($ch);

}