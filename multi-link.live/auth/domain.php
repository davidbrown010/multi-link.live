<?php

$PHP_DOMAIN = $_SERVER['SERVER_NAME'];
if ($PHP_DOMAIN == 'localhost') $PHP_DOMAIN .= ':' . $_SERVER['SERVER_PORT'];
$NODE_DOMAIN = 'localhost:3000';