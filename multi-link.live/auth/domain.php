<?php
$PROTOCOL = !isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == 'off' ? 'http://' : 'https://';
$PHP_DOMAIN = $PROTOCOL . $_SERVER['SERVER_NAME'];
if ($PHP_DOMAIN == 'http://localhost') $PHP_DOMAIN .= ':' . $_SERVER['SERVER_PORT'];
//$NODE_DOMAIN = 'http://localhost:3000';
$NODE_DOMAIN = 'https://multi-link-api.herokuapp.com';
