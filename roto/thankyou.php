<?php
$pageTitle = 'Thank You | Mohindra Mechanical Works';
$metaDescription = 'Thank you for contacting Mohindra Mechanical Works. Our team will respond to your enquiry shortly.';
include __DIR__ . '/header.php';
?>

<main class="thank-page">
    <section class="thank-hero">
        <div class="thank-pattern" aria-hidden="true"></div>
        <div class="container">
            <div class="thank-card">
                <div class="thank-status" aria-hidden="true">
                    <i class="fa-solid fa-check"></i>
                </div>

                <span class="thank-eyebrow">Enquiry submitted successfully</span>
                <h1>Thank you for<br><em>contacting us.</em></h1>
                <p class="thank-lead">
                    Your enquiry has been received by Mohindra Mechanical Works. Our team will review your
                    requirements and contact you shortly.
                </p>

                <div class="thank-steps">
                    <div class="thank-step">
                        <span>01</span>
                        <div>
                            <strong>Request received</strong>
                            <p>Your details have been submitted securely.</p>
                        </div>
                    </div>
                    <div class="thank-step">
                        <span>02</span>
                        <div>
                            <strong>Expert review</strong>
                            <p>Our machine specialist will review your requirement.</p>
                        </div>
                    </div>
                    <div class="thank-step">
                        <span>03</span>
                        <div>
                            <strong>Quick response</strong>
                            <p>We will connect with you by phone or email shortly.</p>
                        </div>
                    </div>
                </div>

                <div class="thank-actions">
                    <a class="thank-btn thank-btn-primary" href="products.php">
                        Explore our machines <i class="fa-regular fa-arrow-right"></i>
                    </a>
                    <a class="thank-btn thank-btn-outline" href="index.php">
                        <i class="fa-regular fa-house"></i> Back to home
                    </a>
                </div>

                <div class="thank-contact">
                    <span>Need immediate assistance?</span>
                    <a href="tel:+919988440777"><i class="fa-solid fa-phone"></i> +91 99884 40777</a>
                    <a href="https://wa.me/919988440777" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp us
                    </a>
                </div>
            </div>
        </div>
    </section>
</main>

<?php include __DIR__ . '/footer.php'; ?>
