<?php 

// $final = array(
// 	"type" => "add#item",
// 	"success" => false,
// 	"message" => "",
// 	"errors" => array(),
// 	"data" => array(),
// 	"request" => $values
// );

namespace scripts;

class package {
	
	private $type = null;
	private $success = false;
	private $message = "";
	private $error_message = "Errors occured";
	private $success_message = "Success!";
	private $errors = array();
	private $data = array();
	private $values = array();
	
	
	function __construct($meta){
		$this->type = $meta['action'] . '#' . $meta['item'];
// 		if(isset($meta['success_message'])){
			$this->success_message = $meta['success_message'];
// 		}
// 		if(isset($meta['error_message'])){
			$this->error_message = $meta['error_message'];
// 		}
	}
	
	////
	// SETTERS
	////
	
	public function setErrors($errors){
		$this->errors = $errors;
	}
	
	public function setValues($values){
		$this->values = $values;
	}
	
	public function setData($data){
		$this->data = $data;
	}
	
	public function setMessage($message){
		$this->message = $message;
	}
	
	public function setType($type){
		$this->type = $type;
	}
	
	public function success(){
		$this->success = true;
	}
	
	public function fail(){
		$this->success = false;
	}
	
	public function addError($error, $name = null){
		if(is_null($name)){
			$this->errors[] = $error;
		} else {
			$this->errors[$name][] = $error;
		}
	}
	
	public function mergeErrors($errors){
		$this->errors = array_merge($this->errors, $errors);
	}
	
	public function countErrors(){
		return count($this->errors);
	}
	
	
	////
	// GETTERS
	////
	public function getErrors(){
		return $this->errors;
	}
	
	public function getValues(){
		return $this->values;
	}
	
	public function getMessage(){
		return $this->message;
	}
	
	public function getSuccess(){
		
		if($this->hasErrors()){
			$this->fail();
			$this->message = $this->error_message;
		} else {
			$this->message = $this->success_message;
		}
		
		return $this->success;
	}
	
	public function getType(){
		return $this->type;
	}
	
	public function hasErrors(){
		return !empty($this->errors);
	}
	
	public function getFinal(){
		
		$final_package = array();
		
		if(!empty($this->type)){
			$final_package['type'] = $this->type;
		}
		$final_package['success'] = $this->getSuccess();
		if(!empty($this->message)){
			$final_package['message'] = $this->message;
		}
		if(!empty($this->errors)){
			$final_package['errors'] = $this->errors;
		}
		if(!empty($this->values) && $this->getSuccess()){
			$final_package['values'] = $this->values;
		}
		if(!empty($this->data)){
			$final_package['data'] = $this->data;
		}
		
		return $final_package;
		
	}
	
	public function displayPackage(){
		header('Content-Type: application/json');
		echo json_encode($this->getFinal());
		
	}
	
	public function runQuery($query, $conn){
		if(!$this->hasErrors()){
			$result = $conn->query($query);
			if($conn->error){
				$this->addError('A connection error occured, please try again later', 'connection');
				$this->fail();
			} else {
				$this->success();
			}
			return $result;
		}
	}
	
	public function fetchAssoc($result){
		if(!$this->hasErrors()){
			$data = array();
			while($row = $result->fetch_assoc()){
				$data[] = $row;
			}
			return $data;
		} else {
			return false;
		}
	}
	
}

?>