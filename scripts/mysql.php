<?php


$conn = new mysqli(
	"localhost",
	"root",
	"root",
	"bu-y2-wp-console"
);

if ($conn->connect_error) {
	trigger_error('Database connection failed: '  . $conn->connect_error, E_USER_ERROR);
}

?>
