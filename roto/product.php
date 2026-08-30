<?php
require_once __DIR__ . '/lib/bootstrap.php';
$product = product_by_slug($_GET['slug'] ?? '');
$contact = contact_config();
if (!$product || empty($product['active'])) {
    http_response_code(404);
    $pageTitle = 'Product not found';
    $metaDescription = 'The requested product could not be found.';
    include 'header.php';
    echo '<main><section class="section-space"><div class="container"><h1>Product not found</h1><p>This machine is not available.</p><a href="products.php">View all machines</a></div></section></main>';
    include 'footer.php';
    exit;
}
$pageTitle = $product['seo_title'] ?: $product['name'];
$metaDescription = $product['seo_description'] ?: $product['short_description'];
$metaKeywords = $product['seo_keywords'] ?? '';
$gallery = array_values(array_unique(array_filter(array_merge([$product['image'] ?? ''], $product['gallery'] ?? []))));
$specifications = array_values(array_filter($product['specifications'] ?? [], fn($row) => trim((string)($row['name'] ?? '')) !== '' || trim((string)($row['value'] ?? '')) !== ''));
$showcaseCards = array_values($product['showcase_cards'] ?? []);
if(!empty($product['video_url']))$showcaseCards[]=['title'=>$product['video_heading'] ?: 'Machine demonstration','description'=>$product['video_description'] ?? '','type'=>'video','video_url'=>$product['video_url'],'image'=>'','alt'=>$product['video_heading'] ?: $product['name']];
$applicationCards=array_values(array_filter($showcaseCards,fn($card)=>($card['type']??'image')!=='video'&&!empty($card['image'])));
$videoCards=array_values(array_filter($showcaseCards,fn($card)=>($card['type']??'image')==='video'&&!empty($card['video_url'])));
function youtube_thumbnail(string $url): string { if(preg_match('~(?:v=|youtu\.be/|shorts/)([A-Za-z0-9_-]{6,})~',$url,$match))return 'https://img.youtube.com/vi/'.$match[1].'/hqdefault.jpg';return ''; }
include 'header.php';
?>
<main class="showroom-page">
    <section class="showroom-top">
        <div class="container">
            <nav class="showroom-breadcrumb"><a href="index.php">Home</a><span>/</span><a href="products.php">Our Machines</a><span>/</span><strong><?= h($product['name']) ?></strong></nav>
            <div class="showroom-grid">
                <?php if($gallery || !empty($product['video_url']) || !empty($product['brochure'])):?><div class="showroom-gallery">
                    <div class="showroom-thumbs">
                        <?php foreach ($gallery as $index => $photo): ?><button class="showroom-thumb <?= $index === 0 ? 'active' : '' ?>" type="button" data-image="<?= h($photo) ?>"><img src="<?= h($photo) ?>" alt="<?= h($product['name']) ?> view <?= ($index + 1) ?>"></button><?php endforeach; ?>
                        <?php if (!empty($product['video_url'])): ?><a class="showroom-media-tile video" href="<?= h($product['video_url']) ?>" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i><small>Video</small></a><?php endif; ?>
                        <?php if (!empty($product['brochure'])): ?><a class="showroom-media-tile pdf" href="<?= h($product['brochure']) ?>" target="_blank"><i class="fa-solid fa-file-pdf"></i><small>PDF</small></a><?php endif; ?></div>
                    <?php if($gallery):?><div class="showroom-main-image"><img id="showroom-main-image" src="<?= h($gallery[0]) ?>" alt="<?= h($product['name']) ?>"><span>Click thumbnails to view</span></div><?php endif;?>
                </div><?php endif;?>
                <article class="showroom-info"><?php if(!empty($product['category'])):?><span class="showroom-label"><?= h($product['category']) ?></span><?php endif;?>
                    <h1><?= h($product['hero_heading'] ?: $product['name']) ?></h1>
                    <?php if (!empty($product['hero_subheading']) || !empty($product['short_description'])): ?><p class="showroom-summary"><?= h($product['hero_subheading'] ?: $product['short_description']) ?></p><?php endif; ?>
                    <dl class="showroom-taxonomy"><?php if (!empty($product['category'])): ?><div>
                                <dt>Category</dt>
                                <dd><?= h($product['category']) ?></dd>
                            </div><?php endif; ?><?php if (!empty($product['group'])): ?><div>
                                <dt>Product group</dt>
                                <dd><?= h($product['group']) ?></dd>
                            </div><?php endif; ?></dl>
                    <?php if(!empty(trim(strip_tags((string)($product['description']??''))))):?><div class="showroom-mini-description"><?= $product['description'] ?></div><?php endif;?>
                    <div class="showroom-actions"><button type="button" class="showroom-enquiry card-enquiry" data-product="<?= h($product['name']) ?>"><i class="fa-regular fa-envelope"></i> Send enquiry</button><a class="showroom-whatsapp" target="_blank" rel="noopener" href="https://wa.me/<?= h($contact['whatsapp'] ?? '') ?>?text=<?= urlencode('I am interested in ' . $product['name']) ?>"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a><a class="showroom-call" href="tel:<?= h($contact['phone'] ?? '') ?>"><i class="fa-solid fa-phone"></i> Call now</a></div>
                </article>
            </div>
        </div>
    </section>
    <?php if(!empty(trim(strip_tags((string)($product['description']??'')))) || $specifications):?><section class="showroom-details">
        <div class="container">
            <div class="showroom-detail-grid">
                <?php if(!empty(trim(strip_tags((string)($product['description']??''))))):?><article class="showroom-copy"><span class="showroom-label">PRODUCT OVERVIEW</span>
                    <h2><?= h($product['name']) ?></h2>
                    <div class="product-description"><?= $product['description'] ?></div>
                </article><?php endif;?>
                <?php if($specifications):?><aside class="showroom-specs">
                    <div class="showroom-spec-head"><span>TECHNICAL DATA</span>
                        <h3>Machine specifications</h3>
                    </div><?php foreach ($specifications as $s): ?><div class="showroom-spec-row"><span><?= h($s['name'] ?? '') ?></span><strong><?= h($s['value'] ?? '') ?></strong></div><?php endforeach; ?>
                </aside><?php endif;?>
            </div>
        </div>
    </section><?php endif;?>
    <?php if($applicationCards):?><section class="product-showcase application-showcase"><div class="container"><div class="product-showcase-heading"><span class="showroom-label">FINISHED PRODUCTS & APPLICATIONS</span><h2>What this machine can produce</h2><p>Images and details of products manufactured with this machine.</p></div><div class="product-showcase-grid"><?php foreach($applicationCards as $card):$media=$card['image']??'';?><a class="product-showcase-card" href="<?=h($media?:'#')?>" data-showcase-image="<?=h($media)?>"><div class="product-showcase-media"><?php if($media!==''):?><img src="<?=h($media)?>" alt="<?=h($card['alt']?:$card['title'])?>"><?php endif;?></div><div class="product-showcase-body"><span>FINISHED PRODUCT</span><h3><?=h($card['title']??'')?></h3><?php if(!empty($card['description'])):?><p><?=h($card['description'])?></p><?php endif;?></div></a><?php endforeach;?></div></div></section><?php endif;?>
    <?php if($videoCards):?><section class="product-showcase youtube-showcase"><div class="container"><div class="product-showcase-heading"><span class="showroom-label">MACHINE VIDEOS</span><h2>Watch the machine in operation</h2><p>Demonstrations and production videos added from the dashboard.</p></div><div class="product-showcase-grid"><?php foreach($videoCards as $card):$media=$card['image']??'';if($media==='')$media=youtube_thumbnail((string)($card['video_url']??''));?><a class="product-showcase-card video-card" href="<?=h($card['video_url']??'#')?>" target="_blank" rel="noopener"><div class="product-showcase-media"><?php if($media!==''):?><img src="<?=h($media)?>" alt="<?=h($card['alt']?:$card['title'])?>"><?php endif;?><span class="product-showcase-play"><i class="fa-solid fa-play"></i></span></div><div class="product-showcase-body"><span>YOUTUBE VIDEO</span><h3><?=h($card['title']??'')?></h3><?php if(!empty($card['description'])):?><p><?=h($card['description'])?></p><?php endif;?></div></a><?php endforeach;?></div></div></section><?php endif;?>
    <?php if(!empty($product['features'])):?><section class="landing-features"><div class="container"><div class="landing-section-title"><span>PRODUCT FEATURES</span><h2>Engineered around your production</h2><p>Performance advantages and capabilities configured for this machine.</p></div><div class="landing-feature-grid"><?php foreach($product['features'] as $index=>$feature):?><article><b><?=str_pad((string)($index+1),2,'0',STR_PAD_LEFT)?></b><i class="fa-solid fa-gears"></i><h3><?=h($feature['title']??'')?></h3><p><?=h($feature['description']??'')?></p></article><?php endforeach;?></div></div></section><?php endif;?>
    <?php if(!empty($product['steps'])):?><section class="landing-process"><div class="container"><div class="landing-section-title"><span>HOW IT WORKS</span><h2>A clear production process</h2></div><div class="landing-step-grid"><?php foreach($product['steps'] as $index=>$step):?><article><strong><?=str_pad((string)($index+1),2,'0',STR_PAD_LEFT)?></strong><h3><?=h($step['title']??'')?></h3><p><?=h($step['description']??'')?></p></article><?php endforeach;?></div></div></section><?php endif;?>
    <?php if(!empty($product['testimonials'])):?><section class="landing-reviews"><div class="container"><div class="landing-section-title"><span>CUSTOMER REVIEWS</span><h2>Trusted by production teams</h2></div><div class="landing-review-grid"><?php foreach($product['testimonials'] as $review):?><article><div class="review-stars">★★★★★</div><blockquote>“<?=h($review['quote']??'')?>”</blockquote><strong><?=h($review['name']??'')?></strong><small><?=h($review['role']??'')?></small></article><?php endforeach;?></div></div></section><?php endif;?>
    <?php if(!empty($product['faqs'])):?><section class="landing-faq"><div class="container"><div class="landing-section-title"><span>QUICK FAQS</span><h2>Frequently asked questions</h2></div><div class="landing-faq-list"><?php foreach($product['faqs'] as $index=>$faq):?><details <?=$index===0?'open':''?>><summary><b><?=str_pad((string)($index+1),2,'0',STR_PAD_LEFT)?></b><?=h($faq['question']??'')?><i class="fa-solid fa-plus"></i></summary><p><?=h($faq['answer']??'')?></p></details><?php endforeach;?></div></div></section><?php endif;?>
