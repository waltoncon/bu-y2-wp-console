<?php

// This script is just here to add items to the consoles database quickly

/*
Use this to create the clothing table

create table if not EXISTS clothing (
	id VARCHAR(32), 
	name VARCHAR(60), 
	description TEXT, 
	stock_level INTEGER, 
	type ENUM('clothing','accessory'), 
	style VARCHAR(100), 
	price FLOAT, 
	created_at DATETIME, 
	modified_at DATETIME
)

*/


$url = $_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']) . '/api/v2/add.php';

$items = array(
	array('Marvel top', 'A marvel avengers image t-shirt', 'clothing', 'Image t-shirt', '9.99', '1592'),
	array('Driving gloves', 'black leather driving gloves', 'accessory', 'leather gloves', '14.99', '854'),
	array('Justice top', 'Justice band t-shirt', 'clothing', 'Image t-shirt', '19.99', '591'),
	array('DC top', 'A DC X-Men image t-shirt', 'clothing', 'Image t-shirt', '7.99', '792'),
	array('Perl necklace', 'Fancy orange pearl necklace', 'accessory', 'Necklace', '29.99', '624'),
	array('Plain t-shirt', 'Plain white t-shirt', 'clothing', 'T-shirt', '2.99', '5234'),
	array('Plain t-shirt', 'Plain black t-shirt', 'clothing', 'T-shirt', '2.99', '5123'),
	array('Marvel top', 'A marvel avengers image t-shirt', 'accessory', 'Gloves', '50.00', '345'),
	array('Ray Bans', 'Ray Ban sunglasses', 'accessory', 'Sunglasses', '40', '387'),
	array('Aviators', 'Aviator style sunglasses', 'accessory', 'Sunglasses', '99.99', '752'),
	array('Winter coat', 'Hooded winter coat with soft padding', 'clothing', 'Image t-shirt', '46', '268'),
	array('Navy blue bag', 'Navy blue two strap backpack', 'accessory', 'Image t-shirt', '48', '346'),
	array('Fitbit', 'Sports tracking fitbit', 'accessory', 'Image t-shirt', '158', '23'),
	array('Raincoat', 'Red raincoat', 'clothing', 'Image t-shirt', '64.49', '1398'),
);


header('Content-Type: application/json');

$final = '{
	"message": "Data successfully added to database",
	"json": "Try https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa to make the json look nice",
	"info": "This was completed using the v2 add api, each item in the data below is a seperate add request.",
	"info_count": "' . count($items) . ' items have been added to the database",
	"link_to_console": "http://student30389.bucomputing.uk/console",
	"data": [';

$i = 1;
foreach($items as $item){
	
	$values = array(
		'name' => $item[0],
		'description' => $item[1],
		'type' => $item[2],
		'style' => $item[3],
		'price' => $item[4],
		'stock_level' => $item[5]
	);
	
	$options = array(
			'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => http_build_query($values),
		)
	);

	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);
	$final .= $result;
	
	if($i != count($items)){
		$final .= ',';
	}
	
	$i++;
}
$final .= ']}';

echo $final;




?>
