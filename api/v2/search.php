<?php

include "../../scripts/mysql.php";
include "../../scripts/main.php";
include "../../scripts/package.php";

use scripts\package;

$meta = array(
	"action" => "search",
	"item" => "product",
	'success_message' => 'Products listed successfully',
	'error_message' => 'There were one or more errors while getting the product list'
);
$package = new package($meta);

$validate = array(
	'_server'	=> 'request_method:get',
	
	'orderby' 	=> 'default:created_at|enum:name/created_at/modified_at/stock_level/price',
	'direction' => 'default:asc|enum:asc/desc',
	'limit' 	=> 'default:10|parse:integer',
	'offset' 	=> 'default:0|parse:integer',
	'q'			=> 'bail|required|string'
);

$values = array(
	'orderby' 	=> request_get('orderby'),
	'direction' => request_get('direction'),
	'limit' 	=> request_get('limit'),
	'offset' 	=> request_get('offset'),
	'q'			=> request_get('q')
);

// Requires $validation and $values to be set
include_once('../../scripts/validation.php');

$orderby = 'ORDER BY ' . $values['orderby'] . ' ' . $values['direction'];

// $sql = "SELECT * FROM clothing " . $orderby . " LIMIT " . $values['limit'] . " OFFSET " . $values['offset'] . ";";
$sql = "SELECT * FROM `clothing` WHERE `id` = '" . $values['q'] . "' OR `name` LIKE '%" . $values['q'] . "%' OR `description` LIKE '%" . $values['q'] . "%' OR `stock_level` LIKE '%" . $values['q'] . "%' OR `type` LIKE '%" . $values['q'] . "%' OR `style` LIKE '%" . $values['q'] . "%' OR `price` LIKE '%" . $values['q'] . "%' AND `created_at` = '" . $values['q'] . "' OR `modified_at` = '" . $values['q'] . "' " . $orderby . " LIMIT " . $values['limit'] . " OFFSET " . $values['offset'] . ";";
$result = $package->runQuery($sql, $conn);
$data = $package->fetchAssoc($result);
$values['count'] = $result->num_rows;

$sql_total = "SELECT count(id) as total FROM `clothing` WHERE `id` = '" . $values['q'] . "' OR `name` LIKE '%" . $values['q'] . "%' OR `description` LIKE '%" . $values['q'] . "%' OR `stock_level` LIKE '%" . $values['q'] . "%' OR `type` LIKE '%" . $values['q'] . "%' OR `style` LIKE '%" . $values['q'] . "%' OR `price` LIKE '%" . $values['q'] . "%' AND `created_at` = '" . $values['q'] . "' OR `modified_at` = '" . $values['q'] . "';";
$result_total = $conn->query($sql_total);
$total = $package->fetchAssoc($result_total);
// $total = $result_total->fetch_assoc();
// $package->addError($total);
$values['total'] = intval($total[0]['total']);


$package->setValues($values);
$package->setData($data);
$package->displayPackage();

?>