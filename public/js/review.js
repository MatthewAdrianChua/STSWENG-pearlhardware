let doc = document;
let reviewButton = doc.querySelector(".review-add-submit");

reviewButton.addEventListener('click', async function(){
	//check if logged in
	if(!doc.querySelector("form[action='/logout']")){
		window.location.href = '/login?';
	}
	
	//we're missing ratings lol
	let id = doc.querySelector('#p_id').value;
	let header = doc.querySelector('.header-textbox').value;
	let content = doc.querySelector('.content-textbox').value;
	let rating = doc.querySelector("input[type='radio']:checked");
	if(rating == null){
		console.log("oh no! RATING WAS NULL!");
		rating = 1;
	}
	else{
		rating = rating.value;
	}
	//we should be able to pass a flag for anonymous rating
	let data = JSON.stringify({header, content, id, rating});
	
	let res = await fetch('/addReview', {
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/json"
        }
    });
	
	if(res.status == 200){
		alert("Succesfully posted review!");
		location.reload();
	}
	else{
		alert("Error!");
	}
	
});