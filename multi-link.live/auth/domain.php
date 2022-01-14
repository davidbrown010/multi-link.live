<?php
$PHP_DOMAIN = ($_SERVER['SERVER_NAME'] == 'localhost' ? 'http://' : 'https://') . $_SERVER['SERVER_NAME'];
if ($PHP_DOMAIN == 'http://localhost') $PHP_DOMAIN .= ':' . $_SERVER['SERVER_PORT'];
$NODE_DOMAIN = 'http://localhost:3000';
//$NODE_DOMAIN = 'https://multi-link-api.herokuapp.com';
