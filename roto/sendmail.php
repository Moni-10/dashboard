<?php

function wants_json_response()
{
    $accept = isset($_SERVER['HTTP_ACCEPT']) ? strtolower($_SERVER['HTTP_ACCEPT']) : '';
    return strpos($accept, 'application/json') !== false;
}

function send_response($success, $message, $status_code = 200)
{
    if (wants_json_response()) {
        http_response_code($status_code);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => $success,
            'message' => $message,
        ]);

        exit;
    }

    if ($success) {
        header('Location: thankyou.php', true, 303);
        exit;
    }

    http_response_code($status_code);
    echo 'error: ' . $message;

    exit;
}

function post_value($keys)
{
    foreach ((array) $keys as $key) {
        if (isset($_POST[$key])) {
            return trim((string) $_POST[$key]);
        }
    }

    return '';
}

function clean_header_value($value)
{
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $value));
}

function html_value($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

$request_method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : '';

if ($request_method !== 'POST') {
    send_response(false, 'Invalid request method.', 405);
}

$name = post_value('name');
$company = post_value(['company', 'companyname']);
$email = post_value('email');
$phone = post_value(['phone', 'phonenumber']);
$product = post_value('product');
$message = post_value('message');
$subject = post_value('subject');
$source = strtolower(post_value('source'));
$is_whatsapp_enquiry = $source === 'whatsapp';

if ($subject === '') {
    $subject = $is_whatsapp_enquiry
        ? 'Mohindra Mechanical Works WhatsApp Enquiry'
        : 'Mohindra Mechanical Works Website Enquiry';
}

if (strcasecmp($product, 'Select Product') === 0) {
    $product = '';
}

$phone_digits = preg_replace('/\D+/', '', $phone);

if ($is_whatsapp_enquiry) {
    if ($product === '') {
        $product = 'WhatsApp Enquiry';
    }

    if ($message === '') {
        $message = 'Customer requested WhatsApp contact.';
    }
}

if ($name === '' || $phone_digits === '' || (!$is_whatsapp_enquiry && ($email === '' || $product === '' || $message === ''))) {
    send_response(false, 'Please fill all required fields.', 422);
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_response(false, 'Invalid email address.', 422);
}

if (!preg_match('/^[0-9]{10}$/', $phone_digits)) {
    send_response(false, 'Invalid phone number. Please enter 10 digits.', 422);
}

$to_email = 'nishu.mohindra@gmail.com, laxmi.mohindra20@gmail.com';
$from_email = 'no-reply@mohindramechanicalworks.com';
$from_name = 'Mohindra Mechanicalworks Website New Enquiry';
$safe_subject = clean_header_value($subject);
$safe_name = clean_header_value($name);

$body = '
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <title>' . html_value($safe_subject) . '</title>
</head>
<body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
  <h2 style="margin: 0 0 16px;">New Website Enquiry</h2>
  <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 640px;">
    <tr>
      <td style="font-weight: bold; width: 150px; border: 1px solid #ddd;">Name</td>
      <td style="border: 1px solid #ddd;">' . html_value($name) . '</td>
    </tr>
    <tr>
      <td style="font-weight: bold; border: 1px solid #ddd;">Company</td>
      <td style="border: 1px solid #ddd;">' . html_value($company) . '</td>
    </tr>
    <tr>
      <td style="font-weight: bold; border: 1px solid #ddd;">Email</td>
      <td style="border: 1px solid #ddd;">' . html_value($email) . '</td>
    </tr>
    <tr>
      <td style="font-weight: bold; border: 1px solid #ddd;">Phone</td>
      <td style="border: 1px solid #ddd;">' . html_value($phone_digits) . '</td>
    </tr>
    <tr>
      <td style="font-weight: bold; border: 1px solid #ddd;">Product</td>
      <td style="border: 1px solid #ddd;">' . html_value($product) . '</td>
    </tr>
    <tr>
      <td style="font-weight: bold; border: 1px solid #ddd;">Message</td>
      <td style="border: 1px solid #ddd;">' . nl2br(html_value($message)) . '</td>
    </tr>
  </table>
</body>
</html>';

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: ' . clean_header_value($from_name) . ' <' . $from_email . '>',
    'X-Mailer: PHP/' . phpversion(),
];

if ($email !== '') {
    $headers[] = 'Reply-To: ' . $safe_name . ' <' . $email . '>';
}

$header_text = implode("\r\n", $headers);
$extra_params = stripos(PHP_OS, 'WIN') === 0 ? '' : '-f ' . $from_email;

if ($extra_params !== '') {
    $sent = @mail($to_email, $safe_subject, $body, $header_text, $extra_params);
} else {
    $sent = @mail($to_email, $safe_subject, $body, $header_text);
}

if (!$sent) {
    send_response(false, 'Mail server failed. Please check hosting PHP mail or SMTP settings.', 500);
}

send_response(true, 'success');
