<?php
$PROTOCOL = isset($_SERVER['HTTPS']) ? 'https://' : 'http://';
$PHP_DOMAIN = $PROTOCOL . $_SERVER['SERVER_NAME'];
if ($PHP_DOMAIN == 'http://localhost') $PHP_DOMAIN .= ':' . $_SERVER['SERVER_PORT'];
$NODE_DOMAIN = 'localhost:3000';