</main>
<div class="enquiry-modal" id="enquiry-modal" aria-hidden="true">
    <div class="enquiry-dialog"><button class="enquiry-close" type="button">&times;</button><span>PRODUCT ENQUIRY</span>
        <h2>Request machine details</h2>
        <p id="enquiry-product-label"></p>
        <form action="sendmail.php" method="post"><input type="hidden" name="subject" value="Mohindra Mechanical Works Product Enquiry"><input type="hidden" name="product" id="enquiry-product"><input class="hp-field" name="website" tabindex="-1" autocomplete="off"><label>Your name *<input name="name" required></label><label>Email address *<input name="email" type="email" required></label><label>Phone number *<input name="phone" type="tel" required pattern="[0-9]{10}" maxlength="10"></label><label>Requirement *<textarea name="message" rows="4" required placeholder="Material, width, colours, speed or other requirement"></textarea></label><button type="submit">Send enquiry</button></form>
    </div>
</div>
<script>
    document.querySelectorAll('.showroom-thumb').forEach(thumb => thumb.addEventListener('click', () => {
        document.querySelectorAll('.showroom-thumb').forEach(item => item.classList.remove('active'));
        thumb.classList.add('active');
        document.getElementById('showroom-main-image').src = thumb.dataset.image
    }));
    const modal = document.getElementById('enquiry-modal'),
        button = document.querySelector('.card-enquiry'),
        closeButton = document.querySelector('.enquiry-close');
    button?.addEventListener('click', () => {
        document.getElementById('enquiry-product').value = button.dataset.product;
        document.getElementById('enquiry-product-label').textContent = button.dataset.product;
        modal.classList.add('open')
    });
    closeButton?.addEventListener('click', () => modal.classList.remove('open'));
    modal?.addEventListener('click', event => {
        if (event.target === modal) closeButton.click()
    });
</script>
<?php include 'footer.php'; ?>
