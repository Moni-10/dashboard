<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
$origin=$_SERVER['HTTP_ORIGIN']??'';
if(in_array($origin,['http://localhost:5173','http://127.0.0.1:5173'],true)){header('Access-Control-Allow-Origin: '.$origin);header('Vary: Origin');}
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code(204);exit;}
$requestedKey=(string)($_GET['key']??'all-products');
$defaults=['eyebrow'=>'OUR MACHINES','heading'=>'Industrial printing machines','description'=>'Explore precision-built printing and converting solutions.','banner_image'=>'','range_eyebrow'=>'OUR PRODUCT RANGE','range_heading'=>'Find the right machine for your application.','range_description'=>'Open a product to view its complete specifications and details.'];
if($_SERVER['REQUEST_METHOD']==='GET'){$key=preg_replace('/[^a-z0-9-]/','',strtolower($requestedKey))?:'all-products';$file=__DIR__.'/data/catalog-page-'.$key.'.json';if($key==='all-products'&&!is_file($file))$file=__DIR__.'/data/catalog-page.json';$saved=is_file($file)?json_decode((string)file_get_contents($file),true):[];echo json_encode(['success'=>true,'key'=>$key,'settings'=>array_merge($defaults,is_array($saved)?$saved:[])]);exit;}
$input=json_decode((string)file_get_contents('php://input'),true);
if(!is_array($input)){http_response_code(400);echo json_encode(['success'=>false,'message'=>'Invalid data']);exit;}
$key=preg_replace('/[^a-z0-9-]/','',strtolower((string)($input['page_key']??'all-products')))?:'all-products';
$file=__DIR__.'/data/catalog-page-'.$key.'.json';
$settings=[];foreach($defaults as $key=>$value)$settings[$key]=trim((string)($input[$key]??''));
if(!is_dir(dirname($file)))mkdir(dirname($file),0775,true);
$ok=file_put_contents($file,json_encode($settings,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES),LOCK_EX)!==false;
echo json_encode(['success'=>$ok,'key'=>$key,'settings'=>$settings]);
