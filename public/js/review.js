let doc = document;
let reviewButton = doc.querySelector(".review-add-submit");
let addButton = doc.querySelector("#add-review-button");
let delButton = doc.querySelector("#delBtn");
let editButton = doc.querySelector("#editBtn");

if(editButton != null && delButton != null){ //User already has a review & is logged in
	addButton.innerHTML = "<p>Edit Review</p>"
	
	//editbutton click listener
	editButton.addEventListener('click', setPromptEdit);
	addButton.addEventListener('click', setPromptEdit);
	
	//deletebutton click listener
	delButton.addEventListener('click', setPromptDelete);
	
	/*reviewButton.addEventListener('click', async function(){
		
	});*/
	
}
else{
	addButton.addEventListener('click', toggleReview);
	reviewButton.addEventListener('click', async function add(){
		//check if logged in
		if(!doc.querySelector("form[action='/logout']")){
			window.location.href = '/login?';
		}
		
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
}

async function edit(){
	
}
async function del(){
	let id = doc.querySelector('#p_id').value;
	let res = await fetch('/delReview', {
		method: "POST",
		body: JSON.stringify({id}),
		headers: {
			"Content-Type": "application/json"
		}
	});
	if(res.status == 200){
		alert("Succesfully deleted your review!");
		location.reload();
	}
	else{
		alert("Error!");
	}
}

async function setPromptDelete(){
	doc.querySelector('.review-add-title').innerHTML = "Are you sure you want to delete your review?";
	//If there, remove input areas
	doc.querySelector('.review-input-header').style.display="none";
	doc.querySelector('.review-input-rating').style.display="none";
	doc.querySelector('.review-input-content').style.display="none";
	
	reviewButton.innerHTML = "Delete";
	reviewButton.removeEventListener('click', edit);
	reviewButton.addEventListener('click', del);
	
	toggleReview(event);
}

async function setPromptEdit(){
	//if gone, bring back input areas
	doc.querySelector('.review-input-header').style.display="block";
	doc.querySelector('.review-input-rating').style.display="block";
	doc.querySelector('.review-input-content').style.display="block";
	
	//Change prompt text
	doc.querySelector('.review-add-title').innerHTML = "Update your review";
	
	//get user rating
	let userRating = parseInt(doc.querySelector("#userReviewRating").value);
	
	//get input areas
	let header = doc.querySelector(".header-textbox");
	let content = doc.querySelector(".content-textbox");
	let ratingQuery = "input[value='" + userRating + "']";
	let rating = doc.querySelector(ratingQuery);
	
	//fill input areas with old data
	header.innerHTML = doc.querySelector("#userReviewHeader").innerHTML.trim();
	content.innerHTML = doc.querySelector("#userReviewContent").innerHTML.trim();
	rating.setAttribute("checked","");
	
	//review button event change
	reviewButton.innerHTML = "Update";
	reviewButton.removeEventListener('click', del); //from delete
	reviewButton.addEventListener('click', edit);
	
	toggleReview(event);
}