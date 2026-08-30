<?php
declare(strict_types=1);
require_once __DIR__.'/lib/bootstrap.php';
$route=slugify((string)($_GET['route']??''));
$categories=machine_categories();
$store=read_store();
foreach((array)($store['categories']??[]) as $category)$categories[]=(string)$category;
foreach(products(true) as $item){$category=trim((string)($item['category']??''));if($category!=='')$categories[]=$category;}
foreach(array_unique($categories) as $category){if(slugify($category)===$route){$_GET['category']=$category;require __DIR__.'/products.php';exit;}}
if(product_by_slug($route)){$_GET['slug']=$route;require __DIR__.'/product.php';exit;}
http_response_code(404);
$pageTitle='Page not found';$metaDescription='The requested machine category or product could not be found.';
require __DIR__.'/header.php';
echo '<main><section class="section-space"><div class="container"><h1>Page not found</h1><p>This machine page is not available.</p><a href="products.php">View all machines</a></div></section></main>';
require __DIR__.'/footer.php';
