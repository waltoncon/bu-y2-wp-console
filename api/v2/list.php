<?php

include "../../scripts/mysql.php";
include "../../scripts/main.php";
include "../../scripts/package.php";

use scripts\package;

$meta = array(
	"action" => "list",
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
	'offset' 	=> 'default:0|parse:integer'
);

$values = array(
	'orderby' 	=> request_get('orderby'),
	'direction' => request_get('direction'),
	'limit' 	=> request_get('limit'),
	'offset' 	=> request_get('offset'),
);

// Requires $validation and $values to be set
include_once('../../scripts/validation.php');

$orderby = 'ORDER BY ' . $values['orderby'] . ' ' . $values['direction'];

$sql = "SELECT * FROM clothing " . $orderby . " LIMIT " . $values['limit'] . " OFFSET " . $values['offset'] . ";";
$values['sql'] =$sql;
$result = $package->runQuery($sql, $conn);
$data = array();
while($row = $result->fetch_assoc()){
	$data[] = $row;
}
$values['count'] = $result->num_rows;

$sql_total = "SELECT count(id) AS 'total' FROM clothing;";
$result_total = $conn->query($sql_total);
$total = $result_total->fetch_assoc();
$values['total'] = intval($total['total']);


$package->setValues($values);
$package->setData($data);
$package->displayPackage();

?>