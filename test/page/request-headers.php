<?php
header('content-type: application/json');
echo json_encode(apache_request_headers());
?>
