const sendBtn = document.querySelector(".verify-resend");

sendBtn.addEventListener("click", async() =>{
	const resp = await fetch('/resendVerification', {
		method: "POST"
	});
	
	if (resp.status == 200){
		alert("Resent email! Please make sure to also check your spam folder.");
	}
	else{
		alert("Error resending email!");
	}	
});