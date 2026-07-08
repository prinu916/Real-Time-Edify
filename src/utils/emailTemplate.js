export const gmailContent = (verifyUrl, username) => {

    return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

<div style="
max-width:600px;
margin:40px auto;
background:white;
padding:40px;
border-radius:10px;
box-shadow:0 0 10px rgba(0,0,0,.1);
">

<h2>Hello ${username} 👋</h2>

<p>
Thank you for registering.
</p>

<p>
Click the button below to verify your email.
</p>

<div style="margin:30px 0;">

<a
href="${verifyUrl}"
style="
display:inline-block;
padding:14px 28px;
background:#4CAF50;
color:white;
text-decoration:none;
border-radius:6px;
font-weight:bold;
">
Verify Email
</a>

</div>

<p>
If button doesn't work copy this URL:
</p>

<p style="
word-break:break-all;
background:#eee;
padding:10px;
border-radius:5px;
">
${verifyUrl}
</p>

<hr>

<p style="color:gray;font-size:13px;">
This verification link expires in 24 hours.
</p>

</div>

</body>

</html>
`;
};

export const successFullVerification = (username) => {

    return `
<!DOCTYPE html>

<html>

<head>
<meta charset="UTF-8">
<title>Email Verified</title>
</head>

<body style="font-family:Arial;background:#f4f4f4;padding:30px;">

<div style="
max-width:600px;
margin:auto;
background:white;
padding:40px;
border-radius:10px;
text-align:center;
">

<h1 style="color:green;">
✅ Email Verified Successfully
</h1>

<h2>
Welcome ${username}
</h2>

<p>
Your account has been verified successfully.
</p>

<a
href="${process.env.FRONTEND_URL}/login"
style="
display:inline-block;
padding:12px 25px;
background:#4CAF50;
color:white;
text-decoration:none;
border-radius:6px;
">
Go To Login
</a>

<script>

setTimeout(()=>{

window.location.href="${process.env.FRONTEND_URL}/login";

},3000);

</script>

</div>

</body>

</html>
`;
};