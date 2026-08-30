<?php
declare(strict_types=1);
define('APP_ROOT',dirname(__DIR__));
define('DATA_FILE',APP_ROOT.'/data/products.json');
define('UPLOAD_DIR',APP_ROOT.'/assets/img/products');
if(session_status()!==PHP_SESSION_ACTIVE){session_name('mmw_admin');session_start();}
function h(?string $value):string{return htmlspecialchars((string)$value,ENT_QUOTES,'UTF-8');}
function slugify(string $value):string{$value=strtolower(trim(preg_replace('/[^A-Za-z0-9]+/','-',$value),'-'));return $value!==''?$value:'product-'.time();}
function read_store():array{if(!is_file(DATA_FILE))return ['products'=>[],'categories'=>[]];$data=json_decode((string)file_get_contents(DATA_FILE),true);return is_array($data)?$data:['products'=>[],'categories'=>[]];}
function write_store(array $data):bool{$dir=dirname(DATA_FILE);if(!is_dir($dir))mkdir($dir,0775,true);$fp=fopen(DATA_FILE,'c+');if(!$fp)return false;flock($fp,LOCK_EX);ftruncate($fp,0);rewind($fp);$ok=fwrite($fp,json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES))!==false;fflush($fp);flock($fp,LOCK_UN);fclose($fp);return $ok;}
function products(bool $activeOnly=false):array{$items=read_store()['products']??[];if($activeOnly)$items=array_values(array_filter($items,fn($p)=>!empty($p['active'])));usort($items,fn($a,$b)=>($a['position']??999)<=>($b['position']??999));return $items;}
function contact_config():array{$file=APP_ROOT.'/data/contact.json';$data=is_file($file)?json_decode((string)file_get_contents($file),true):[];return is_array($data)?$data:[];}
function product_by_slug(string $slug):?array{foreach(products() as $product)if(($product['slug']??'')===$slug)return $product;return null;}
function machine_categories():array{return ['Rotogravure Printing Machine','MLS Rotogravure Printing Machine','Shafted Rotogravure Printing Machine','Shafted MLS Rotogravure Printing Machine','Shaftless Rotogravure Printing Machine','MLS Shaftless Rotogravure Printing Machine','Pharmaceutical Foil Rotogravure Printing Machine'];}
function admin_logged_in():bool{return !empty($_SESSION['admin']);}
function require_admin():void{if(!admin_logged_in()){header('Location: index.php');exit;}}
function csrf_token():string{if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));return $_SESSION['csrf'];}
function valid_csrf():bool{return isset($_POST['csrf'],$_SESSION['csrf'])&&hash_equals($_SESSION['csrf'],(string)$_POST['csrf']);}
function admin_password():string{return getenv('MMW_ADMIN_PASSWORD')?:'Admin@123';}
function admin_email():string{return getenv('MMW_ADMIN_EMAIL')?:'admin@mohindraroto.com';}
function save_upload(string $field,string $existing=''):string{if(empty($_FILES[$field]['tmp_name'])||$_FILES[$field]['error']!==UPLOAD_ERR_OK)return $existing;$allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];$mime=(new finfo(FILEINFO_MIME_TYPE))->file($_FILES[$field]['tmp_name']);if(!isset($allowed[$mime])||$_FILES[$field]['size']>5*1024*1024)throw new RuntimeException('Image must be JPG, PNG or WebP and below 5MB.');if(!is_dir(UPLOAD_DIR))mkdir(UPLOAD_DIR,0775,true);$name=bin2hex(random_bytes(10)).'.'.$allowed[$mime];if(!move_uploaded_file($_FILES[$field]['tmp_name'],UPLOAD_DIR.'/'.$name))throw new RuntimeException('Image upload failed.');return 'assets/img/products/'.$name;}
