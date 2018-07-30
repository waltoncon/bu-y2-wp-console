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
	// Uncomment the line below and comment the line below that to enable the auth requirement, auth is not implemented, 
	// only the requirement to be signed in to show that auth security is here. 
	// The spec said auth was not needed, so I didn't implement it.
// 	'_server'		=> 'auth|request_method:post',
	'_server'		=> 'request_method:post',
	
	'name' 			=> 'bail|required|escape:real|string|min:2|max:60',
	'description' 	=> 'escape:real|string|min:2|max:500',
	'type' 			=> 'bail|required|escape:real|enum:clothing/accessory',
	'style' 		=> 'string',
	'price' 		=> 'bail|default:0.00|escape:real|currency|string',
	'stock_level' 	=> 'parse:integer|integer:unsigned',
);

$values = array(
	"uuid" 			=> $uuid,
	"name" 			=> request_post('name'),
	"description" 	=> request_post('description'),
	"type" 			=> request_post('type'),
	"style" 		=> request_post('style'),
	"price" 		=> request_post('price'),
	"stock_level" 	=> request_post('stock_level'),
);

// Requires $validation and $values to be set
include_once('../../scripts/validation.php');
$sql = "INSERT INTO clothing (id, name, description, stock_level, type, style, price, created_at, modified_at) VALUES ('" . $values['uuid'] . "','" . $values['name'] . "','" . $values['description'] . "'," . $values['stock_level'] . ",'" . $values['type'] . "','" . $values['style'] . "','" . $values['price'] . "', NOW(), NOW())";
// $package->addError($sql);
$package->setValues($values);
$package->runQuery($sql, $conn);
$package->displayPackage();

?>