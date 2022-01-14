<?php
    $ROOT = '..';
    include_once $ROOT . '/header.php';
?>
<link rel='stylesheet' href="<?php echo $ROOT?>/styles/account.css">

<link href="<?php echo $ROOT . '/styles/account.css'?>" rel='stylesheet'/>
<section class='profileBackground'></section>
<section class = 'profileDetails' >
    <img src="<?php echo $_SESSION['user_profile_photo_URL'];?>">
    <div class='profileInfoWrapper'>
        <h1><?php echo $_SESSION['user_first_name'];?></h1>
        <h2><?php echo $_SESSION['user_permission_level'];?></h2>
        <h3><?php echo $_SESSION['user_username'];?></h3>
    </div>
</section>
<form class = 'userSettings' action='../auth/updateUser.php' method='post'>
    <div>
        <span class='material-icons'>list</span>
        <label for="defaultServiceType">Default Service Type</label>
        <select required name="defaultServiceType">
            <option value="<?php echo $_SESSION['user_default_service_type'];?>" selected></option>
        </select>
    </div>
    <div>
        <span class='material-icons'>door_front</span>
        <label for="defaultRoom">Default Room</label>
        <select required name="defaultRoom">
            <option value="<?php echo $_SESSION['user_default_room'];?>" selected></option>
        </select>
    </div>
    <div>
        <span class='material-icons'>dark_mode</span>
        <label for="darkMode">Dark Mode</label>
        <input <?php if ($_SESSION['user_dark_mode']) echo 'checked'?> type='checkbox' required name="darkMode">
    </div>
    <div>
        <span class='material-icons'>wifi_tethering</span>
        <label for="manualConnection">Manual Connection</label>
        <input <?php if ($_SESSION['user_manual_connection']) echo 'checked'?> type='checkbox' required name="manualConnection">
    </div>
    <button type="submit" name="submit">SAVE</button>
</form>

<a href='../auth/logout.php' class = 'actionButton redButton logoutButton' >LOG OUT</a>

<?php
    include_once $ROOT . '/footer.php';
?>
 