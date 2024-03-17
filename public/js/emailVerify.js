const sendBtn = document.querySelector(".verify-resend");
const BtnText = document.querySelector(".verify-resend > p");

sendBtn.addEventListener("click", async() =>{
	const resp = await fetch('/resendVerification', {
		method: "POST"
	});
	
	if (resp.status == 200){
		BtnText.innerHTML = "Resend Verification Email";		
		alert("Resent email! Please make sure to also check your spam folder.");
	}
	else{
		alert("Error resending email!");
	}	
});