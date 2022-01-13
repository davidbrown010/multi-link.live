<?php

$PROTOCOL = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443 ? 'https://' : 'http://';
$PHP_DOMAIN = $PROTOCOL . $_SERVER['SERVER_NAME'];
if ($PHP_DOMAIN == 'http://localhost') $PHP_DOMAIN .= ':' . $_SERVER['SERVER_PORT'];
$NODE_DOMAIN = 'https://multi-link-api.herokuapp.com';
