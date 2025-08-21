<?php
// Enable error reporting for debugging (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

// Validate required fields
if (empty($input['name']) || empty($input['email']) || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit;
}

// Sanitize input data
$name = filter_var(trim($input['name']), FILTER_SANITIZE_STRING);
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = isset($input['phone']) ? filter_var(trim($input['phone']), FILTER_SANITIZE_STRING) : 'Not provided';
$message = filter_var(trim($input['message']), FILTER_SANITIZE_STRING);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Email configuration
$to_email = 'jmrrealestatemanagement@gmail.com';
$bcc_email = 'reyvillamar@gmail.com';
$subject = 'New Inquiry from ' . $name . ' - JMR Turris Fortis';

// Create email body
$email_body = "New inquiry received from JMR Turris Fortis website:\n\n";
$email_body .= "Name: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Phone: " . $phone . "\n";
$email_body .= "\nMessage:\n" . $message . "\n\n";
$email_body .= "---\n";
$email_body .= "This email was sent from the JMR Turris Fortis website contact form.\n";
$email_body .= "Date: " . date('Y-m-d H:i:s') . "\n";

// Email headers
$headers = array();
$headers[] = 'From: JMR Turris Fortis <noreply@jmrturrisfortis.com>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Bcc: ' . $bcc_email;
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

// Send email
try {
    $mail_sent = mail($to_email, $subject, $email_body, implode("\r\n", $headers));
    
    if ($mail_sent) {
        // Log successful submission (optional)
        error_log("Contact form submission from: " . $email . " at " . date('Y-m-d H:i:s'));
        
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you for your inquiry! We will contact you soon.'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
} catch (Exception $e) {
    error_log("Email sending failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Sorry, there was an error sending your message. Please try again later.'
    ]);
}
?>