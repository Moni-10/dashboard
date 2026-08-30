<?php
if(defined('MMW_ENQUIRY_MODAL_INCLUDED'))return;
define('MMW_ENQUIRY_MODAL_INCLUDED',true);
?>
<div class="enquiry-modal" id="enquiry-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="enquiry-modal-title">
    <div class="enquiry-dialog">
        <button class="enquiry-close" type="button" aria-label="Close enquiry form">&times;</button>
        <span>PRODUCT ENQUIRY</span>
        <h2 id="enquiry-modal-title">Request machine details</h2>
        <p>Tell us your requirement and our machine specialist will contact you.</p>
        <div class="enquiry-selected-product"><small>Selected product</small><strong id="enquiry-product-label">General machine enquiry</strong></div>
        <form action="sendmail.php" method="post" autocomplete="off">
            <input type="hidden" name="subject" value="Mohindra Mechanical Works Product Enquiry">
            <input type="hidden" name="product" id="enquiry-product" value="General machine enquiry">
            <input class="hp-field" name="website" tabindex="-1" autocomplete="off">
            <div class="enquiry-form-grid">
                <label>Your name *<input name="name" required autocomplete="name" placeholder="Enter your name"></label>
                <label>Email address *<input name="email" type="email" required autocomplete="email" placeholder="name@example.com"></label>
                <label>Phone number *<input name="phone" type="tel" required inputmode="numeric" pattern="[0-9]{10}" maxlength="10" placeholder="10 digit number"></label>
                <label>Company name<input name="company" autocomplete="organization" placeholder="Your company"></label>
            </div>
            <label>Requirement *<textarea name="message" rows="4" required placeholder="Material, printing width, number of colours, speed or other requirements"></textarea></label>
            <button type="submit">Send product enquiry <i class="fa-regular fa-arrow-right"></i></button>
            <small class="enquiry-privacy"><i class="fa-solid fa-lock"></i> Your details are sent securely to our sales team.</small>
        </form>
    </div>
</div>
<script>
document.addEventListener('DOMContentLoaded',()=>{
 const modal=document.getElementById('enquiry-modal'),input=document.getElementById('enquiry-product'),label=document.getElementById('enquiry-product-label'),close=document.querySelector('.enquiry-close');
 const hide=()=>{modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.style.overflow=''};
 document.querySelectorAll('.card-enquiry,[data-enquiry-product]').forEach(button=>button.addEventListener('click',()=>{const product=button.dataset.product||button.dataset.enquiryProduct||'General machine enquiry';input.value=product;label.textContent=product;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>modal.querySelector('input[name="name"]')?.focus(),100)}));
 close?.addEventListener('click',hide);modal?.addEventListener('click',event=>{if(event.target===modal)hide()});document.addEventListener('keydown',event=>{if(event.key==='Escape')hide()});
 const phone=modal?.querySelector('input[name="phone"]');phone?.addEventListener('input',()=>phone.value=phone.value.replace(/\D/g,'').slice(0,10));
});
</script>
