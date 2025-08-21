<?php
// Set content type to JSON for API responses
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
if (empty($input['name']) || empty($input['email']) || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email, and message are required']);
    exit;
}

// Sanitize input data
$name = filter_var(trim($input['name']), FILTER_SANITIZE_STRING);
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = isset($input['phone']) ? filter_var(trim($input['phone']), FILTER_SANITIZE_STRING) : '';
$message = filter_var(trim($input['message']), FILTER_SANITIZE_STRING);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// SMTP Configuration
$smtp_host = 'smtp.hostinger.com';
$smtp_port = 465;
$smtp_username = 'info@jmrturrisfortisrealty.com';
$smtp_password = 'iH093gd*08i80SwI';
$smtp_encryption = 'ssl';

// Email configuration
$to_email = 'jmrrealestatemanagement@gmail.com';
$bcc_email = 'reyvillamar@gmail.com';
$subject = 'New Inquiry from JMR Turris Fortis Realty Website - ' . $name;

// Create email body
$email_body = "New inquiry received from JMR Turris Fortis Realty Corporation website:\n\n";
$email_body .= "Name: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
if (!empty($phone)) {
    $email_body .= "Phone: " . $phone . "\n";
}
$email_body .= "Message: " . $message . "\n\n";
$email_body .= "---\n";
$email_body .= "This inquiry was submitted through the JMR Turris Fortis Realty Corporation website.\n";
$email_body .= "Please respond promptly to maintain excellent customer service.";

// Function to send email via SMTP
function sendSMTPEmail($to, $bcc, $subject, $body, $from_email, $from_name, $reply_to) {
    global $smtp_host, $smtp_port, $smtp_username, $smtp_password, $smtp_encryption;
    
    // Create socket connection
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = stream_socket_client(
        "ssl://{$smtp_host}:{$smtp_port}",
        $errno, $errstr, 30, STREAM_CLIENT_CONNECT, $context
    );
    
    if (!$socket) {
        return false;
    }
    
    // Read server response
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) != '220') {
        fclose($socket);
        return false;
    }
    
    // Send EHLO
    fwrite($socket, "EHLO " . $smtp_host . "\r\n");
    $response = fgets($socket, 515);
    
    // Send AUTH LOGIN
    fwrite($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 515);
    
    // Send username
    fwrite($socket, base64_encode($smtp_username) . "\r\n");
    $response = fgets($socket, 515);
    
    // Send password
    fwrite($socket, base64_encode($smtp_password) . "\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) != '235') {
        fclose($socket);
        return false;
    }
    
    // Send MAIL FROM
    fwrite($socket, "MAIL FROM: <{$smtp_username}>\r\n");
    $response = fgets($socket, 515);
    
    // Send RCPT TO
    fwrite($socket, "RCPT TO: <{$to}>\r\n");
    $response = fgets($socket, 515);
    
    // Send RCPT TO for BCC
    fwrite($socket, "RCPT TO: <{$bcc}>\r\n");
    $response = fgets($socket, 515);
    
    // Send DATA
    fwrite($socket, "DATA\r\n");
    $response = fgets($socket, 515);
    
    // Send email headers and body
    $email_data = "From: {$from_name} <{$from_email}>\r\n";
    $email_data .= "To: <{$to}>\r\n";
    $email_data .= "Bcc: <{$bcc}>\r\n";
    $email_data .= "Reply-To: <{$reply_to}>\r\n";
    $email_data .= "Subject: {$subject}\r\n";
    $email_data .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $email_data .= "X-Mailer: PHP SMTP Client\r\n";
    $email_data .= "\r\n";
    $email_data .= $body;
    $email_data .= "\r\n.\r\n";
    
    fwrite($socket, $email_data);
    $response = fgets($socket, 515);
    
    // Send QUIT
    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    
    return substr($response, 0, 3) == '250';
}

// Send email using SMTP
if (sendSMTPEmail($to_email, $bcc_email, $subject, $email_body, $smtp_username, 'JMR Turris Fortis Realty', $email)) {
    echo json_encode(['success' => true, 'message' => 'Thank you for your inquiry! We will contact you soon.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again later.']);
}
?>