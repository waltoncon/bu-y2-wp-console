<?php

// $errors = array();
session_start();
$bail_force = false;

if(isset($validate['_server'])){
	$server = $validate['_server'];
	$requirements = explode('|', $server);
	$die = false;
	foreach($requirements as $requirement){
		
		if($bail_force){
			break;
		}
		
		switch($requirement){
			case startsWith('request_method', $requirement):
				$params = explode(':', $requirement);
				$request = $params[1];
				$method = $_SERVER['REQUEST_METHOD'];
				if(strcasecmp($method, $request)){
// 					$errors['server'][] = 'Incorrect request method used, must be ' . $request;
					$package->addError('Incorrect request method used, ' . $request . ' must be used but was requested over ' . $method, 'server');
					$bail_force = true;
				}
				break;
			case startsWith('auth', $requirement):
				// This section would be uncommented when authentication is implemented, it was not required in the spec, so I didn't make it.
// 				$params = explode(':', $requirement);
// 				$request = $params[1];
				if(!isset($_SESSION['user'])){
// 					$errors['server'][] = 'Incorrect request method used, must be ' . $request;
					$package->addError('You must be signed in to do this.', 'server');
					$bail_force = true;
				}
				break;
		}
		
	}
	unset($validate['_server']);
}


foreach($validate as $i => $v){
	
	
	// Reqruirements of the field to validate
	$requirements = explode('|', $v);
	
	$bail = false;
	
	// Check each validation rule against the field
	foreach($requirements as $requirement){
		$curr = $values[$i];
		$empty = empty($curr);
		$null = is_null($curr);
		$fail = false;
		$required = in_array('required', $requirements);
		$strlen = strlen($curr);
		
		// Run one validation rule
		switch($requirement){
				
			// PARSE VARIABLES
			case startsWith('default', $requirement):
				$params = explode(':', $requirement);
				$default = $params[1];
				if(strlen($curr) == 0){
					$values[$i] = $default;
				}
				break;
				
			// PARSE VARIABLES
			case startsWith('parse', $requirement):
				$params = explode(':', $requirement);
				$type = $params[1];
				if($type == 'integer'){
					$values[$i] = intval($curr);
				} else if($type == 'double') {
					$values[$i] = doubleval($curr);
				}
				break;
				
				
			// ESCAPE VARIABLES
			case startsWith('escape', $requirement):
				$params = explode(':', $requirement);
				$type = $params[1];
				if($type == "real"){
					$values[$i] = $conn->real_escape_string($curr);
				} else if($type == 'addslashes'){
					$values[$i] = addslashes($curr);
				} else if($type == 'default') {
					$values[$i] = $conn->escape_string($curr);
				} else if($type == 'htmlspecialchars'){
					$values[$i] = htmlspecialchars($curr);
				} else if($type == 'htmlentities'){
					$values[$i] = htmlentities($curr);
				}
				break;
			
			
			// BAIL THE REMAINING VALIDATION RULES AFTER FIRST FAILURE
			
			////
			// STRING ATTRIBUTES
			////
			// REQUIRED
			case startsWith('required', $requirement) && $bail == false:
				$message = ($i . " is required");
				if($empty || $null){
					$fail = true;
				};
				break;
			////
				
			////
			// STRING TYPES
			////
			// CURRENCY
			// Regex by Tim Pietzcker on http://stackoverflow.com/questions/4982291
			case startsWith('currency', $requirement) && $bail == false:
				$message = ($curr . " is not a valid currency for the " . $i . " field.");
				if(preg_match('/^\b\d{1,3}(?:,?\d{3})*(?:\.\d{2})?\b$/', $curr) == 0 && strlen($curr) > 0){
					$fail = true;
				}
				break;
			// ENUM
			case startsWith('enum', $requirement) && $bail == false:
				$params = explode(':', $requirement);
				$allowed = explode('/', $params[1]);
				$message = ($curr . " is not an allowed value for the " . $i . " field.");
				if(!in_array($curr, $allowed)){
					$fail = true;
				}
				break;
			case startsWith('integer', $requirement) && $bail == false:
				$params = explode(':', $requirement);
				$unsigned = explode('/', $params[1]);
				$message = ($curr . " is not an integer value for the " . $i . " field.");
				if(!is_int($curr)){
					$fail = true;
				}
				break;
			case startsWith('string', $requirement) && $bail == false:
				$message = ($i . " requires a string.");
				if(!is_string($curr)){
					$fail = true;
				}
				break;
			case startsWith('uuid', $requirement) && $bail == false:
				$message = ($i . " requires a uuid.");
				if(!is_uuid($curr)){
					$fail = true;
				}
				break;
			////
				
			////
			// STRING LENGTH
			////
			// MAX
			case startsWith('max', $requirement) && $bail == false:
				$params = explode(':', $requirement);
				$max_length = $params[1];
				$message = ucfirst("The value in the " . $i . " field is too long, the maximum length is " . $max_length);
				if(strlen($curr) > $max_length){
					$fail = true;
				}
				break;
				
			// MIN
			case startsWith('min', $requirement) && $bail == false:
				$params = explode(':', $requirement);
				$min_length = $params[1];
				$message = ucfirst($curr . " is too short for the " . $i . " field, the minimum length is " . $min_length);
				if(($strlen < $min_length && $required) || ($strlen < $min_length && !$required)){
					$fail = true;
				}
				if(($strlen >= $min_length && $required) || ($strlen >= $min_length && !$required) || ($strlen == 0 && !$required)){
					$fail = false;
				}
				break;
		}
		
		if($fail){
			$package->addError($message, $i);
		}
		if(in_array('bail', $requirements) && $package->countErrors() > 0){
			$bail = true;
		}
		
	}
	
	
	
	
}


?>