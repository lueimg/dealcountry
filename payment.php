<?php 

// require_once 'anet_php_sdk/AuthorizeNet.php'; // The SDK
// $url = "http://dealcountry.com/payment.php";
// $api_login_id = '4uTKya5H8P';
// $transaction_key = 'Key7k86Tt98W2hU8V7N';
// $md5_setting = "e2727f1e454c6f5eb3a93c4257bca41f"; // Your MD5 Setting
// $amount = "5.99";
// AuthorizeNetDPM::directPostDemo($url, $api_login_id, $transaction_key, $amount, $md5_setting);


 ?>


<?php
// require_once 'anet_php_sdk/AuthorizeNet.php'; // Make sure this path is correct.
// $transaction = new AuthorizeNetAIM('3LunE32TE4', '977n9uYxMk866Uev');
// $transaction->amount = '19.99';
// $transaction->card_num = '4111111111111111';
// $transaction->exp_date = '01/15';

// $response = $transaction->authorizeAndCapture();

// if ($response->approved) {
//   echo "<h1>Success! The test credit card has been charged!</h1>";
//   echo "Transaction ID: " . $response->transaction_id;
// } else {
//   echo $response->error_message;
// }
?>


<?php
require_once 'anet_php_sdk/AuthorizeNet.php'; // Include the SDK you downloaded in Step 2
$api_login_id = '3LunE32TE4';
$transaction_key = '977n9uYxMk866Uev';
$amount = "15.99";
$fp_timestamp = time();
$fp_sequence = "123" . time(); // Enter an invoice or other unique number.
$fingerprint = AuthorizeNetSIM_Form::getFingerprint($api_login_id,
  $transaction_key, $amount, $fp_sequence, $fp_timestamp)
?>

<form method='post' action="https://secure.authorize.net/gateway/transact.dll">
<input type='hidden' name="x_login" value="<?php echo $api_login_id?>" />
<input type='hidden' name="x_fp_hash" value="<?php echo $fingerprint?>" />
<input type='hidden' name="x_amount" value="<?php echo $amount?>" />
<input type='hidden' name="x_fp_timestamp" value="<?php echo $fp_timestamp?>" />
<input type='hidden' name="x_fp_sequence" value="<?php echo $fp_sequence?>" />
<input type='hidden' name="x_version" value="3.1">
<input type='hidden' name="x_show_form" value="payment_form">
<input type='hidden' name="x_test_request" value="false" />
<input type='hidden' name="x_method" value="cc">
<input type='submit' value="Click here for the secure payment form">
</form>

 <?php
// require_once 'anet_php_sdk/AuthorizeNet.php'; // Include the SDK you downloaded in Step 2
// $api_login_id = '3LunE32TE4';
// $transaction_key = '7wUwB7337Jge8A4m';
// $amount = "5.99";
// $fp_timestamp = time();
// $fp_sequence = "123" . time(); // Enter an invoice or other unique number.
// $fingerprint = AuthorizeNetSIM_Form::getFingerprint($api_login_id,
//   $transaction_key, $amount, $fp_sequence, $fp_timestamp);
?>

<!-- <form method='post' action="https://test.authorize.net/gateway/transact.dll"> -->
<!-- <form method='post' action="https://developer.authorize.net/tools/paramdump/index.php"> -->
<!-- <form method='post' action="https://secure.authorize.net/gateway/transact.dll">
<input type='hidden' name="x_login" value="<?php echo $api_login_id?>" />
<input type='hidden' name="x_fp_hash" value="<?php echo $fingerprint?>" />
<input type='hidden' name="x_amount" value="<?php echo $amount?>" />
<input type='hidden' name="x_fp_timestamp" value="<?php echo $fp_timestamp?>" />
<input type='hidden' name="x_fp_sequence" value="<?php echo $fp_sequence?>" />
<input type='hidden' name="x_version" value="3.1">
<input type='hidden' name="x_show_form" value="payment_form">
<input type='hidden' name="x_test_request" value="true" />
<input type='hidden' name="x_method" value="cc">
<input type='submit' value="Click here for the secure payment form">
</form> -->



<?php
// require_once 'anet_php_sdk/AuthorizeNet.php'; // Make sure this path is correct.
// define("AUTHORIZENET_SANDBOX", true);
// $transaction = new AuthorizeNetAIM('3LunE32TE4', '7wUwB7337Jge8A4m');
// $transaction->amount = '9.99';
// $transaction->card_num = '4007000000027';
// $transaction->exp_date = '10/16';

// $response = $transaction->authorizeAndCapture();

// if ($response->approved) {
//   echo "<h1>Success! The test credit card has been charged!</h1>";
//   echo "Transaction ID: " . $response->transaction_id;
// } else {
//   echo $response->error_message;
// }
?>



<?php 

// require_once 'anet_php_sdk/AuthorizeNet.php'; 
// define("AUTHORIZENET_API_LOGIN_ID", "4uTKya5H8P"); 
// define("AUTHORIZENET_TRANSACTION_KEY", "Key7k86Tt98W2hU8V7N"); 
// define("AUTHORIZENET_SANDBOX", true); 
// $sale = new AuthorizeNetAIM; $sale->amount = "5.99"; 
// $sale->card_num = '6011000000000012'; 
// $sale->exp_date = '04/15'; 
// $response = $sale->authorizeAndCapture(); 
// if ($response->approved) { $transaction_id = $response->transaction_id; }

 ?>


