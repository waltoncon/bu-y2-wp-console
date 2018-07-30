<?php

include "../../scripts/mysql.php";
include "../../scripts/main.php";
include "../../scripts/package.php";

use scripts\package;

$meta = array(
	"action" => "delete",
	"item" => "product",
	'success_message' => 'Product deleted successfully',
	'error_message' => 'There was an error while deleting the product'
);
$package = new package($meta);

$validate = array(
	'_server'		=> 'request_method:get',
	'uuid'			=> 'bail|required|uuid'
);

$values = array(
	"uuid" 			=> request_get('id'),
);

// Requires $validation and $values to be set
include_once('../../scripts/validation.php');
$sql = "DELETE FROM `clothing` WHERE `clothing`.`id` = '" . $values['uuid'] . "';";
// $package->addError($sql);
$package->setValues($values);
$package->runQuery($sql, $conn);
$package->displayPackage();

?>