<?php

include "../../scripts/mysql.php";
include "../../scripts/main.php";
include "../../scripts/package.php";

use scripts\package;

$meta = array(
	"action" => "add",
	"item" => "product",
	'success_message' => 'Product added successfully',
	'error_message' => 'There was an error while adding the product'
);
$package = new package($meta);
	
$uuid = gen_uuid();

$validate = array(
	'_server'		=> 'request_method:post',
	
	'name' 			=> 'bail|required|escape:real|string|min:2|max:60',
	'description' 	=> 'escape:real|string|min:2|max:500',
	'type' 			=> 'bail|required|escape:real|enum:clothing/accessory',
	'style' 		=> 'string',
	'price' 		=> 'bail|default:0.00|escape:real|currency|string',
	'stock_level' 	=> 'parse:integer|integer:unsigned',
);

$values = array(
	"uuid" 			=> request_post('uuid'),
	"name" 			=> request_post('name'),
	"description" 	=> request_post('description'),
	"type" 			=> request_post('type'),
	"style" 		=> request_post('style'),
	"price" 		=> request_post('price'),
	"stock_level" 	=> request_post('stock_level'),
);
// $package->addError($_POST['description'], 'desc');

// Requires $validation and $values to be set
include_once('../../scripts/validation.php');
$sql = "UPDATE clothing SET `name`='" . $values['name'] . "', `description`='" . $values['description'] . "', `stock_level`='" . $values['stock_level'] . "', `type`='" . $values['type'] . "', `style`='" . $values['style'] . "', `price`='" . $values['price'] . "'  WHERE `id`='" . $values['uuid'] . "'";
// $package->addError($sql);
$package->setValues($values);
$package->runQuery($sql, $conn);
$package->displayPackage();

?>