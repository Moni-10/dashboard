<?php
require_once __DIR__ . '/lib/bootstrap.php';
$items = products(true);
$selectedCategory=trim((string)($_GET['category']??''));
if($selectedCategory!=='')$items=array_values(array_filter($items,fn($item)=>strcasecmp(trim((string)($item['category']??'')),$selectedCategory)===0));
$contact = contact_config();
$catalogDefaults=['eyebrow'=>'OUR MACHINES','heading'=>'Industrial printing machines','description'=>'Explore precision-built printing and converting solutions.','banner_image'=>'','range_eyebrow'=>'OUR PRODUCT RANGE','range_heading'=>'Find the right machine for your application.','range_description'=>'Open a product to view its complete specifications and details.'];
$catalogKey=$selectedCategory!==''?slugify($selectedCategory):'all-products';
$catalogFile=__DIR__.'/data/catalog-page-'.$catalogKey.'.json';
if($catalogKey==='all-products'&&!is_file($catalogFile))$catalogFile=__DIR__.'/data/catalog-page.json';
$catalogSaved=is_file($catalogFile)?json_decode((string)file_get_contents($catalogFile),true):[];
$catalog=array_merge($catalogDefaults,is_array($catalogSaved)?$catalogSaved:[]);
if($selectedCategory!==''&&!is_file(__DIR__.'/data/catalog-page-'.$catalogKey.'.json')){$catalog['heading']=$selectedCategory;$catalog['range_heading']=$selectedCategory.' products';$catalog['banner_image']='';}
$pageTitle = 'Rotogravure Printing Machines | Mohindra Mechanical Works';
$metaDescription = 'Explore our range of industrial rotogravure printing and converting machines engineered for reliable production.';
include 'header.php';
?>
<?php if (($_GET['enquiry'] ?? '') === 'sent'): ?><div class="enquiry-alert success">Thank you. Your enquiry has been sent successfully to our team.</div><?php elseif (($_GET['enquiry'] ?? '') === 'saved'): ?><div class="enquiry-alert warning">Your enquiry is saved. Email delivery needs to be enabled on the hosting server.</div><?php elseif (($_GET['enquiry'] ?? '') === 'invalid'): ?><div class="enquiry-alert error">Please complete all required enquiry fields.</div><?php endif; ?>
<main class="catalog-page">
    <section class="catalog-hero catalog-hero-compact<?= $catalog['banner_image']?' has-banner':'' ?>"<?= $catalog['banner_image']?' style="--catalog-banner:url('.h($catalog['banner_image']).')"':'' ?>>
        <div class="container">
            <nav class="catalog-breadcrumb"><a href="index.php">Home</a><span>/</span><strong><?= $selectedCategory!==''?h($selectedCategory):'Our Machines' ?></strong></nav>
            <div class="catalog-hero-inner">
                <div><span class="catalog-eyebrow"><?= h($catalog['eyebrow']) ?></span>
                    <h1><?= h($catalog['heading']) ?></h1>
                    <?php if($catalog['description']): ?><p><?= h($catalog['description']) ?></p><?php endif; ?>
                </div>
            </div>
        </div>
    </section>
    <section class="catalog-intro" id="product-range">
        <div class="container">
            <div class="catalog-title">
                <div><span><?= h($catalog['range_eyebrow']) ?></span>
                    <h2><?= h($catalog['range_heading']) ?></h2>
                </div>
            </div>
            <div class="catalog-tools"><label>🔍 <input id="product-search" type="search" placeholder="Search machines or categories..." autocomplete="off"></label>
            </div><?php if ($items): ?><div class="catalog-grid"><?php foreach ($items as $i => $p): ?><article class="catalog-card" data-search="<?= h(strtolower(($p['name'] ?? '') . ' ' . ($p['category'] ?? '') . ' ' . ($p['short_description'] ?? ''))) ?>"><a class="catalog-media" href="<?= h($p['slug']) ?>.php"><img src="<?= h($p['image']) ?>" alt="<?= h($p['name']) ?>" loading="<?= $i < 3 ? 'eager' : 'lazy' ?>"><span class="catalog-category"><?= h($p['category'] ?: 'Printing Technology') ?></span><span class="catalog-number"><?= str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT) ?></span><span class="catalog-view">↗</span></a>
                            <div class="catalog-card-body">
                                <h3><a href="<?= h($p['slug']) ?>.php"><?= h($p['name']) ?></a></h3>
                                <p><?= h($p['short_description']) ?></p>
                                <div class="catalog-card-footer"><a href="<?= h($p['slug']) ?>.php">View details →</a><button type="button" class="card-enquiry" data-product="<?= h($p['name']) ?>">Enquiry</button></div>
                                <div class="catalog-contact"><a class="whatsapp" target="_blank" rel="noopener" href="https://wa.me/<?= h($contact['whatsapp'] ?? '') ?>?text=<?= urlencode('I am interested in ' . $p['name']) ?>">WhatsApp</a><a href="tel:<?= h($contact['phone'] ?? '') ?>">Call now</a></div>
                            </div>
                        </article><?php endforeach; ?></div>
                <div class="catalog-empty" id="catalog-empty" hidden>
                    <h3>No matching machines found</h3>
                    <p>Try a different product name or category.</p>
                </div><?php else: ?><div class="catalog-empty">
                    <h3>No products added yet</h3>
                    <p>Dashboard mein Add Product details fill karke Publish Product click karein. Product yahan automatically show hoga.</p>
                </div><?php endif; ?>
        </div>
    </section>
</main>
<div class="enquiry-modal" id="enquiry-modal" aria-hidden="true">
    <div class="enquiry-dialog"><button class="enquiry-close" type="button">×</button><span>PRODUCT ENQUIRY</span>
        <h2>Request machine details</h2>
        <p id="enquiry-product-label"></p>
        <form action="sendmail.php" method="post"><input type="hidden" name="subject" value="Mohindra Mechanical Works Product Enquiry"><input type="hidden" name="product" id="enquiry-product"><input class="hp-field" name="website" tabindex="-1" autocomplete="off"><label>Your name *<input name="name" required></label><label>Email address *<input name="email" type="email" required></label><label>Phone number *<input name="phone" type="tel" required pattern="[0-9]{10}" maxlength="10"></label><label>Requirement *<textarea name="message" rows="4" required placeholder="Material, colours, width, speed or other requirements"></textarea></label><button type="submit">Send enquiry</button></form>
    </div>
</div>
<script>
    const q = document.getElementById('product-search'),
        cards = [...document.querySelectorAll('.catalog-card')],
        count = document.getElementById('visible-count'),
        empty = document.getElementById('catalog-empty');
    q?.addEventListener('input', () => {
        let n = 0,
            v = q.value.trim().toLowerCase();
        cards.forEach(c => {
            let show = c.dataset.search.includes(v);
            c.hidden = !show;
            if (show) n++
        });
        if (count) count.textContent = n;
        if (empty) empty.hidden = n !== 0
    });
    const modal = document.getElementById('enquiry-modal'),
        productInput = document.getElementById('enquiry-product'),
        productLabel = document.getElementById('enquiry-product-label');
    document.querySelectorAll('.card-enquiry').forEach(button => button.addEventListener('click', () => {
        productInput.value = button.dataset.product;
        productLabel.textContent = button.dataset.product;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false')
    }));
    document.querySelector('.enquiry-close')?.addEventListener('click', () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true')
    });
    modal?.addEventListener('click', event => {
        if (event.target === modal) document.querySelector('.enquiry-close').click()
    });
</script>
<?php include 'footer.php'; ?>
